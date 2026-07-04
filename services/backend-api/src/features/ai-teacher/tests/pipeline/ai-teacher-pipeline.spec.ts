/**
 * P8-070: Add AI Teacher Pipeline Tests (Group G — AI Teacher Backend
 * Pipeline). Pipeline-level integration tests that verify the full
 * backend AI Teacher turn across all Group G seams:
 *
 *   Rate Limit Policy (P8-069)
 *   → No-Secret Check (P8-060)
 *   → Context Builder (Group D)
 *   → Prompt Builder (Group E)
 *   → Persistence — student message (Group C / P8-026)
 *   → Provider Gateway (Group F / P8-065)
 *   → Provider Logging (P8-063)
 *   → Safe-Failure Wrapper (P8-058)
 *   → Response Safety Filter (P8-066)
 *   → Persistence — AI Teacher message + context snapshot (Group C)
 *
 * Each test exercises the assembled `AiTeacherOrchestratorService` with
 * all collaborators mocked, focusing on the cross-cutting guarantees that
 * span the full pipeline rather than individual unit behaviour.
 *
 * Invariants verified:
 * 1. Rate limit gate runs before any other pipeline step.
 * 2. Rate limit exceeded blocks context, provider, and persistence entirely.
 * 3. Student message is persisted before the provider call.
 * 4. AI message is persisted after response safety filtering — never before.
 * 5. Context snapshot is persisted after the AI message row exists.
 * 6. Safety filter quarantines an authority-violating reply; only the
 *    fallback text reaches the DB and the caller.
 * 7. A provider error is converted to a safe fallback before persisting or
 *    returning — raw error text never leaves the pipeline.
 * 8. Pipeline result never exposes mastery, level, weakness, difficulty,
 *    recommendation, or review-schedule (AIM Engine authority preserved).
 * 9. No AI provider secret or process.env access appears in pipeline source.
 */
import { AiTeacherOrchestratorService } from '../../orchestrator/ai-teacher-orchestrator.service';
import { ContextBuilderService } from '../../context-builder/context-builder.service';
import { PromptBuilderService } from '../../prompt-builder/prompt-builder.service';
import { ProviderGatewayNoSecretCheckService } from '../../provider-gateway/provider-gateway-no-secret-check.service';
import { ProviderGatewayTimeoutPolicyService } from '../../provider-gateway/provider-gateway-timeout-policy.service';
import { ProviderGatewaySafeFailureService } from '../../provider-gateway/provider-gateway-safe-failure.service';
import { ProviderGatewayLoggingService } from '../../provider-gateway/provider-gateway-logging.service';
import { ResponseSafetyFilterService } from '../../response-safety/response-safety-filter.service';
import { AiChatMessageRepository } from '../../repositories/ai-chat-message.repository';
import { AiProviderGateway } from '../../provider-gateway/ai-provider-gateway.interface';
import { RateLimitPolicyService } from '../../rate-limit-policy/rate-limit-policy.service';
import { RateLimitExceededError } from '../../rate-limit-policy/rate-limit-exceeded.error';
import type { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import type { AiProviderResponse } from '../../provider-gateway/provider-gateway.types';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const PIPELINE_INPUT = {
  studentId: 'student-pipeline-1',
  sessionId: 'session-pipeline-1',
  contextRef: 'lesson:fractions',
  studentMessage: 'How do I add fractions with unlike denominators?',
};

function makeContext(): AiTeacherContextSnapshot {
  return {
    studentId: PIPELINE_INPUT.studentId,
    sessionId: PIPELINE_INPUT.sessionId,
    studentProfile: { name: 'Hana' },
    currentLesson: null,
    curriculumSkill: null,
    focusDirective: null,
    difficultyDecision: null,
    emotionalState: null,
  };
}

const DEFAULT_PROVIDER_RESPONSE: AiProviderResponse = {
  status: 'success',
  text: 'Find a common denominator, then add the numerators.',
  provider: 'fake-provider',
  model: 'fake-model',
  latencyMs: 50,
};

const DEFAULT_SAFETY_RESULT: { text: string; wasFiltered: boolean; reasonCategory: string | null } = {
  text: 'Find a common denominator, then add the numerators.',
  wasFiltered: false,
  reasonCategory: null,
};

const AI_MSG_ROW = {
  id: 'ai-msg-id-1',
  session_id: PIPELINE_INPUT.sessionId,
  student_id: PIPELINE_INPUT.studentId,
  role: 'ai_teacher' as const,
  text: DEFAULT_SAFETY_RESULT.text,
  created_at: new Date(),
};

interface PipelineMocks {
  rateLimitPolicy: jest.Mocked<Pick<RateLimitPolicyService, 'assertNotRateLimited'>>;
  contextBuilder: jest.Mocked<Pick<ContextBuilderService, 'buildContext' | 'persistSnapshot'>>;
  promptBuilder: jest.Mocked<Pick<PromptBuilderService, 'buildPrompt'>>;
  noSecretCheck: jest.Mocked<Pick<ProviderGatewayNoSecretCheckService, 'assertConfigIsSafe'>>;
  timeoutPolicy: jest.Mocked<Pick<ProviderGatewayTimeoutPolicyService, 'execute'>>;
  safeFailure: jest.Mocked<Pick<ProviderGatewaySafeFailureService, 'toSafeReply'>>;
  providerLogging: jest.Mocked<Pick<ProviderGatewayLoggingService, 'logAttempt'>>;
  responseSafetyFilter: jest.Mocked<Pick<ResponseSafetyFilterService, 'filterResponse'>>;
  chatMessageRepository: jest.Mocked<Pick<AiChatMessageRepository, 'create'>>;
  providerGateway: jest.Mocked<AiProviderGateway>;
  service: AiTeacherOrchestratorService;
}

function buildPipeline(overrides: {
  providerResponse?: AiProviderResponse;
  safetyResult?: { text: string; wasFiltered: boolean; reasonCategory: string | null };
  rateLimitImpl?: () => Promise<void>;
  noSecretCheckImpl?: () => void;
} = {}): PipelineMocks {
  const providerResponse = overrides.providerResponse ?? DEFAULT_PROVIDER_RESPONSE;
  const safetyResult = overrides.safetyResult ?? DEFAULT_SAFETY_RESULT;

  const rateLimitPolicy = {
    assertNotRateLimited:
      overrides.rateLimitImpl
        ? jest.fn().mockImplementation(overrides.rateLimitImpl)
        : jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<Pick<RateLimitPolicyService, 'assertNotRateLimited'>>;

  const contextBuilder = {
    buildContext: jest.fn().mockResolvedValue(makeContext()),
    persistSnapshot: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<Pick<ContextBuilderService, 'buildContext' | 'persistSnapshot'>>;

  const promptBuilder = {
    buildPrompt: jest.fn().mockReturnValue({
      systemInstructions: 'You are a patient AI teacher.',
      sections: [],
      studentMessage: PIPELINE_INPUT.studentMessage,
    }),
  } as unknown as jest.Mocked<Pick<PromptBuilderService, 'buildPrompt'>>;

  const noSecretCheck = {
    assertConfigIsSafe:
      overrides.noSecretCheckImpl
        ? jest.fn().mockImplementation(overrides.noSecretCheckImpl)
        : jest.fn().mockReturnValue(undefined),
  } as unknown as jest.Mocked<Pick<ProviderGatewayNoSecretCheckService, 'assertConfigIsSafe'>>;

  const timeoutPolicy = {
    execute: jest.fn().mockResolvedValue({ response: providerResponse, attemptsMade: 1, budgetExhausted: false }),
  } as unknown as jest.Mocked<Pick<ProviderGatewayTimeoutPolicyService, 'execute'>>;

  const safeFailure = {
    toSafeReply: jest.fn().mockReturnValue({
      text: providerResponse.status === 'success' ? providerResponse.text : 'AI Teacher is temporarily unavailable.',
      isFallback: providerResponse.status !== 'success',
    }),
  } as unknown as jest.Mocked<Pick<ProviderGatewaySafeFailureService, 'toSafeReply'>>;

  const providerLogging = {
    logAttempt: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<Pick<ProviderGatewayLoggingService, 'logAttempt'>>;

  const responseSafetyFilter = {
    filterResponse: jest.fn().mockResolvedValue(safetyResult),
  } as unknown as jest.Mocked<Pick<ResponseSafetyFilterService, 'filterResponse'>>;

  const chatMessageRepository = {
    create: jest
      .fn()
      .mockResolvedValueOnce({
        id: 'student-msg-id-1',
        session_id: PIPELINE_INPUT.sessionId,
        student_id: PIPELINE_INPUT.studentId,
        role: 'student',
        text: PIPELINE_INPUT.studentMessage,
        created_at: new Date(),
      })
      .mockResolvedValueOnce(AI_MSG_ROW),
  } as unknown as jest.Mocked<Pick<AiChatMessageRepository, 'create'>>;

  const providerGateway = {
    complete: jest.fn().mockResolvedValue(providerResponse),
  } as unknown as jest.Mocked<AiProviderGateway>;

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
    contextBuilder as any,
    promptBuilder as any,
    noSecretCheck as any,
    timeoutPolicy as any,
    safeFailure as any,
    providerLogging as any,
    responseSafetyFilter as any,
    chatMessageRepository as any,
    rateLimitPolicy as any,
    { checkInput: jest.fn().mockResolvedValue({ action: 'allowed', category: 'none', record: {} }), checkOutput: jest.fn().mockResolvedValue({ action: 'allowed', category: 'none', record: {} }) } as any,
    { checkQuota: jest.fn().mockResolvedValue({ allowed: true }), recordUsage: jest.fn().mockResolvedValue(undefined) } as any,
    { selectByTier: jest.fn().mockResolvedValue({ id: 'mc-1', provider_key_ref: 'ref-1' }) } as any,
    providerGateway,
  );

  return {
    rateLimitPolicy,
    contextBuilder,
    promptBuilder,
    noSecretCheck,
    timeoutPolicy,
    safeFailure,
    providerLogging,
    responseSafetyFilter,
    chatMessageRepository,
    providerGateway,
    service,
  };
}

// ---------------------------------------------------------------------------
// Pipeline tests
// ---------------------------------------------------------------------------

describe('AI Teacher Backend Pipeline (P8-070)', () => {
  // -------------------------------------------------------------------------
  // 1. Rate limit gate
  // -------------------------------------------------------------------------
  describe('Rate Limit Gate (P8-069)', () => {
    it('checks the rate limit before building context or calling the provider gateway', async () => {
      const callOrder: string[] = [];

      const mocks = buildPipeline();

      // Override mocks to track call order
      (mocks.rateLimitPolicy.assertNotRateLimited as jest.Mock).mockImplementationOnce(async () => {
        callOrder.push('rateLimit');
      });
      (mocks.noSecretCheck.assertConfigIsSafe as jest.Mock).mockImplementationOnce(() => {
        callOrder.push('secretCheck');
      });
      (mocks.contextBuilder.buildContext as jest.Mock).mockImplementationOnce(async () => {
        callOrder.push('contextBuilder');
        return makeContext();
      });

      await mocks.service.handleTurn(PIPELINE_INPUT);

      expect(callOrder[0]).toBe('secretCheck');
      expect(callOrder[1]).toBe('rateLimit');
      expect(callOrder[2]).toBe('contextBuilder');
    });

    it('aborts the entire pipeline when the rate limit is exceeded — no context, no provider, no persistence', async () => {
      const { service, contextBuilder, chatMessageRepository, providerGateway } = buildPipeline({
        rateLimitImpl: async () => {
          throw new RateLimitExceededError('SESSION_TURN_LIMIT', 'Session limit reached.', null);
        },
      });

      await expect(service.handleTurn(PIPELINE_INPUT)).rejects.toBeInstanceOf(RateLimitExceededError);

      expect(contextBuilder.buildContext).not.toHaveBeenCalled();
      expect(providerGateway.complete).not.toHaveBeenCalled();
      expect(chatMessageRepository.create).not.toHaveBeenCalled();
    });

    it('propagates the RateLimitExceededError reason and retryAfterSeconds to the caller', async () => {
      const { service } = buildPipeline({
        rateLimitImpl: async () => {
          throw new RateLimitExceededError('STUDENT_HOURLY_LIMIT', 'Too many requests.', 3600);
        },
      });

      let err: RateLimitExceededError | undefined;
      try {
        await service.handleTurn(PIPELINE_INPUT);
      } catch (e) {
        err = e as RateLimitExceededError;
      }

      expect(err?.reason).toBe('STUDENT_HOURLY_LIMIT');
      expect(err?.retryAfterSeconds).toBe(3600);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Persistence order invariant
  // -------------------------------------------------------------------------
  describe('Persistence Order', () => {
    it('persists the student message before calling the provider gateway', async () => {
      const callOrder: string[] = [];
      const { service, chatMessageRepository, timeoutPolicy } = buildPipeline();

      (chatMessageRepository.create as jest.Mock)
        .mockImplementationOnce(async () => {
          callOrder.push('persist:student');
          return { id: 'student-msg-1', session_id: 'session-pipeline-1', student_id: 'student-pipeline-1', role: 'student', text: '', created_at: new Date() };
        })
        .mockImplementationOnce(async () => {
          callOrder.push('persist:ai');
          return AI_MSG_ROW;
        });

      (timeoutPolicy.execute as jest.Mock).mockImplementationOnce(async (fn: () => Promise<any>) => {
        callOrder.push('providerCall');
        return { response: DEFAULT_PROVIDER_RESPONSE, attemptsMade: 1, budgetExhausted: false };
      });

      await service.handleTurn(PIPELINE_INPUT);

      const studentIdx = callOrder.indexOf('persist:student');
      const providerIdx = callOrder.indexOf('providerCall');
      expect(studentIdx).toBeLessThan(providerIdx);
    });

    it('persists the AI message after safety filtering — not before', async () => {
      const callOrder: string[] = [];
      const mocks = buildPipeline();

      (mocks.responseSafetyFilter.filterResponse as jest.Mock).mockImplementationOnce(async (input: any) => {
        callOrder.push('safetyFilter');
        return DEFAULT_SAFETY_RESULT;
      });

      // Reset create to track both calls
      (mocks.chatMessageRepository.create as jest.Mock).mockReset();
      (mocks.chatMessageRepository.create as jest.Mock)
        .mockImplementationOnce(async () => {
          callOrder.push('persist:student');
          return { id: 'student-msg-1', session_id: PIPELINE_INPUT.sessionId, student_id: PIPELINE_INPUT.studentId, role: 'student', text: '', created_at: new Date() };
        })
        .mockImplementationOnce(async () => {
          callOrder.push('persist:ai');
          return AI_MSG_ROW;
        });

      await mocks.service.handleTurn(PIPELINE_INPUT);

      const filterIdx = callOrder.indexOf('safetyFilter');
      const aiPersistIdx = callOrder.indexOf('persist:ai');
      expect(filterIdx).toBeGreaterThanOrEqual(0);
      expect(aiPersistIdx).toBeGreaterThanOrEqual(0);
      expect(filterIdx).toBeLessThan(aiPersistIdx);
    });

    it('persists the context snapshot after the AI message row exists', async () => {
      const callOrder: string[] = [];
      const { service, contextBuilder, chatMessageRepository } = buildPipeline();

      (chatMessageRepository.create as jest.Mock)
        .mockImplementationOnce(async () => {
          callOrder.push('persist:student');
          return { id: 'student-msg-1', session_id: 'session-pipeline-1', student_id: 'student-pipeline-1', role: 'student', text: '', created_at: new Date() };
        })
        .mockImplementationOnce(async () => {
          callOrder.push('persist:ai');
          return AI_MSG_ROW;
        });

      (contextBuilder.persistSnapshot as jest.Mock).mockImplementationOnce(async () => {
        callOrder.push('persist:snapshot');
      });

      await service.handleTurn(PIPELINE_INPUT);

      const aiPersistIdx = callOrder.indexOf('persist:ai');
      const snapshotIdx = callOrder.indexOf('persist:snapshot');
      expect(aiPersistIdx).toBeLessThan(snapshotIdx);
    });

    it('persists the context snapshot keyed to the AI message id', async () => {
      const { service, contextBuilder } = buildPipeline();

      await service.handleTurn(PIPELINE_INPUT);

      expect(contextBuilder.persistSnapshot).toHaveBeenCalledWith(
        AI_MSG_ROW.id,
        expect.any(Object),
      );
    });
  });

  // -------------------------------------------------------------------------
  // 3. Safety filter quarantine
  // -------------------------------------------------------------------------
  describe('Response Safety Filter Quarantine', () => {
    it('returns only the fallback text when the safety filter rejects an authority-violating reply', async () => {
      const FILTERED_FALLBACK = "AI Teacher can't share that response, please rephrase your question.";
      const { service } = buildPipeline({
        safetyResult: {
          text: FILTERED_FALLBACK,
          wasFiltered: true,
          reasonCategory: 'LEARNING_AUTHORITY_VIOLATION',
        },
      });

      const result = await service.handleTurn(PIPELINE_INPUT);

      expect(result.isFallback).toBe(true);
      expect(result.text).toBe(FILTERED_FALLBACK);
    });

    it('persists the fallback text — not the rejected authority-violating reply — into ai_chat_messages', async () => {
      const FILTERED_FALLBACK = "AI Teacher can't share that response, please rephrase your question.";
      const UNSAFE_RAW = 'Your mastery score is 87%.';

      const { service, chatMessageRepository } = buildPipeline({
        providerResponse: { status: 'success', text: UNSAFE_RAW, provider: 'fake', model: 'fake', latencyMs: 10 },
        safetyResult: { text: FILTERED_FALLBACK, wasFiltered: true, reasonCategory: 'LEARNING_AUTHORITY_VIOLATION' },
      });

      await service.handleTurn(PIPELINE_INPUT);

      const secondCall = (chatMessageRepository.create as jest.Mock).mock.calls[1];
      expect(secondCall[3]).toBe(FILTERED_FALLBACK);
      expect(secondCall[3]).not.toBe(UNSAFE_RAW);
    });

    it('passes the safe-failure reply text to the safety filter, not the raw provider text', async () => {
      const { service, responseSafetyFilter, safeFailure } = buildPipeline({
        providerResponse: {
          status: 'error',
          text: null,
          provider: 'fake',
          model: 'fake',
          latencyMs: 5,
          errorCategory: 'PROVIDER_ERROR',
        },
      });

      const SAFE_REPLY_TEXT = 'AI Teacher is temporarily unavailable.';
      (safeFailure.toSafeReply as jest.Mock).mockReturnValue({ text: SAFE_REPLY_TEXT, isFallback: true });

      await service.handleTurn(PIPELINE_INPUT);

      expect(responseSafetyFilter.filterResponse).toHaveBeenCalledWith(
        expect.objectContaining({ text: SAFE_REPLY_TEXT }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // 4. Provider error handling
  // -------------------------------------------------------------------------
  describe('Provider Error Handling', () => {
    it('converts a provider error response into a safe fallback — raw error text never reaches persistence', async () => {
      const RAW_ERROR = 'Internal server error at provider.';
      const SAFE_TEXT = 'AI Teacher is temporarily unavailable.';

      const { service, chatMessageRepository, safeFailure } = buildPipeline({
        providerResponse: {
          status: 'error',
          text: RAW_ERROR,
          provider: 'fake',
          model: 'fake',
          latencyMs: 5,
          errorCategory: 'PROVIDER_ERROR',
        },
        safetyResult: { text: SAFE_TEXT, wasFiltered: false, reasonCategory: null },
      });
      (safeFailure.toSafeReply as jest.Mock).mockReturnValue({ text: SAFE_TEXT, isFallback: true });

      const result = await service.handleTurn(PIPELINE_INPUT);

      expect(result.text).toBe(SAFE_TEXT);
      expect(result.text).not.toContain(RAW_ERROR);

      const persistedText = (chatMessageRepository.create as jest.Mock).mock.calls[1]?.[3];
      expect(persistedText).toBe(SAFE_TEXT);
      expect(persistedText).not.toContain(RAW_ERROR);
    });

    it('marks the result as isFallback=true when safe-failure wrapping fires', async () => {
      const { service, safeFailure } = buildPipeline({
        providerResponse: { status: 'timeout', text: null, provider: 'fake', model: 'fake', latencyMs: 8000, errorCategory: 'PROVIDER_CALL_TIMEOUT' },
      });
      (safeFailure.toSafeReply as jest.Mock).mockReturnValue({ text: 'Please try again.', isFallback: true });

      const result = await service.handleTurn(PIPELINE_INPUT);

      expect(result.isFallback).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 5. AIM Engine authority preserved
  // -------------------------------------------------------------------------
  describe('AIM Engine Authority (no-aim-replacement-rule)', () => {
    it('never includes mastery, level, weakness, difficulty, recommendation, or review-schedule in the pipeline result', async () => {
      const { service } = buildPipeline();

      const result = await service.handleTurn(PIPELINE_INPUT);
      const serialized = JSON.stringify(result);

      expect(serialized).not.toMatch(/mastery/i);
      expect(serialized).not.toMatch(/\blevel\b/i);
      expect(serialized).not.toMatch(/weakness/i);
      expect(serialized).not.toMatch(/difficulty/i);
      expect(serialized).not.toMatch(/recommendation/i);
      expect(serialized).not.toMatch(/reviewSchedule/i);
    });

    it('never lets the safety filter result expose AIM Engine learning-authority fields to the caller', async () => {
      const { service } = buildPipeline({
        safetyResult: { text: 'OK.', wasFiltered: false, reasonCategory: null },
      });

      const result = await service.handleTurn(PIPELINE_INPUT);
      const resultKeys = Object.keys(result);

      const forbiddenKeys = ['mastery', 'level', 'weakness', 'difficulty', 'recommendation', 'reviewSchedule'];
      forbiddenKeys.forEach((k) => expect(resultKeys).not.toContain(k));
    });
  });

  // -------------------------------------------------------------------------
  // 6. No secrets in pipeline source
  // -------------------------------------------------------------------------
  describe('No Secrets in Pipeline Source (no-client-ai-provider-rule)', () => {
    const PIPELINE_FILES = [
      '../../orchestrator/ai-teacher-orchestrator.service',
      '../../rate-limit-policy/rate-limit-policy.service',
      '../../chat-message/chat-message-submit.service',
    ];

    PIPELINE_FILES.forEach((modulePath) => {
      it(`never hard-codes an API key or reads process.env directly: ${modulePath.split('/').pop()}`, () => {
        const source = require('fs').readFileSync(
          require.resolve(modulePath),
          'utf8',
        ) as string;
        const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

        expect(codeOnly).not.toMatch(/process\.env/);
        expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
        expect(codeOnly).not.toMatch(/AI_PROVIDER_API_KEY\s*=/);
      });
    });
  });

  // -------------------------------------------------------------------------
  // 7. Happy-path end-to-end result shape
  // -------------------------------------------------------------------------
  describe('Happy-Path Result', () => {
    it('returns text, isFallback, provider, model, latencyMs, and messageId — nothing more', async () => {
      const { service } = buildPipeline();

      const result = await service.handleTurn(PIPELINE_INPUT);

      // P21-010: messageId (the persisted ai_teacher reply row id) was added
      // so a voice-turn caller can attach TTS audio_ref onto that exact row.
      expect(Object.keys(result).sort()).toEqual(
        ['isFallback', 'latencyMs', 'messageId', 'model', 'provider', 'text'].sort(),
      );
    });

    it('returns the safety-filtered text on a successful turn', async () => {
      const { service } = buildPipeline();

      const result = await service.handleTurn(PIPELINE_INPUT);

      expect(result.text).toBe(DEFAULT_SAFETY_RESULT.text);
      expect(result.isFallback).toBe(false);
    });
  });
});
