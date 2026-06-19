// P8-074: Create Chat Session List API
// ChatSessionListReadService tests.

import { ChatSessionListReadService } from '../chat-session-list-read.service';
import { AiChatSessionRepository } from '../../repositories/ai-chat-session.repository';
import { AiChatSessionRow } from '../../repositories/ai-chat-repository.types';

function makeRow(overrides: Partial<AiChatSessionRow> = {}): AiChatSessionRow {
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

function makeRepository(rows: AiChatSessionRow[] = [makeRow()]) {
  return {
    findActiveByStudentId: jest.fn().mockResolvedValue(rows),
  } as unknown as AiChatSessionRepository;
}

describe('ChatSessionListReadService', () => {
  it('returns mapped sessions for the given studentId', async () => {
    const repository = makeRepository();
    const service = new ChatSessionListReadService(repository);

    const result = await service.listSessions({ studentId: 'student-1' });

    expect(repository.findActiveByStudentId).toHaveBeenCalledWith('student-1');
    expect(result).toEqual({
      sessions: [
        {
          sessionId: 'session-1',
          contextRef: 'lesson:fractions',
          status: 'active',
          createdAt: '2026-06-19T00:00:00.000Z',
          updatedAt: '2026-06-19T00:00:00.000Z',
        },
      ],
    });
  });

  it('returns an empty array when the student has no active sessions', async () => {
    const repository = makeRepository([]);
    const service = new ChatSessionListReadService(repository);

    const result = await service.listSessions({ studentId: 'student-1' });

    expect(result).toEqual({ sessions: [] });
  });

  it('throws when studentId is missing', async () => {
    const repository = makeRepository();
    const service = new ChatSessionListReadService(repository);

    await expect(service.listSessions({ studentId: '' })).rejects.toThrow('studentId is missing');
  });
});
