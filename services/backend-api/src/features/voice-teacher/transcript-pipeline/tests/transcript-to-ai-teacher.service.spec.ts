// P9-051: Connect Transcript to Phase 8 AI Teacher Pipeline tests.

import { TranscriptToAiTeacherService } from '../transcript-to-ai-teacher.service';
import { AiTeacherOrchestratorService } from '../../../ai-teacher/orchestrator/ai-teacher-orchestrator.service';
import { ChatTurnResult } from '../../../ai-teacher/orchestrator/ai-teacher-orchestrator.types';

function makeInput(overrides = {}) {
  return {
    studentId: 'student-1',
    sessionId: 'voice-session-1',
    contextRef: 'lesson:fractions',
    transcript: 'What is one half plus one quarter?',
    isTranscriptFallback: false,
    ...overrides,
  };
}

function makeChatTurnResult(overrides: Partial<ChatTurnResult> = {}): ChatTurnResult {
  return {
    text: 'One half plus one quarter is three quarters.',
    isFallback: false,
    provider: 'fake-provider',
    model: 'fake-model',
    latencyMs: 10,
    messageId: 'message-ai-1',
    ...overrides,
  };
}

function makeOrchestrator(result: ChatTurnResult = makeChatTurnResult()) {
  return {
    handleTurn: jest.fn().mockResolvedValue(result),
  } as unknown as AiTeacherOrchestratorService;
}

describe('TranscriptToAiTeacherService', () => {
  it('forwards the transcript as studentMessage to the AI Teacher orchestrator', async () => {
    const orchestrator = makeOrchestrator();
    const service = new TranscriptToAiTeacherService(orchestrator);

    await service.dispatch(makeInput());

    expect(orchestrator.handleTurn).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'voice-session-1',
      contextRef: 'lesson:fractions',
      studentMessage: 'What is one half plus one quarter?',
    });
  });

  it('forwards an empty transcript as studentMessage for the safe-failure path', async () => {
    const orchestrator = makeOrchestrator();
    const service = new TranscriptToAiTeacherService(orchestrator);

    await service.dispatch(makeInput({ transcript: '', isTranscriptFallback: true }));

    expect(orchestrator.handleTurn).toHaveBeenCalledWith(
      expect.objectContaining({ studentMessage: '' }),
    );
  });

  it('returns the AI Teacher reply mapped from the orchestrator result', async () => {
    const orchestrator = makeOrchestrator(
      makeChatTurnResult({ text: 'Hello!', provider: 'p', model: 'm' }),
    );
    const service = new TranscriptToAiTeacherService(orchestrator);

    const result = await service.dispatch(makeInput());

    expect(result).toEqual({
      text: 'Hello!',
      isFallback: false,
      provider: 'p',
      model: 'm',
    });
  });

  it('marks isFallback true when the transcript itself was a fallback, even if the AI Teacher reply is not', async () => {
    const orchestrator = makeOrchestrator(makeChatTurnResult({ isFallback: false }));
    const service = new TranscriptToAiTeacherService(orchestrator);

    const result = await service.dispatch(makeInput({ isTranscriptFallback: true }));

    expect(result.isFallback).toBe(true);
  });

  it('marks isFallback true when the AI Teacher reply is a fallback, even if the transcript was not', async () => {
    const orchestrator = makeOrchestrator(makeChatTurnResult({ isFallback: true }));
    const service = new TranscriptToAiTeacherService(orchestrator);

    const result = await service.dispatch(makeInput({ isTranscriptFallback: false }));

    expect(result.isFallback).toBe(true);
  });

  it.each(['studentId', 'sessionId', 'contextRef'])(
    'throws and never calls the orchestrator when %s is missing',
    async (field) => {
      const orchestrator = makeOrchestrator();
      const service = new TranscriptToAiTeacherService(orchestrator);

      await expect(service.dispatch(makeInput({ [field]: '' }))).rejects.toThrow(/is missing/);
      expect(orchestrator.handleTurn).not.toHaveBeenCalled();
    },
  );

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const orchestrator = makeOrchestrator();
    const service = new TranscriptToAiTeacherService(orchestrator);

    const result = await service.dispatch(makeInput());
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
      require.resolve('../transcript-to-ai-teacher.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
