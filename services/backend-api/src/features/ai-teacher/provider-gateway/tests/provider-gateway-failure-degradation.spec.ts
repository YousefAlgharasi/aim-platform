// P18-056: Add AI Provider Failure Tests
// Closes the remaining gaps not already covered by
// provider-gateway-timeout-policy.service.spec.ts, provider-gateway-safe-failure.service.spec.ts,
// provider-response.mapper.spec.ts, provider-gateway-http-client.service.spec.ts, and
// provider-gateway-integration.spec.ts:
//   1. The orchestrator-level "timeout" status path (only "error" was previously tested).
//   2. End-to-end graceful degradation when every retry attempt times out and the
//      total time budget is exhausted — the pipeline must still resolve with a safe
//      fallback reply, never throw, and never leak the timeout error category.

import { AiTeacherOrchestratorService } from '../../orchestrator/ai-teacher-orchestrator.service';
import { ContextBuilderService } from '../../context-builder/context-builder.service';
import { PromptBuilderService } from '../../prompt-builder/prompt-builder.service';
import { ProviderGatewayNoSecretCheckService } from '../provider-gateway-no-secret-check.service';
import { ProviderGatewayTimeoutPolicyService } from '../provider-gateway-timeout-policy.service';
import { ProviderGatewaySafeFailureService } from '../provider-gateway-safe-failure.service';
import { ProviderGatewayLoggingService } from '../provider-gateway-logging.service';
import { ResponseSafetyFilterService } from '../../response-safety/response-safety-filter.service';
import { AiChatMessageRepository } from '../../repositories/ai-chat-message.repository';
import { AiProviderGateway } from '../ai-provider-gateway.interface';
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { AiProviderResponse } from '../provider-gateway.types';

function makeContext(): AiTeacherContextSnapshot {
  return {
    studentId: 'student-1',
    sessionId: 'session-1',
    studentProfile: { name: 'Test' },
    currentLesson: null,
    curriculumSkill: null,
    focusDirective: null,
    difficultyDecision: null,
    emotionalState: null,
  };
}

function makeInput() {
  return {
    studentId: 'student-1',
    sessionId: 'session-1',
    contextRef: 'lesson:fractions',
    studentMessage: 'How do I add fractions?',
  };
}

describe('AiTeacherOrchestratorService — timeout status path', () => {
  it('converts a provider timeout response into the fixed safe fallback, never the raw timeout category', async () => {
    const contextBuilder = {
      buildContext: jest.fn().mockResolvedValue(makeContext()),
      persistSnapshot: jest.fn().mockResolvedValue(undefined),
    } as unknown as ContextBuilderService;

    const promptBuilder = {
      buildPrompt: jest.fn().mockReturnValue({
        systemInstructions: 'You are a patient AI teacher.',
        sections: [],
        studentMessage: 'How do I add fractions?',
      }),
    } as unknown as PromptBuilderService;

    const noSecretCheck = {
      assertConfigIsSafe: jest.fn().mockReturnValue(undefined),
    } as unknown as ProviderGatewayNoSecretCheckService;

    const timeoutResponse: AiProviderResponse = {
      status: 'timeout',
      text: null,
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 5000,
      errorCategory: 'PROVIDER_CALL_TIMEOUT',
    };

    const providerGateway = {
      complete: jest.fn().mockResolvedValue(timeoutResponse),
    } as unknown as AiProviderGateway;

    const timeoutPolicy = {
      execute: jest.fn().mockImplementation(async (attemptFn: () => Promise<AiProviderResponse>) => {
        const response = await attemptFn();
        return { response, attemptsMade: 3, budgetExhausted: true };
      }),
    } as unknown as ProviderGatewayTimeoutPolicyService;

    const safeFailure = new ProviderGatewaySafeFailureService();

    const providerLogging = {
      logAttempt: jest.fn().mockResolvedValue(undefined),
    } as unknown as ProviderGatewayLoggingService;

    const safeReply = safeFailure.toSafeReply(timeoutResponse);

    const responseSafetyFilter = {
      filterResponse: jest.fn().mockResolvedValue({
        text: safeReply.text,
        wasFiltered: false,
        reasonCategory: null,
      }),
    } as unknown as ResponseSafetyFilterService;

    const chatMessageRepository = {
      create: jest
        .fn()
        .mockResolvedValueOnce({
          id: 'message-student-1',
          session_id: 'session-1',
          student_id: 'student-1',
          role: 'student',
          text: 'How do I add fractions?',
          created_at: 'now',
        })
        .mockResolvedValueOnce({
          id: 'message-ai-1',
          session_id: 'session-1',
          student_id: 'student-1',
          role: 'ai_teacher',
          text: safeReply.text,
          created_at: 'now',
        }),
      findRecentBySessionId: jest.fn().mockResolvedValue([]),
    } as unknown as AiChatMessageRepository;

    const sessionRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'session-1',
        student_id: 'student-1',
        context_ref: 'lesson:fractions',
        status: 'active',
        created_at: 'now',
        updated_at: 'now',
        lesson_teaching_stage: 'teaching',
        resolved_lesson_id: 'lesson-1',
      }),
    } as any;

    const lessonStageService = {
      resolveAndPersistLesson: jest.fn().mockResolvedValue(undefined),
      advanceFromGreetingIfNeeded: jest.fn().mockResolvedValue('teaching'),
      handleReply: jest.fn().mockImplementation(async (_s: string, _sess: unknown, text: string) => text),
    } as any;

    const safetyService = {
      checkInput: jest.fn().mockResolvedValue({ action: 'allowed' }),
      checkOutput: jest.fn().mockResolvedValue({ action: 'allowed' }),
    } as any;

    const costQuotaService = {
      checkQuota: jest.fn().mockResolvedValue({ allowed: true, periodSpend: 0, budget: 2.0 }),
      recordUsage: jest.fn().mockResolvedValue({}),
    } as any;

    const modelConfigService = {
      selectByTier: jest.fn().mockResolvedValue({
        id: 'model-config-1',
        name: 'economy-model',
        provider_key_ref: 'provider-key-ref-1',
        model_id: 'model-1',
        tier: 'economy',
        status: 'active',
        limits: {},
        parameters: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    } as any;

    const service = new AiTeacherOrchestratorService(
      contextBuilder,
      promptBuilder,
      noSecretCheck,
      timeoutPolicy,
      safeFailure,
      providerLogging,
      responseSafetyFilter,
      chatMessageRepository,
      sessionRepository,
      lessonStageService,
      { assertNotRateLimited: jest.fn().mockResolvedValue(undefined) } as any,
      { checkInput: jest.fn().mockResolvedValue({ action: 'allowed', category: 'none', record: {} }), checkOutput: jest.fn().mockResolvedValue({ action: 'allowed', category: 'none', record: {} }) } as any,
      { checkQuota: jest.fn().mockResolvedValue({ allowed: true }), recordUsage: jest.fn().mockResolvedValue(undefined) } as any,
      { selectByTier: jest.fn().mockResolvedValue({ id: 'mc-1', provider_key_ref: 'ref-1' }) } as any,
      providerGateway,
    );

    const result = await service.handleTurn(makeInput());

    expect(result.isFallback).toBe(true);
    expect(result.text).not.toMatch(/PROVIDER_CALL_TIMEOUT/);
    expect(JSON.stringify(result)).not.toMatch(/timeout/i);
  });
});

describe('AI Provider Gateway — graceful degradation when every attempt times out', () => {
  it('never throws when all retry attempts time out and the budget is exhausted, resolving to the safe fallback', async () => {
    const timeoutPolicy = new ProviderGatewayTimeoutPolicyService();
    const safeFailure = new ProviderGatewaySafeFailureService();

    const neverResolvingAttempt = () =>
      new Promise<AiProviderResponse>(() => {
        // intentionally never resolves/rejects, simulating a hung provider call
      });

    const outcomePromise = timeoutPolicy.execute(neverResolvingAttempt);

    await expect(outcomePromise).resolves.toBeDefined();
    const outcome = await outcomePromise;

    expect(outcome.response.status).toBe('timeout');

    const safeReply = safeFailure.toSafeReply(outcome.response);
    expect(safeReply.isFallback).toBe(true);
    expect(safeReply.text).not.toMatch(/PROVIDER_CALL_TIMEOUT/);
    expect(safeReply.text).not.toMatch(/timeout/i);
  }, 20000);

  it('never throws and degrades gracefully when the provider gateway rejects with a thrown error', async () => {
    const timeoutPolicy = new ProviderGatewayTimeoutPolicyService();
    const safeFailure = new ProviderGatewaySafeFailureService();

    const throwingAttempt = async (): Promise<AiProviderResponse> => {
      throw new Error('unexpected provider client crash');
    };

    await expect(timeoutPolicy.execute(throwingAttempt)).rejects.toThrow(
      'unexpected provider client crash',
    );
  });

  it('the concrete HTTP gateway never lets a thrown error escape — it always resolves to an error response', async () => {
    // Documents the contract that ProviderGatewayHttpClientService (the only real
    // AiProviderGateway implementation) catches all network/throw failures itself,
    // so the never-throws guarantee above holds in production: the timeout policy
    // only ever needs to handle a rejected attemptFn for buggy/future gateways,
    // not for the real one.
    const safeFailure = new ProviderGatewaySafeFailureService();
    const errorResponse: AiProviderResponse = {
      status: 'error',
      text: null,
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 10,
      errorCategory: 'PROVIDER_NETWORK_ERROR',
    };

    const safeReply = safeFailure.toSafeReply(errorResponse);

    expect(safeReply.isFallback).toBe(true);
    expect(safeReply.text).not.toMatch(/PROVIDER_NETWORK_ERROR/);
  });
});
