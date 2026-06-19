/**
 * P8-069: Add AI Teacher Rate Limit Policy — unit tests.
 * Tests cover every threshold (debounce, session, hourly, daily) and the
 * happy-path where no limit is exceeded.  No real DB or AI provider is
 * used; the `AiChatMessageRepository` is fully mocked.
 */
import { RateLimitPolicyService } from '../rate-limit-policy.service';
import { RateLimitExceededError } from '../rate-limit-exceeded.error';
import {
  AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION,
  AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY,
  AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR,
  AI_TEACHER_RATE_LIMIT_MIN_TURN_GAP_MS,
} from '../rate-limit-policy.constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRepo(overrides: Partial<{
  countStudentTurnsBySession: jest.Mock;
  countStudentTurnsSince: jest.Mock;
  findLastStudentTurnCreatedAt: jest.Mock;
}> = {}) {
  return {
    countStudentTurnsBySession:
      overrides.countStudentTurnsBySession ?? jest.fn().mockResolvedValue(0),
    countStudentTurnsSince:
      overrides.countStudentTurnsSince ?? jest.fn().mockResolvedValue(0),
    findLastStudentTurnCreatedAt:
      overrides.findLastStudentTurnCreatedAt ?? jest.fn().mockResolvedValue(null),
  } as any;
}

const INPUT = { studentId: 'student-1', sessionId: 'session-1' };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RateLimitPolicyService', () => {
  describe('happy path — all limits within bounds', () => {
    it('resolves without throwing when no limit is exceeded', async () => {
      const service = new RateLimitPolicyService(makeRepo());
      await expect(service.assertNotRateLimited(INPUT)).resolves.toBeUndefined();
    });
  });

  describe('debounce (MIN_TURN_GAP)', () => {
    it('throws RateLimitExceededError with reason MIN_TURN_GAP when last message is too recent', async () => {
      const recentDate = new Date(Date.now() - Math.floor(AI_TEACHER_RATE_LIMIT_MIN_TURN_GAP_MS / 2));
      const service = new RateLimitPolicyService(
        makeRepo({ findLastStudentTurnCreatedAt: jest.fn().mockResolvedValue(recentDate) }),
      );

      await expect(service.assertNotRateLimited(INPUT)).rejects.toThrow(RateLimitExceededError);
      await expect(service.assertNotRateLimited(INPUT)).rejects.toMatchObject({
        reason: 'MIN_TURN_GAP',
      });
    });

    it('does not throw when last message is old enough', async () => {
      const oldEnough = new Date(Date.now() - AI_TEACHER_RATE_LIMIT_MIN_TURN_GAP_MS - 100);
      const service = new RateLimitPolicyService(
        makeRepo({ findLastStudentTurnCreatedAt: jest.fn().mockResolvedValue(oldEnough) }),
      );
      await expect(service.assertNotRateLimited(INPUT)).resolves.toBeUndefined();
    });

    it('does not throw when no previous student message exists', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({ findLastStudentTurnCreatedAt: jest.fn().mockResolvedValue(null) }),
      );
      await expect(service.assertNotRateLimited(INPUT)).resolves.toBeUndefined();
    });
  });

  describe('session turn limit (SESSION_TURN_LIMIT)', () => {
    it('throws when session has reached the max turns', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({
          countStudentTurnsBySession: jest
            .fn()
            .mockResolvedValue(AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION),
        }),
      );
      await expect(service.assertNotRateLimited(INPUT)).rejects.toMatchObject({
        reason: 'SESSION_TURN_LIMIT',
      });
    });

    it('does not throw when session is one below the limit', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({
          countStudentTurnsBySession: jest
            .fn()
            .mockResolvedValue(AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION - 1),
        }),
      );
      await expect(service.assertNotRateLimited(INPUT)).resolves.toBeUndefined();
    });
  });

  describe('hourly limit (STUDENT_HOURLY_LIMIT)', () => {
    it('throws when student has reached the hourly limit', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({
          // First call (hourly window): at limit; second call (daily window): below limit
          countStudentTurnsSince: jest
            .fn()
            .mockResolvedValueOnce(AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR)
            .mockResolvedValueOnce(0),
        }),
      );
      await expect(service.assertNotRateLimited(INPUT)).rejects.toMatchObject({
        reason: 'STUDENT_HOURLY_LIMIT',
      });
    });

    it('does not throw when student is one below the hourly limit', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({
          countStudentTurnsSince: jest
            .fn()
            .mockResolvedValue(AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR - 1),
        }),
      );
      await expect(service.assertNotRateLimited(INPUT)).resolves.toBeUndefined();
    });
  });

  describe('daily limit (STUDENT_DAILY_LIMIT)', () => {
    it('throws when student has reached the daily limit', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({
          countStudentTurnsSince: jest
            .fn()
            // hourly check: below limit
            .mockResolvedValueOnce(0)
            // daily check: at limit
            .mockResolvedValueOnce(AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY),
        }),
      );
      await expect(service.assertNotRateLimited(INPUT)).rejects.toMatchObject({
        reason: 'STUDENT_DAILY_LIMIT',
      });
    });

    it('does not throw when student is one below the daily limit', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({
          countStudentTurnsSince: jest
            .fn()
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_DAY - 1),
        }),
      );
      await expect(service.assertNotRateLimited(INPUT)).resolves.toBeUndefined();
    });
  });

  describe('RateLimitExceededError', () => {
    it('retryAfterSeconds is null for session turn limit (no meaningful retry time)', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({
          countStudentTurnsBySession: jest
            .fn()
            .mockResolvedValue(AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_SESSION),
        }),
      );
      let err: RateLimitExceededError | undefined;
      try {
        await service.assertNotRateLimited(INPUT);
      } catch (e) {
        err = e as RateLimitExceededError;
      }
      expect(err?.retryAfterSeconds).toBeNull();
    });

    it('retryAfterSeconds is set for the hourly limit', async () => {
      const service = new RateLimitPolicyService(
        makeRepo({
          countStudentTurnsSince: jest
            .fn()
            .mockResolvedValueOnce(AI_TEACHER_RATE_LIMIT_MAX_TURNS_PER_STUDENT_HOUR)
            .mockResolvedValueOnce(0),
        }),
      );
      let err: RateLimitExceededError | undefined;
      try {
        await service.assertNotRateLimited(INPUT);
      } catch (e) {
        err = e as RateLimitExceededError;
      }
      expect(err?.retryAfterSeconds).toBeGreaterThan(0);
    });
  });
});
