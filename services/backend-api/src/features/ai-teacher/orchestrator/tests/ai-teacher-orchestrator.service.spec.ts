// P8-062: Build AI Teacher Orchestrator
// AiTeacherOrchestratorService tests.

import { AiTeacherOrchestratorService } from '../ai-teacher-orchestrator.service';
import { ContextBuilderService } from '../../context-builder/context-builder.service';
import { PromptBuilderService } from '../../prompt-builder/prompt-builder.service';
import { ProviderGatewayNoSecretCheckService } from '../../provider-gateway/provider-gateway-no-secret-check.service';
import { ProviderGatewayTimeoutPolicyService } from '../../provider-gateway/provider-gateway-timeout-policy.service';
import { ProviderGatewaySafeFailureService } from '../../provider-gateway/provider-gateway-safe-failure.service';
import { ProviderGatewayLoggingService } from '../../provider-gateway/provider-gateway-logging.service';
import { ResponseSafetyFilterService } from '../../response-safety/response-safety-filter.service';
import { AiChatMessageRepository } from '../../repositories/ai-chat-message.repository';
import { AiProviderGateway } from '../../provider-gateway/ai-provider-gateway.interface';
import { AiTeacherContextSnapshot } from '../../context-builder/context-builder.types';
import { AiProviderResponse } from '../../provider-gateway/provider-gateway.types';

function makeContext(): AiTeacherContextSnapshot {
  return {
    studentId: 'student-1',
    sessionId: 'session-1',
    studentProfile: { name: 'Test' },
    currentLesson: null,
    curriculumSkill: null,
  };
}

function makeOrchestrator(overrides: {
  providerResponse?: AiProviderResponse;
  noSecretCheckImpl?: () => void;
  safetyFilterResult?: { text: string; wasFiltered: boolean; reasonCategory: string | null };
} = {}) {
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
    assertConfigIsSafe:
      overrides.noSecretCheckImpl ?? jest.fn().mockReturnValue(undefined),
  } as unknown as ProviderGatewayNoSecretCheckService;

  const providerResponse: AiProviderResponse =
    overrides.providerResponse ?? {
      status: 'success',
      text: 'Add the numerators when denominators match.',
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 12,
    };

  const providerGateway = {
    complete: jest.fn().mockResolvedValue(providerResponse),
  } as unknown as AiProviderGateway;

  const timeoutPolicy = {
    execute: jest.fn().mockImplementation(async (attemptFn: () => Promise<AiProviderResponse>) => {
      const response = await attemptFn();
      return { response, attemptsMade: 1, budgetExhausted: false };
    }),
  } as unknown as ProviderGatewayTimeoutPolicyService;

  const safeFailure = new ProviderGatewaySafeFailureService();

  const providerLogging = {
    logAttempt: jest.fn().mockResolvedValue(undefined),
  } as unknown as ProviderGatewayLoggingService;

  const defaultSafetyFilterResult = {
    text: providerResponse.text ?? safeFailure.toSafeReply(providerResponse).text,
    wasFiltered: false,
    reasonCategory: null,
  };

  const responseSafetyFilter = {
    filterResponse: jest
      .fn()
      .mockResolvedValue(overrides.safetyFilterResult ?? defaultSafetyFilterResult),
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
        text: (overrides.safetyFilterResult ?? defaultSafetyFilterResult).text,
        created_at: 'now',
      }),
  } as unknown as AiChatMessageRepository;

  const service = new AiTeacherOrchestratorService(
    contextBuilder,
    promptBuilder,
    noSecretCheck,
    timeoutPolicy,
    safeFailure,
    providerLogging,
    responseSafetyFilter,
    chatMessageRepository,
    { assertNotRateLimited: jest.fn().mockResolvedValue(undefined) } as any,
    providerGateway,
  );

  return {
    service,
    contextBuilder,
    promptBuilder,
    noSecretCheck,
    providerGateway,
    timeoutPolicy,
    providerLogging,
    responseSafetyFilter,
    chatMessageRepository,
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

describe('AiTeacherOrchestratorService', () => {
  it('asserts the provider config is safe before doing anything else', async () => {
    const { service, noSecretCheck, contextBuilder } = makeOrchestrator();

    await service.handleTurn(makeInput());

    expect(noSecretCheck.assertConfigIsSafe).toHaveBeenCalled();
    expect(contextBuilder.buildContext).toHaveBeenCalled();
  });

  it('throws and never calls the provider when the secret check fails', async () => {
    const { service, providerGateway } = makeOrchestrator({
      noSecretCheckImpl: jest.fn(() => {
        throw new Error('AI provider configuration is invalid: AI_PROVIDER_API_KEY is missing.');
      }),
    });

    await expect(service.handleTurn(makeInput())).rejects.toThrow(/AI_PROVIDER_API_KEY/);
    expect(providerGateway.complete).not.toHaveBeenCalled();
  });

  it('builds context, builds the prompt from that context, and calls the provider gateway', async () => {
    const { service, contextBuilder, promptBuilder, providerGateway } = makeOrchestrator();

    await service.handleTurn(makeInput());

    expect(contextBuilder.buildContext).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'session-1',
      contextRef: 'lesson:fractions',
    });
    expect(promptBuilder.buildPrompt).toHaveBeenCalled();
    expect(providerGateway.complete).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'session-1' }),
    );
  });

  it('persists the student message before calling the provider, and the AI reply after', async () => {
    const { service, chatMessageRepository } = makeOrchestrator();

    await service.handleTurn(makeInput());

    expect(chatMessageRepository.create).toHaveBeenNthCalledWith(
      1,
      'session-1',
      'student-1',
      'student',
      'How do I add fractions?',
    );
    expect(chatMessageRepository.create).toHaveBeenNthCalledWith(
      2,
      'session-1',
      'student-1',
      'ai_teacher',
      'Add the numerators when denominators match.',
    );
  });

  it('persists the context snapshot against the ai_teacher message id', async () => {
    const { service, contextBuilder } = makeOrchestrator();

    await service.handleTurn(makeInput());

    expect(contextBuilder.persistSnapshot).toHaveBeenCalledWith('message-ai-1', makeContext());
  });

  it('logs the provider attempt metadata', async () => {
    const { service, providerLogging } = makeOrchestrator();

    await service.handleTurn(makeInput());

    expect(providerLogging.logAttempt).toHaveBeenCalledWith(
      'session-1',
      expect.objectContaining({ status: 'success' }),
    );
  });

  it('returns the provider text unchanged on success', async () => {
    const { service } = makeOrchestrator();

    const result = await service.handleTurn(makeInput());

    expect(result).toEqual({
      text: 'Add the numerators when denominators match.',
      isFallback: false,
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 12,
    });
  });

  it('converts a provider error into the fixed safe fallback reply, never the raw error', async () => {
    const { service, chatMessageRepository } = makeOrchestrator({
      providerResponse: {
        status: 'error',
        text: null,
        provider: 'fake-provider',
        model: 'fake-model',
        latencyMs: 8,
        errorCategory: 'PROVIDER_RATE_LIMITED',
      },
    });

    const result = await service.handleTurn(makeInput());

    expect(result.isFallback).toBe(true);
    expect(result.text).not.toMatch(/PROVIDER_RATE_LIMITED/);
    expect(chatMessageRepository.create).toHaveBeenNthCalledWith(
      2,
      'session-1',
      'student-1',
      'ai_teacher',
      result.text,
    );
  });

  it('passes the safe-failure reply text through the response safety filter before persisting/returning it', async () => {
    const { service, responseSafetyFilter, chatMessageRepository } = makeOrchestrator();

    const result = await service.handleTurn(makeInput());

    expect(responseSafetyFilter.filterResponse).toHaveBeenCalledWith({
      sessionId: 'session-1',
      text: 'Add the numerators when denominators match.',
    });
    expect(chatMessageRepository.create).toHaveBeenNthCalledWith(
      2,
      'session-1',
      'student-1',
      'ai_teacher',
      result.text,
    );
  });

  it('returns the safety-filtered text and marks the result as a fallback when the filter rejects the reply', async () => {
    const { service } = makeOrchestrator({
      safetyFilterResult: {
        text: "AI Teacher can't share that response, please rephrase your question.",
        wasFiltered: true,
        reasonCategory: 'LEARNING_AUTHORITY_VIOLATION',
      },
    });

    const result = await service.handleTurn(makeInput());

    expect(result.text).toBe("AI Teacher can't share that response, please rephrase your question.");
    expect(result.isFallback).toBe(true);
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const { service } = makeOrchestrator();

    const result = await service.handleTurn(makeInput());
    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../ai-teacher-orchestrator.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
