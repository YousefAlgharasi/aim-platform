// P8-064: Build Student Message Submit Service
// ChatMessageSubmitService tests.

import { HttpStatus } from '@nestjs/common';
import { ChatMessageSubmitService } from '../chat-message-submit.service';
import { AiTeacherOrchestratorService } from '../../orchestrator/ai-teacher-orchestrator.service';
import { ChatTurnResult } from '../../orchestrator/ai-teacher-orchestrator.types';
import { AppError } from '../../../../common/errors/app-error';
import { ApiErrorCode } from '../../../../common/errors/api-error-code';
import { RateLimitExceededError } from '../../rate-limit-policy/rate-limit-exceeded.error';
import { AiQuotaExceededError } from '../../governance/ai-quota-exceeded.error';
import { AiInputBlockedError } from '../../governance/ai-input-blocked.error';

function makeResult(overrides: Partial<ChatTurnResult> = {}): ChatTurnResult {
  return {
    text: "Great question! Let's break it down.",
    isFallback: false,
    provider: 'fake-provider',
    model: 'fake-model',
    latencyMs: 120,
    messageId: 'message-ai-1',
    ...overrides,
  };
}

function makeOrchestrator(result: ChatTurnResult = makeResult()) {
  return {
    handleTurn: jest.fn().mockResolvedValue(result),
  } as unknown as AiTeacherOrchestratorService;
}

describe('ChatMessageSubmitService', () => {
  it('starts the AI response pipeline via the orchestrator with the given input', async () => {
    const orchestrator = makeOrchestrator();
    const service = new ChatMessageSubmitService(orchestrator);

    await service.submitMessage({
      studentId: 'student-1',
      sessionId: 'session-1',
      contextRef: 'lesson:fractions',
      studentMessage: 'How do I add fractions?',
    });

    expect(orchestrator.handleTurn).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'session-1',
      contextRef: 'lesson:fractions',
      studentMessage: 'How do I add fractions?',
    });
  });

  it('returns the result mapped from the orchestrator', async () => {
    const orchestrator = makeOrchestrator();
    const service = new ChatMessageSubmitService(orchestrator);

    const result = await service.submitMessage({
      studentId: 'student-1',
      sessionId: 'session-1',
      contextRef: 'lesson:fractions',
      studentMessage: 'How do I add fractions?',
    });

    expect(result).toEqual({
      text: "Great question! Let's break it down.",
      isFallback: false,
      provider: 'fake-provider',
      model: 'fake-model',
      latencyMs: 120,
    });
  });

  it('throws and never calls the orchestrator when studentId is missing', async () => {
    const orchestrator = makeOrchestrator();
    const service = new ChatMessageSubmitService(orchestrator);

    await expect(
      service.submitMessage({
        studentId: '',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: 'Hello',
      }),
    ).rejects.toThrow(/studentId is missing/);
    expect(orchestrator.handleTurn).not.toHaveBeenCalled();
  });

  it('throws and never calls the orchestrator when sessionId is missing', async () => {
    const orchestrator = makeOrchestrator();
    const service = new ChatMessageSubmitService(orchestrator);

    await expect(
      service.submitMessage({
        studentId: 'student-1',
        sessionId: '',
        contextRef: 'lesson:fractions',
        studentMessage: 'Hello',
      }),
    ).rejects.toThrow(/sessionId is missing/);
    expect(orchestrator.handleTurn).not.toHaveBeenCalled();
  });

  it('throws and never calls the orchestrator when contextRef is missing', async () => {
    const orchestrator = makeOrchestrator();
    const service = new ChatMessageSubmitService(orchestrator);

    await expect(
      service.submitMessage({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: '',
        studentMessage: 'Hello',
      }),
    ).rejects.toThrow(/contextRef is missing/);
    expect(orchestrator.handleTurn).not.toHaveBeenCalled();
  });

  it('throws and never calls the orchestrator when studentMessage is missing', async () => {
    const orchestrator = makeOrchestrator();
    const service = new ChatMessageSubmitService(orchestrator);

    await expect(
      service.submitMessage({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: '',
      }),
    ).rejects.toThrow(/studentMessage is missing/);
    expect(orchestrator.handleTurn).not.toHaveBeenCalled();
  });

  it('throws and never calls the orchestrator when studentMessage is whitespace-only', async () => {
    const orchestrator = makeOrchestrator();
    const service = new ChatMessageSubmitService(orchestrator);

    await expect(
      service.submitMessage({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: '   ',
      }),
    ).rejects.toThrow(/studentMessage is missing/);
    expect(orchestrator.handleTurn).not.toHaveBeenCalled();
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const orchestrator = makeOrchestrator();
    const service = new ChatMessageSubmitService(orchestrator);

    const result = await service.submitMessage({
      studentId: 'student-1',
      sessionId: 'session-1',
      contextRef: 'lesson:fractions',
      studentMessage: 'How do I add fractions?',
    });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('translates a RateLimitExceededError into a clean 429 AppError, not a generic 500', async () => {
    const orchestrator = {
      handleTurn: jest.fn().mockRejectedValue(
        new RateLimitExceededError('SESSION_TURN_LIMIT', 'Please slow down.', 30),
      ),
    } as unknown as AiTeacherOrchestratorService;
    const service = new ChatMessageSubmitService(orchestrator);

    let caught: unknown;
    try {
      await service.submitMessage({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: 'Hello',
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AppError);
    const appError = caught as AppError;
    expect(appError.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(appError.code).toBe(ApiErrorCode.RATE_LIMITED);
    expect(appError.message).toBe('Please slow down.');
    expect(appError.details).toEqual({ retryAfterSeconds: 30 });
  });

  it('translates an AiQuotaExceededError into a clean 429 AppError', async () => {
    const orchestrator = {
      handleTurn: jest.fn().mockRejectedValue(new AiQuotaExceededError('daily')),
    } as unknown as AiTeacherOrchestratorService;
    const service = new ChatMessageSubmitService(orchestrator);

    let caught: unknown;
    try {
      await service.submitMessage({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: 'Hello',
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AppError);
    expect((caught as AppError).statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect((caught as AppError).code).toBe(ApiErrorCode.RATE_LIMITED);
  });

  it('translates an AiInputBlockedError into a clean 403 AppError', async () => {
    const orchestrator = {
      handleTurn: jest.fn().mockRejectedValue(new AiInputBlockedError()),
    } as unknown as AiTeacherOrchestratorService;
    const service = new ChatMessageSubmitService(orchestrator);

    let caught: unknown;
    try {
      await service.submitMessage({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: 'Hello',
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(AppError);
    expect((caught as AppError).statusCode).toBe(HttpStatus.FORBIDDEN);
    expect((caught as AppError).code).toBe(ApiErrorCode.FORBIDDEN);
  });

  it('lets an unrelated orchestrator error propagate unchanged', async () => {
    const orchestrator = {
      handleTurn: jest.fn().mockRejectedValue(new Error('boom')),
    } as unknown as AiTeacherOrchestratorService;
    const service = new ChatMessageSubmitService(orchestrator);

    await expect(
      service.submitMessage({
        studentId: 'student-1',
        sessionId: 'session-1',
        contextRef: 'lesson:fractions',
        studentMessage: 'Hello',
      }),
    ).rejects.toThrow('boom');
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../chat-message-submit.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
