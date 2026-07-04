// P8-073: Create Chat History API
// ChatHistoryReadService tests.

import { ChatHistoryReadService } from '../chat-history-read.service';
import { AiChatSessionRepository } from '../../repositories/ai-chat-session.repository';
import { AiChatMessageRepository } from '../../repositories/ai-chat-message.repository';
import { AiChatMessageRow, AiChatSessionRow } from '../../repositories/ai-chat-repository.types';

function makeSessionRow(overrides: Partial<AiChatSessionRow> = {}): AiChatSessionRow {
  return {
    id: 'session-1',
    student_id: 'student-1',
    context_ref: 'lesson:fractions',
    status: 'active',
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeMessageRow(overrides: Partial<AiChatMessageRow> = {}): AiChatMessageRow {
  return {
    id: 'message-1',
    session_id: 'session-1',
    student_id: 'student-1',
    role: 'student',
    text: 'hello',
    created_at: '2026-06-19T00:00:00.000Z',
    channel: 'text',
    audio_ref: null,
    audio_duration_ms: null,
    is_greeting: false,
    ...overrides,
  };
}

function makeRepositories(
  sessionRow: AiChatSessionRow | null = makeSessionRow(),
  messageRows: AiChatMessageRow[] = [makeMessageRow()],
) {
  const sessionRepository = {
    findById: jest.fn().mockResolvedValue(sessionRow),
  } as unknown as AiChatSessionRepository;
  const messageRepository = {
    findBySessionId: jest.fn().mockResolvedValue(messageRows),
  } as unknown as AiChatMessageRepository;
  return { sessionRepository, messageRepository };
}

describe('ChatHistoryReadService', () => {
  it('returns mapped messages for an owned, existing session', async () => {
    const { sessionRepository, messageRepository } = makeRepositories();
    const service = new ChatHistoryReadService(sessionRepository, messageRepository);

    const result = await service.getHistory({ studentId: 'student-1', sessionId: 'session-1' });

    expect(messageRepository.findBySessionId).toHaveBeenCalledWith('session-1');
    expect(result).toEqual({
      sessionId: 'session-1',
      messages: [
        { id: 'message-1', role: 'student', text: 'hello', createdAt: '2026-06-19T00:00:00.000Z' },
      ],
    });
  });

  it('returns null when the session does not exist', async () => {
    const { sessionRepository, messageRepository } = makeRepositories(null);
    const service = new ChatHistoryReadService(sessionRepository, messageRepository);

    const result = await service.getHistory({ studentId: 'student-1', sessionId: 'missing' });

    expect(result).toBeNull();
    expect(messageRepository.findBySessionId).not.toHaveBeenCalled();
  });

  it('returns null when the session belongs to another student', async () => {
    const { sessionRepository, messageRepository } = makeRepositories(
      makeSessionRow({ student_id: 'other-student' }),
    );
    const service = new ChatHistoryReadService(sessionRepository, messageRepository);

    const result = await service.getHistory({ studentId: 'student-1', sessionId: 'session-1' });

    expect(result).toBeNull();
    expect(messageRepository.findBySessionId).not.toHaveBeenCalled();
  });

  it('throws when studentId is missing', async () => {
    const { sessionRepository, messageRepository } = makeRepositories();
    const service = new ChatHistoryReadService(sessionRepository, messageRepository);

    await expect(
      service.getHistory({ studentId: '', sessionId: 'session-1' }),
    ).rejects.toThrow('studentId is missing');
  });

  it('throws when sessionId is missing', async () => {
    const { sessionRepository, messageRepository } = makeRepositories();
    const service = new ChatHistoryReadService(sessionRepository, messageRepository);

    await expect(
      service.getHistory({ studentId: 'student-1', sessionId: '' }),
    ).rejects.toThrow('sessionId is missing');
  });
});
