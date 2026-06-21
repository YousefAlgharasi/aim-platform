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
import { ChatTurnInput, ChatTurnResult } from './ai-teacher-orchestrator.types';

// P18-fix: fixed per-turn cost estimate used for the pre-call quota check
// and the post-call usage record. No token-based cost calculator exists
// yet; this conservative flat estimate is enough to enforce the daily/
// monthly budget gate without inventing a new costing engine out of scope.
const ESTIMATED_COST_PER_TURN_USD = 0.01;

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

    const context = await this.contextBuilder.buildContext({
      studentId: input.studentId,
      sessionId: input.sessionId,
      contextRef: input.contextRef,
    });

    const prompt = this.promptBuilder.buildPrompt({
      studentMessage: input.studentMessage,
      context,
    });

    const studentMessageRecord = await this.chatMessageRepository.create(
      input.sessionId,
      input.studentId,
      'student',
      input.studentMessage,
    );

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

    const aiMessage = await this.chatMessageRepository.create(
      input.sessionId,
      input.studentId,
      'ai_teacher',
      filteredReply.text,
    );

    await this.contextBuilder.persistSnapshot(aiMessage.id, context);

    this.logger.log(`Completed AI Teacher turn for session ${input.sessionId}`);

    return {
      text: filteredReply.text,
      isFallback: safeReply.isFallback || filteredReply.wasFiltered,
      provider: outcome.response.provider,
      model: outcome.response.model,
      latencyMs: outcome.response.latencyMs,
    };
  }
}
