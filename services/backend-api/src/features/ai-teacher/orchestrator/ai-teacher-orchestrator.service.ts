/**
 * P8-062: Build AI Teacher Orchestrator (Group G — AI Teacher Backend
 * Pipeline). Coordinates a single AI Teacher chat turn across the
 * already-built Group D/E/F seams, plus the P18 governance gates:
 *   0. Cost/quota gate (P18-030) — `AiCostQuotaService.checkQuota()` runs
 *      before any provider call; a denied quota throws `AiQuotaExceededError`.
 *   0b. Input safety gate (P18-029) — `AiTeacherSafetyService.checkInput()`
 *      runs on the persisted student message before any provider call; a
 *      blocked outcome throws `AiInputBlockedError`. Fails closed.
 *   1. Context (Group D) — backend-approved, read-only context snapshot.
 *   2. Prompt (Group E) — structured prompt assembled from that context.
 *   3. Provider (Group F) — secret-safety guard, bounded timeout/retry,
 *      and the AI provider call itself via `AI_PROVIDER_GATEWAY`. Usage is
 *      recorded via `AiCostQuotaService.recordUsage()` immediately after.
 *   4. Safety (Group F) — any non-success provider response is converted
 *      into the fixed, student-safe fallback reply before it ever leaves
 *      this service.
 *   4b. Response safety filter (P8-066) — the resulting reply text is
 *      checked again for a learning-authority violation, a leaked
 *      secret, or unsafe content before it is ever persisted or
 *      returned, guaranteeing only a safety-filtered reply is ever
 *      stored as conversation history (P8-067).
 *   5. Persistence (Group C/F) — the student message, the AI Teacher
 *      reply, the context snapshot used to build it, and provider call
 *      metadata are each persisted via their existing repositories.
 *
 * This service performs no database access of its own and computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * — those remain exclusively assembled upstream by the Context Builder
 * from AIM Engine / curriculum / student-profile services
 * (docs/phase-8/no-aim-replacement-rule.md). The provider API key is
 * never read, logged, or included in any value this service returns
 * (docs/phase-8/no-client-ai-provider-rule.md).
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { ContextBuilderService } from '../context-builder/context-builder.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { AiChatMessageRepository } from '../repositories/ai-chat-message.repository';
import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';
import { LessonTeachingStageService } from './lesson-teaching-stage.service';
import {
  AI_PROVIDER_GATEWAY,
  AiProviderGateway,
} from '../provider-gateway/ai-provider-gateway.interface';
import { ProviderGatewayNoSecretCheckService } from '../provider-gateway/provider-gateway-no-secret-check.service';
import { ProviderGatewayTimeoutPolicyService } from '../provider-gateway/provider-gateway-timeout-policy.service';
import { ProviderGatewaySafeFailureService } from '../provider-gateway/provider-gateway-safe-failure.service';
import { ProviderGatewayLoggingService } from '../provider-gateway/provider-gateway-logging.service';
import { ResponseSafetyFilterService } from '../response-safety/response-safety-filter.service';
import { RateLimitPolicyService } from '../rate-limit-policy/rate-limit-policy.service';
import { AiTeacherSafetyService } from '../governance/ai-teacher-safety.service';
import { AiCostQuotaService } from '../governance/ai-cost-quota.service';
import { ModelConfigService } from '../governance/model-config.service';
import { AiInputBlockedError } from '../governance/ai-input-blocked.error';
import { AiQuotaExceededError } from '../governance/ai-quota-exceeded.error';
import { AI_TEACHER_GREETING_INSTRUCTION } from '../prompt-builder/prompt-builder.constants';
import {
  ChatTurnInput,
  ChatTurnResult,
  GenerateGreetingInput,
  GenerateGreetingResult,
} from './ai-teacher-orchestrator.types';

// P18-fix: fixed per-turn cost estimate used for the pre-call quota check
// and the post-call usage record. No token-based cost calculator exists
// yet; this conservative flat estimate is enough to enforce the daily/
// monthly budget gate without inventing a new costing engine out of scope.
const ESTIMATED_COST_PER_TURN_USD = 0.01;

// Bounds how many recent turns are re-sent as conversation memory on every
// call — enough for the AI Teacher to remember what it already
// taught/asked this session without prompt size growing unbounded on a
// long-running conversation.
//
// Raised from 20 to 50 alongside AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION
// (rate-limit-policy.constants.ts, now 60): at 20, a lesson running past
// ~10 exchanges scrolled its own early turns out of the model's memory,
// which is exactly what caused it to re-explain/re-ask things it already
// covered earlier in the same session.
const CONVERSATION_HISTORY_TURN_LIMIT = 50;

@Injectable()
export class AiTeacherOrchestratorService {
  private readonly logger = new Logger(AiTeacherOrchestratorService.name);

  constructor(
    private readonly contextBuilder: ContextBuilderService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly noSecretCheck: ProviderGatewayNoSecretCheckService,
    private readonly timeoutPolicy: ProviderGatewayTimeoutPolicyService,
    private readonly safeFailure: ProviderGatewaySafeFailureService,
    private readonly providerLogging: ProviderGatewayLoggingService,
    private readonly responseSafetyFilter: ResponseSafetyFilterService,
    private readonly chatMessageRepository: AiChatMessageRepository,
    private readonly sessionRepository: AiChatSessionRepository,
    private readonly lessonStageService: LessonTeachingStageService,
    private readonly rateLimitPolicy: RateLimitPolicyService,
    private readonly safetyService: AiTeacherSafetyService,
    private readonly costQuotaService: AiCostQuotaService,
    private readonly modelConfigService: ModelConfigService,
    @Inject(AI_PROVIDER_GATEWAY) private readonly providerGateway: AiProviderGateway,
  ) {}

  async handleTurn(input: ChatTurnInput): Promise<ChatTurnResult> {
    this.noSecretCheck.assertConfigIsSafe();

    // P8-069: Enforce rate limit policy before any AI provider call.
    await this.rateLimitPolicy.assertNotRateLimited({
      studentId: input.studentId,
      sessionId: input.sessionId,
    });

    // P18-fix: model config resolution, also used for the cost/quota gate
    // and the input safety check's providerKeyRef.
    const modelConfig = await this.modelConfigService.selectByTier('economy');

    // P18-fix: cost/quota check BEFORE any provider call, per
    // docs/phase-18/ai-cost-control-policy.md — quota state is always
    // computed server-side, never trusted from the client.
    const quotaCheck = await this.costQuotaService.checkQuota(
      input.studentId,
      'daily',
      ESTIMATED_COST_PER_TURN_USD,
    );
    if (!quotaCheck.allowed) {
      throw new AiQuotaExceededError('daily');
    }

    const session = await this.sessionRepository.findById(input.sessionId);
    if (!session) {
      throw new Error(`AiTeacherOrchestratorService.handleTurn: session not found: ${input.sessionId}`);
    }

    // Lazily resolve+persist for any session that predates this feature
    // (resolved_lesson_id still null) — a no-op write once already set.
    if (!session.resolved_lesson_id) {
      await this.lessonStageService.resolveAndPersistLesson(
        input.studentId,
        input.sessionId,
        input.contextRef,
      );
    }

    // A real student turn arriving while still in 'greeting' is the
    // student's answer to "shall we start?" — move into 'teaching' before
    // this turn's reply is generated, so the reply already teaches rather
    // than greeting again.
    const lessonStage = await this.lessonStageService.advanceFromGreetingIfNeeded(session);

    const context = await this.contextBuilder.buildContext({
      studentId: input.studentId,
      sessionId: input.sessionId,
      contextRef: input.contextRef,
    });

    // Conversation memory: recent prior turns, oldest first, fetched
    // before this turn's own student message is persisted below (so it
    // isn't duplicated between history and the current studentMessage).
    const recentMessages = await this.chatMessageRepository.findRecentBySessionId(
      input.sessionId,
      CONVERSATION_HISTORY_TURN_LIMIT,
    );
    const history = recentMessages.map((message) => ({
      role: message.role,
      text: message.text,
    }));

    const prompt = this.promptBuilder.buildPrompt({
      studentMessage: input.studentMessage,
      context,
      lessonStage,
      history,
    });

    const channel = input.channel ?? 'text';

    // P21-021b: a voice turn's student message row already exists (created
    // empty by AudioUploadService as the voice_audio_assets FK anchor,
    // before STT ran) — fill it in rather than inserting a second row.
    // Every text-chat caller omits existingStudentMessageId and keeps
    // today's insert behavior.
    const studentMessageRecord = input.existingStudentMessageId
      ? await this.chatMessageRepository.updateText(
          input.existingStudentMessageId,
          input.studentMessage,
        )
      : await this.chatMessageRepository.create(
          input.sessionId,
          input.studentId,
          'student',
          input.studentMessage,
          { channel },
        );

    if (!studentMessageRecord) {
      throw new Error(
        `AiTeacherOrchestratorService.handleTurn: existingStudentMessageId=${input.existingStudentMessageId} not found`,
      );
    }

    // P18-fix: input-side safety check BEFORE any provider call, per
    // docs/phase-18/ai-safety-policy.md — fails closed on a moderation
    // error rather than allowing the turn through.
    const inputSafetyOutcome = await this.safetyService.checkInput(
      'message',
      studentMessageRecord.id,
      input.studentMessage,
      modelConfig.provider_key_ref,
    );
    if (inputSafetyOutcome.action === 'blocked') {
      throw new AiInputBlockedError();
    }

    const requestId = randomUUID();

    const outcome = await this.timeoutPolicy.execute(() =>
      this.providerGateway.complete({ sessionId: input.sessionId, prompt }),
    );

    await this.providerLogging.logAttempt(input.sessionId, outcome.response);

    await this.costQuotaService.recordUsage({
      studentId: input.studentId,
      eventType: 'text_generation',
      modelConfigId: modelConfig.id,
      requestId,
      tokensUsed: null,
      costEstimate: ESTIMATED_COST_PER_TURN_USD,
      quotaPeriod: 'daily',
    });

    const safeReply = this.safeFailure.toSafeReply(outcome.response);

    const filteredReply = await this.responseSafetyFilter.filterResponse({
      sessionId: input.sessionId,
      text: safeReply.text,
    });

    // Strip the backend-only LESSON_COMPLETE marker (if present) before the
    // reply is ever persisted or returned, and — only when it was actually
    // present — write lesson_progress.completed + flip the session to
    // 'complete'. Re-fetches the session since resolveAndPersistLesson()
    // above may have just set resolved_lesson_id for the first time.
    const sessionForCompletion = (await this.sessionRepository.findById(input.sessionId)) ?? session;
    const finalReplyText = await this.lessonStageService.handleReply(
      input.studentId,
      sessionForCompletion,
      filteredReply.text,
    );

    const aiMessage = await this.chatMessageRepository.create(
      input.sessionId,
      input.studentId,
      'ai_teacher',
      finalReplyText,
      { channel },
    );

    await this.contextBuilder.persistSnapshot(aiMessage.id, context);

    this.logger.log(`Completed AI Teacher turn for session ${input.sessionId}`);

    return {
      text: finalReplyText,
      isFallback: safeReply.isFallback || filteredReply.wasFiltered,
      provider: outcome.response.provider,
      model: outcome.response.model,
      latencyMs: outcome.response.latencyMs,
      messageId: aiMessage.id,
    };
  }

  /**
   * P21-008: Generate a new session's opening greeting. Reuses this same
   * AI-call path (context assembly, prompt building, provider gateway call,
   * response safety filter) rather than a second, parallel AI-call
   * mechanism — the only difference from handleTurn() is that there is no
   * real student message yet, so no student-authored message is persisted
   * and no input-safety/rate-limit/quota gate (those exist to bound
   * student-submitted turns) is applied here. The caller (P21-007's
   * get-or-create path) is responsible for persisting the returned text as
   * the first ai_chat_messages row (role='assistant', is_greeting=true).
   */
  async generateGreeting(input: GenerateGreetingInput): Promise<GenerateGreetingResult> {
    this.noSecretCheck.assertConfigIsSafe();

    // Resolve+persist this session's lesson right away, at the same point
    // the session itself is created, so every later turn (and the
    // completion trigger) already has it.
    await this.lessonStageService.resolveAndPersistLesson(
      input.studentId,
      input.sessionId,
      input.contextRef,
    );

    const context = await this.contextBuilder.buildContext({
      studentId: input.studentId,
      sessionId: input.sessionId,
      contextRef: input.contextRef,
    });

    const prompt = this.promptBuilder.buildPrompt({
      studentMessage: AI_TEACHER_GREETING_INSTRUCTION,
      context,
      lessonStage: 'greeting',
    });

    const outcome = await this.timeoutPolicy.execute(() =>
      this.providerGateway.complete({ sessionId: input.sessionId, prompt }),
    );

    await this.providerLogging.logAttempt(input.sessionId, outcome.response);

    const safeReply = this.safeFailure.toSafeReply(outcome.response);

    const filteredReply = await this.responseSafetyFilter.filterResponse({
      sessionId: input.sessionId,
      text: safeReply.text,
    });

    this.logger.log(`Generated opening greeting for session ${input.sessionId}`);

    return {
      text: filteredReply.text,
      isFallback: safeReply.isFallback || filteredReply.wasFiltered,
      provider: outcome.response.provider,
      model: outcome.response.model,
      latencyMs: outcome.response.latencyMs,
      context,
    };
  }
}
