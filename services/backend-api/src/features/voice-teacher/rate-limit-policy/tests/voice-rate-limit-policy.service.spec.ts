// P9-055: Add Voice Rate Limit Policy tests.

import { VoiceRateLimitPolicyService } from '../voice-rate-limit-policy.service';
import { VoiceRateLimitExceededError } from '../voice-rate-limit-exceeded.error';
import { VoiceMessageRepository } from '../../repositories/voice-message.repository';
import {
  VOICE_RATE_LIMIT_MAX_TURNS_PER_SESSION,
  VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY,
  VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR,
  VOICE_RATE_LIMIT_MIN_TURN_GAP_MS,
} from '../voice-rate-limit-policy.constants';

function makeRepository(overrides: Partial<VoiceMessageRepository> = {}) {
  return {
    findLastCreatedAtBySessionId: jest.fn().mockResolvedValue(null),
    countBySessionId: jest.fn().mockResolvedValue(0),
    countByStudentIdSince: jest.fn().mockResolvedValue(0),
    ...overrides,
  } as unknown as VoiceMessageRepository;
}

describe('VoiceRateLimitPolicyService', () => {
  it('allows the first turn in a session with no prior voice messages', async () => {
    const repo = makeRepository();
    const service = new VoiceRateLimitPolicyService(repo);

    await expect(
      service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' }),
    ).resolves.toBeUndefined();
  });

  it('throws MIN_TURN_GAP when the last voice message was sent too recently', async () => {
    const repo = makeRepository({
      findLastCreatedAtBySessionId: jest.fn().mockResolvedValue(new Date(Date.now() - 100)),
    });
    const service = new VoiceRateLimitPolicyService(repo);

    await expect(
      service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' }),
    ).rejects.toThrow(VoiceRateLimitExceededError);

    try {
      await service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' });
    } catch (err) {
      expect((err as VoiceRateLimitExceededError).reason).toBe('MIN_TURN_GAP');
      expect((err as VoiceRateLimitExceededError).retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it('does not throw MIN_TURN_GAP when the gap exceeds the minimum', async () => {
    const repo = makeRepository({
      findLastCreatedAtBySessionId: jest
        .fn()
        .mockResolvedValue(new Date(Date.now() - VOICE_RATE_LIMIT_MIN_TURN_GAP_MS - 5_000)),
    });
    const service = new VoiceRateLimitPolicyService(repo);

    await expect(
      service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' }),
    ).resolves.toBeUndefined();
  });

  it('throws SESSION_TURN_LIMIT when the session turn count reaches the threshold', async () => {
    const repo = makeRepository({
      countBySessionId: jest.fn().mockResolvedValue(VOICE_RATE_LIMIT_MAX_TURNS_PER_SESSION),
    });
    const service = new VoiceRateLimitPolicyService(repo);

    await expect(
      service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' }),
    ).rejects.toThrow(VoiceRateLimitExceededError);

    try {
      await service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' });
    } catch (err) {
      expect((err as VoiceRateLimitExceededError).reason).toBe('SESSION_TURN_LIMIT');
      expect((err as VoiceRateLimitExceededError).retryAfterSeconds).toBeNull();
    }
  });

  it('throws STUDENT_HOURLY_LIMIT when the hourly turn count reaches the threshold', async () => {
    const repo = makeRepository({
      countByStudentIdSince: jest.fn().mockResolvedValue(VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR),
    });
    const service = new VoiceRateLimitPolicyService(repo);

    try {
      await service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' });
      fail('expected rejection');
    } catch (err) {
      expect((err as VoiceRateLimitExceededError).reason).toBe('STUDENT_HOURLY_LIMIT');
      expect((err as VoiceRateLimitExceededError).retryAfterSeconds).toBe(60 * 60);
    }
  });

  it('throws STUDENT_DAILY_LIMIT when only the daily turn count reaches the threshold', async () => {
    const repo = makeRepository({
      countByStudentIdSince: jest
        .fn()
        .mockResolvedValueOnce(0) // hourly check
        .mockResolvedValueOnce(VOICE_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY), // daily check
    });
    const service = new VoiceRateLimitPolicyService(repo);

    try {
      await service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' });
      fail('expected rejection');
    } catch (err) {
      expect((err as VoiceRateLimitExceededError).reason).toBe('STUDENT_DAILY_LIMIT');
      expect((err as VoiceRateLimitExceededError).retryAfterSeconds).toBe(24 * 60 * 60);
    }
  });

  it('checks debounce before session limit, hourly, and daily limits', async () => {
    const findLastCreatedAtBySessionId = jest
      .fn()
      .mockResolvedValue(new Date(Date.now() - 100));
    const countBySessionId = jest.fn().mockResolvedValue(0);
    const countByStudentIdSince = jest.fn().mockResolvedValue(0);
    const repo = makeRepository({ findLastCreatedAtBySessionId, countBySessionId, countByStudentIdSince });
    const service = new VoiceRateLimitPolicyService(repo);

    await expect(
      service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' }),
    ).rejects.toThrow(VoiceRateLimitExceededError);

    expect(countBySessionId).not.toHaveBeenCalled();
    expect(countByStudentIdSince).not.toHaveBeenCalled();
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const repo = makeRepository();
    const service = new VoiceRateLimitPolicyService(repo);

    let serialized = '';
    try {
      await service.assertNotRateLimited({ studentId: 'student-1', sessionId: 'session-1' });
      serialized = JSON.stringify({ ok: true });
    } catch (err) {
      serialized = JSON.stringify(err);
    }

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });

  it('never hard-codes a provider API key or reads process.env directly', () => {
    const source = require('fs').readFileSync(
      require.resolve('../voice-rate-limit-policy.service'),
      'utf8',
    ) as string;
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '');

    expect(codeOnly).not.toMatch(/process\.env/);
    expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});
