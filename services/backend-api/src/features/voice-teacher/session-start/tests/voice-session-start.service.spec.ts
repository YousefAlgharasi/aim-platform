// P9-049: Build Voice Session Start Service
// P21-007: VoiceSessionStartService now delegates to ChatSessionStartService
// (get-or-create by (studentId, contextRef) against ai_chat_sessions)
// instead of creating its own voice_sessions row.

import { VoiceSessionStartService } from '../voice-session-start.service';
import { ChatSessionStartService } from '../../../ai-teacher/chat-session/chat-session-start.service';
import { StartChatSessionResult } from '../../../ai-teacher/chat-session/chat-session-start.types';

function makeResult(overrides: Partial<StartChatSessionResult> = {}): StartChatSessionResult {
  return {
    sessionId: 'session-1',
    studentId: 'student-1',
    contextRef: 'lesson:fractions',
    status: 'active',
    createdAt: '2026-06-19T00:00:00.000Z',
    focusRecap: null,
    ...overrides,
  };
}

function makeChatSessionStartService(result: StartChatSessionResult = makeResult()) {
  return {
    startSession: jest.fn().mockResolvedValue(result),
  } as unknown as ChatSessionStartService;
}

describe('VoiceSessionStartService', () => {
  it('delegates to ChatSessionStartService.startSession with the given studentId and contextRef', async () => {
    const chatSessionStartService = makeChatSessionStartService();
    const service = new VoiceSessionStartService(chatSessionStartService);

    await service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' });

    expect(chatSessionStartService.startSession).toHaveBeenCalledWith({
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
    });
  });

  it('returns the session mapped from ChatSessionStartService', async () => {
    const chatSessionStartService = makeChatSessionStartService();
    const service = new VoiceSessionStartService(chatSessionStartService);

    const result = await service.startSession({
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
    });

    expect(result).toEqual({
      sessionId: 'session-1',
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
      status: 'active',
      createdAt: '2026-06-19T00:00:00.000Z',
      focusRecap: null,
    });
  });

  it('starting chat then voice for the same contextRef resolves to the same session id', async () => {
    const sharedResult = makeResult({ sessionId: 'shared-session-1' });
    const chatSessionStartService = makeChatSessionStartService(sharedResult);
    const service = new VoiceSessionStartService(chatSessionStartService);

    const voiceResult = await service.startSession({
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
    });

    expect(voiceResult.sessionId).toBe('shared-session-1');
    // Both entry points call the same underlying service/method — the
    // get-or-create dedup itself is covered by AiChatSessionRepository's
    // and ChatSessionStartService's own tests.
    expect(chatSessionStartService.startSession).toHaveBeenCalledWith({
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
    });
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const chatSessionStartService = makeChatSessionStartService();
    const service = new VoiceSessionStartService(chatSessionStartService);

    const result = await service.startSession({
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
    });
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
      require.resolve('../voice-session-start.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
