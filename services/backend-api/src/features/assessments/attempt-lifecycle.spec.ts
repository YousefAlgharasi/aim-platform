// P10-043: Attempt lifecycle tests.
//
// Scope: Exhaustive tests for the attempt state machine — start, resume,
//        submit, expire, duplicate submit, max attempts, ownership.
//
// Security rules verified:
//   - Attempt eligibility (deadline, max attempts) is always backend-evaluated.
//   - expiresAt is backend-computed from time_limit_seconds.
//   - No client-supplied score, correctness, or eligibility is accepted.
//   - Ownership is enforced — wrong student is rejected.

import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttemptLifecycleService } from './assessment-attempt.service';

const BASE_ATTEMPT = {
  id: 'att-1', assessment_id: 'a-1', student_id: 'stu-1',
  attempt_number: 1, status: 'started',
  started_at: new Date(), submitted_at: null, expires_at: null,
};

function makeRepo(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    findPublishedById: jest.fn().mockResolvedValue({ id: 'a-1' }),
    countAttemptsByStudent: jest.fn().mockResolvedValue(0),
    createAttempt: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT }),
    findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT }),
    findActiveAttempt: jest.fn().mockResolvedValue(null),
    updateAttemptStatus: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeDb(opts: { max_attempts?: number; time_limit_seconds?: number | null } = {}) {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [{ max_attempts: opts.max_attempts ?? 3, time_limit_seconds: opts.time_limit_seconds ?? null }],
    }),
  };
}

function makeDeadline(eligible = true, reason?: string) {
  return {
    checkSubmissionEligibility: jest.fn().mockResolvedValue({
      eligible, isLate: false, latePenaltyPercent: 0,
      reason: eligible ? undefined : (reason ?? 'DEADLINE_CLOSED'),
    }),
  };
}

describe('Attempt Lifecycle (P10-043)', () => {
  // -----------------------------------------------------------------------
  // Start attempt
  // -----------------------------------------------------------------------
  describe('startAttempt', () => {
    it('creates attempt when eligible and under max attempts', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      const result = await svc.startAttempt('a-1', 'stu-1');
      expect(result.status).toBe('started');
      expect(result.attemptId).toBe('att-1');
      expect(result.assessmentId).toBe('a-1');
    });

    it('rejects when deadline is closed', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline(false) as any);
      await expect(svc.startAttempt('a-1', 'stu-1')).rejects.toThrow(ConflictException);
    });

    it('rejects when deadline is not yet open', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline(false, 'DEADLINE_NOT_OPEN') as any);
      await expect(svc.startAttempt('a-1', 'stu-1')).rejects.toThrow(ConflictException);
    });

    it('rejects when max attempts reached (exact limit)', async () => {
      const repo = makeRepo({ countAttemptsByStudent: jest.fn().mockResolvedValue(3) });
      const svc = new AttemptLifecycleService(makeDb({ max_attempts: 3 }) as any, repo as any, makeDeadline() as any);
      await expect(svc.startAttempt('a-1', 'stu-1')).rejects.toThrow('MAX_ATTEMPTS_REACHED');
    });

    it('rejects when attempts exceed limit', async () => {
      const repo = makeRepo({ countAttemptsByStudent: jest.fn().mockResolvedValue(5) });
      const svc = new AttemptLifecycleService(makeDb({ max_attempts: 3 }) as any, repo as any, makeDeadline() as any);
      await expect(svc.startAttempt('a-1', 'stu-1')).rejects.toThrow('MAX_ATTEMPTS_REACHED');
    });

    it('allows start when attempts < max', async () => {
      const repo = makeRepo({ countAttemptsByStudent: jest.fn().mockResolvedValue(2) });
      const svc = new AttemptLifecycleService(makeDb({ max_attempts: 3 }) as any, repo as any, makeDeadline() as any);
      const result = await svc.startAttempt('a-1', 'stu-1');
      expect(result.status).toBe('started');
    });

    it('computes expiresAt from time_limit_seconds', async () => {
      const svc = new AttemptLifecycleService(
        makeDb({ time_limit_seconds: 600 }) as any, makeRepo() as any, makeDeadline() as any,
      );
      const result = await svc.startAttempt('a-1', 'stu-1');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('expiresAt is null when no time limit', async () => {
      const svc = new AttemptLifecycleService(
        makeDb({ time_limit_seconds: null }) as any, makeRepo() as any, makeDeadline() as any,
      );
      const result = await svc.startAttempt('a-1', 'stu-1');
      expect(result.expiresAt).toBeNull();
    });

    it('uses default settings when no settings row exists', async () => {
      const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
      const svc = new AttemptLifecycleService(db as any, makeRepo() as any, makeDeadline() as any);
      const result = await svc.startAttempt('a-1', 'stu-1');
      expect(result.status).toBe('started');
    });

    it('only accepts (assessmentId, studentId) — no client scoring params', () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      expect(svc.startAttempt.length).toBe(2);
    });
  });

  // -----------------------------------------------------------------------
  // Resume attempt
  // -----------------------------------------------------------------------
  describe('resumeAttempt', () => {
    it('resumes a started attempt', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      const result = await svc.resumeAttempt('att-1', 'stu-1');
      expect(result.status).toBe('in_progress');
    });

    it('resumes an in_progress attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'in_progress' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      const result = await svc.resumeAttempt('att-1', 'stu-1');
      expect(result.status).toBe('in_progress');
    });

    it('rejects resume of submitted attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'submitted' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.resumeAttempt('att-1', 'stu-1')).rejects.toThrow('ATTEMPT_NOT_RESUMABLE');
    });

    it('rejects resume of graded attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'graded' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.resumeAttempt('att-1', 'stu-1')).rejects.toThrow('ATTEMPT_NOT_RESUMABLE');
    });

    it('rejects resume of expired attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'expired' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.resumeAttempt('att-1', 'stu-1')).rejects.toThrow('ATTEMPT_NOT_RESUMABLE');
    });

    it('rejects wrong student (ownership enforcement)', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      await expect(svc.resumeAttempt('att-1', 'stu-OTHER')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for missing attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue(null) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.resumeAttempt('att-x', 'stu-1')).rejects.toThrow(NotFoundException);
    });
  });

  // -----------------------------------------------------------------------
  // Submit attempt
  // -----------------------------------------------------------------------
  describe('submitAttempt', () => {
    it('submits a started attempt', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      const result = await svc.submitAttempt('att-1', 'stu-1');
      expect(result.status).toBe('submitted');
      expect(result.submittedAt).toBeInstanceOf(Date);
    });

    it('submits an in_progress attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'in_progress' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      const result = await svc.submitAttempt('att-1', 'stu-1');
      expect(result.status).toBe('submitted');
    });

    it('recovers an already-submitted attempt with its existing submittedAt instead of throwing — the flow service (not attempt status alone) decides whether a result already exists', async () => {
      const submittedAt = new Date('2026-01-01T00:00:00.000Z');
      const repo = makeRepo({
        findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'submitted', submitted_at: submittedAt }),
      });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      const result = await svc.submitAttempt('att-1', 'stu-1');
      expect(result).toEqual({ attemptId: 'att-1', status: 'submitted', submittedAt, resultId: null });
    });

    it('recovers an already-graded attempt the same way', async () => {
      const submittedAt = new Date('2026-01-01T00:00:00.000Z');
      const repo = makeRepo({
        findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'graded', submitted_at: submittedAt }),
      });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      const result = await svc.submitAttempt('att-1', 'stu-1');
      expect(result).toEqual({ attemptId: 'att-1', status: 'submitted', submittedAt, resultId: null });
    });

    it('rejects submit of expired attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'expired' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      const call = svc.submitAttempt('att-1', 'stu-1');
      await expect(call).rejects.toMatchObject({ code: 'ATTEMPT_INVALID', statusCode: 409 });
    });

    it('rejects submit when deadline blocks it', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline(false) as any);
      const call = svc.submitAttempt('att-1', 'stu-1');
      await expect(call).rejects.toMatchObject({ code: 'DEADLINE_BLOCKS_SUBMISSION', statusCode: 409 });
    });

    it('rejects wrong student (ownership enforcement) with a not-found error, not forbidden — avoids leaking attempt existence', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      const call = svc.submitAttempt('att-1', 'stu-OTHER');
      await expect(call).rejects.toThrow('Assessment attempt not found');
      await expect(call).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws a not-found error for missing attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue(null) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      const call = svc.submitAttempt('att-x', 'stu-1');
      await expect(call).rejects.toMatchObject({ code: 'ATTEMPT_NOT_FOUND', statusCode: 404 });
    });

    it('only accepts (attemptId, studentId) — no client score params', () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      expect(svc.submitAttempt.length).toBe(2);
    });
  });

  // -----------------------------------------------------------------------
  // Expire attempt
  // -----------------------------------------------------------------------
  describe('expireAttempt', () => {
    it('expires a started attempt via DB update', async () => {
      const db = makeDb();
      const svc = new AttemptLifecycleService(db as any, makeRepo() as any, makeDeadline() as any);
      await svc.expireAttempt('att-1');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("status = 'expired'"),
        ['att-1'],
      );
    });

    it('expire SQL only targets started/in_progress attempts', async () => {
      const db = makeDb();
      const svc = new AttemptLifecycleService(db as any, makeRepo() as any, makeDeadline() as any);
      await svc.expireAttempt('att-1');
      const sql: string = db.query.mock.calls[0][0];
      expect(sql).toContain("started");
      expect(sql).toContain("in_progress");
    });
  });

  // -----------------------------------------------------------------------
  // State machine: invalid transitions
  // -----------------------------------------------------------------------
  describe('state machine transitions', () => {
    const statuses = ['submitted', 'graded', 'expired'] as const;

    for (const status of statuses) {
      it(`cannot resume a ${status} attempt`, async () => {
        const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status }) });
        const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
        await expect(svc.resumeAttempt('att-1', 'stu-1')).rejects.toThrow();
      });
    }

    it('cannot submit an expired attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...BASE_ATTEMPT, status: 'expired' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.submitAttempt('att-1', 'stu-1')).rejects.toThrow();
    });
  });
});
