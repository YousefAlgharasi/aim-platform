// P9-052: Link Voice Session With AI Teacher Context tests.

import { VoiceSessionContextLinkService } from '../voice-session-context-link.service';
import { VoiceSessionRepository } from '../../repositories/voice-session.repository';
import { VoiceSessionRow } from '../../repositories/voice-repository.types';

function makeRow(overrides: Partial<VoiceSessionRow> = {}): VoiceSessionRow {
  return {
    id: 'voice-session-1',
    student_id: 'student-1',
    context_ref: 'lesson:fractions',
    status: 'active',
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

function makeRepository(row: VoiceSessionRow | null = makeRow()) {
  return {
    findById: jest.fn().mockResolvedValue(row),
  } as unknown as VoiceSessionRepository;
}

describe('VoiceSessionContextLinkService', () => {
  it('resolves the contextRef from the backend-owned voice session row', async () => {
    const repository = makeRepository();
    const service = new VoiceSessionContextLinkService(repository);

    const result = await service.resolveContext({ studentId: 'student-1', sessionId: 'voice-session-1' });

    expect(repository.findById).toHaveBeenCalledWith('voice-session-1');
    expect(result).toEqual({
      sessionId: 'voice-session-1',
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
    });
  });

  it('throws when the session does not exist', async () => {
    const repository = makeRepository(null);
    const service = new VoiceSessionContextLinkService(repository);

    await expect(
      service.resolveContext({ studentId: 'student-1', sessionId: 'voice-session-1' }),
    ).rejects.toThrow(/not found or not owned/);
  });

  it('throws when the session belongs to a different student', async () => {
    const repository = makeRepository(makeRow({ student_id: 'student-2' }));
    const service = new VoiceSessionContextLinkService(repository);

    await expect(
      service.resolveContext({ studentId: 'student-1', sessionId: 'voice-session-1' }),
    ).rejects.toThrow(/not found or not owned/);
  });

  it('throws when the session is not active', async () => {
    const repository = makeRepository(makeRow({ status: 'ended' }));
    const service = new VoiceSessionContextLinkService(repository);

    await expect(
      service.resolveContext({ studentId: 'student-1', sessionId: 'voice-session-1' }),
    ).rejects.toThrow(/not active/);
  });

  it('throws and never calls the repository when studentId is missing', async () => {
    const repository = makeRepository();
    const service = new VoiceSessionContextLinkService(repository);

    await expect(
      service.resolveContext({ studentId: '', sessionId: 'voice-session-1' }),
    ).rejects.toThrow(/studentId is missing/);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('throws and never calls the repository when sessionId is missing', async () => {
    const repository = makeRepository();
    const service = new VoiceSessionContextLinkService(repository);

    await expect(
      service.resolveContext({ studentId: 'student-1', sessionId: '' }),
    ).rejects.toThrow(/sessionId is missing/);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const repository = makeRepository();
    const service = new VoiceSessionContextLinkService(repository);

    const result = await service.resolveContext({ studentId: 'student-1', sessionId: 'voice-session-1' });
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
      require.resolve('../voice-session-context-link.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
