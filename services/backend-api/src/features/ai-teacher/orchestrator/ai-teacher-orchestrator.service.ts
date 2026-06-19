/**
 * P8-062: Build AI Teacher Orchestrator (Group G — AI Teacher Backend
 * Pipeline). Coordinates a single AI Teacher chat turn across the
 * already-built Group D/E/F seams:
 *   1. Context (Group D) — backend-approved, read-only context snapshot.
 *   2. Prompt (Group E) — structured prompt assembled from that context.
 *   3. Provider (Group F) — secret-safety guard, bounded timeout/retry,
 *      and the AI provider call itself via `AI_PROVIDER_GATEWAY`.
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
import { ChatTurnInput, ChatTurnResult } from './ai-teacher-orchestrator.types';

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
    @Inject(AI_PROVIDER_GATEWAY) private readonly providerGateway: AiProviderGateway,
  ) {}

  async handleTurn(input: ChatTurnInput): Promise<ChatTurnResult> {
    this.noSecretCheck.assertConfigIsSafe();

    // P8-069: Enforce rate limit policy before any AI provider call.
    await this.rateLimitPolicy.assertNotRateLimited({
      studentId: input.studentId,
      sessionId: input.sessionId,
    });

    const context = await this.contextBuilder.buildContext({
      studentId: input.studentId,
      sessionId: input.sessionId,
      contextRef: input.contextRef,
    });

    const prompt = this.promptBuilder.buildPrompt({
      studentMessage: input.studentMessage,
      context,
    });

    await this.chatMessageRepository.create(
      input.sessionId,
      input.studentId,
      'student',
      input.studentMessage,
    );

    const outcome = await this.timeoutPolicy.execute(() =>
      this.providerGateway.complete({ sessionId: input.sessionId, prompt }),
    );

    await this.providerLogging.logAttempt(input.sessionId, outcome.response);

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
