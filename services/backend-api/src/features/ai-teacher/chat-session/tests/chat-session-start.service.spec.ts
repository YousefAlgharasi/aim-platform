// P8-063: Build Chat Session Start Service
// ChatSessionStartService tests.

import { ChatSessionStartService } from '../chat-session-start.service';
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

function makeRepository(row: AiChatSessionRow = makeRow()) {
  return {
    create: jest.fn().mockResolvedValue(row),
  } as unknown as AiChatSessionRepository;
}

describe('ChatSessionStartService', () => {
  it('creates a new session via the repository with the given studentId and contextRef', async () => {
    const repository = makeRepository();
    const service = new ChatSessionStartService(repository);

    await service.startSession({ studentId: 'student-1', contextRef: 'lesson:fractions' });

    expect(repository.create).toHaveBeenCalledWith('student-1', 'lesson:fractions');
  });

  it('returns the created session mapped from the repository row', async () => {
    const repository = makeRepository();
    const service = new ChatSessionStartService(repository);

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
    });
  });

  it('throws and never calls the repository when studentId is missing', async () => {
    const repository = makeRepository();
    const service = new ChatSessionStartService(repository);

    await expect(
      service.startSession({ studentId: '', contextRef: 'lesson:fractions' }),
    ).rejects.toThrow(/studentId is missing/);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('throws and never calls the repository when studentId is whitespace-only', async () => {
    const repository = makeRepository();
    const service = new ChatSessionStartService(repository);

    await expect(
      service.startSession({ studentId: '   ', contextRef: 'lesson:fractions' }),
    ).rejects.toThrow(/studentId is missing/);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('throws and never calls the repository when contextRef is missing', async () => {
    const repository = makeRepository();
    const service = new ChatSessionStartService(repository);

    await expect(
      service.startSession({ studentId: 'student-1', contextRef: '' }),
    ).rejects.toThrow(/contextRef is missing/);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const repository = makeRepository();
    const service = new ChatSessionStartService(repository);

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
      require.resolve('../chat-session-start.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
