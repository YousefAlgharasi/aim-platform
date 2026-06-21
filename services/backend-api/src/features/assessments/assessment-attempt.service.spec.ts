// P10-025: AttemptLifecycleService unit tests.

import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttemptLifecycleService } from './assessment-attempt.service';

const ATTEMPT = {
  id: 'att-1', assessment_id: 'a-1', student_id: 'stu-1',
  attempt_number: 1, status: 'started',
  started_at: new Date(), submitted_at: null, expires_at: null,
};

function makeRepo(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    findPublishedById: jest.fn().mockResolvedValue({ id: 'a-1', type: 'quiz', title: 'Q', description: null, status: 'published' }),
    countAttemptsByStudent: jest.fn().mockResolvedValue(0),
    createAttempt: jest.fn().mockResolvedValue(ATTEMPT),
    findAttemptById: jest.fn().mockResolvedValue(ATTEMPT),
    updateAttemptStatus: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeDb(settingsRows: { max_attempts: number; time_limit_seconds: number | null }[] = [{ max_attempts: 2, time_limit_seconds: null }]) {
  return { query: jest.fn().mockResolvedValue({ rows: settingsRows }) };
}

function makeDeadline(eligible = true) {
  return {
    checkSubmissionEligibility: jest.fn().mockResolvedValue({
      eligible, isLate: false, latePenaltyPercent: 0,
      reason: eligible ? undefined : 'DEADLINE_CLOSED',
    }),
  };
}

describe('AttemptLifecycleService', () => {
  describe('startAttempt', () => {
    it('creates attempt when eligible', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      const result = await svc.startAttempt('a-1', 'stu-1');
      expect(result.status).toBe('started');
      expect(result.attemptId).toBe('att-1');
    });

    it('throws when deadline closed — backend evaluates, not client', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline(false) as any);
      await expect(svc.startAttempt('a-1', 'stu-1')).rejects.toThrow(ConflictException);
    });

    it('throws MAX_ATTEMPTS_REACHED when at limit', async () => {
      const repo = makeRepo({ countAttemptsByStudent: jest.fn().mockResolvedValue(2) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.startAttempt('a-1', 'stu-1')).rejects.toThrow('MAX_ATTEMPTS_REACHED');
    });

    it('computes expiresAt from time_limit_seconds (backend-only)', async () => {
      const db = makeDb([{ max_attempts: 2, time_limit_seconds: 900 }]);
      const svc = new AttemptLifecycleService(db as any, makeRepo() as any, makeDeadline() as any);
      const result = await svc.startAttempt('a-1', 'stu-1');
      // expiresAt is backend-computed from time_limit_seconds and returned for display
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('startAttempt accepts only (assessmentId, studentId) — no client score fields', () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      expect(svc.startAttempt.length).toBe(2);
    });
  });

  describe('resumeAttempt', () => {
    it('resumes a started attempt', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      const result = await svc.resumeAttempt('att-1', 'stu-1');
      expect(result.status).toBe('in_progress');
    });

    it('throws ForbiddenException for wrong student', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      await expect(svc.resumeAttempt('att-1', 'stu-OTHER')).rejects.toThrow(ForbiddenException);
    });

    it('throws ATTEMPT_NOT_RESUMABLE for submitted attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...ATTEMPT, status: 'submitted' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.resumeAttempt('att-1', 'stu-1')).rejects.toThrow('ATTEMPT_NOT_RESUMABLE');
    });

    it('throws NotFoundException for missing attempt', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue(null) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.resumeAttempt('att-x', 'stu-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('submitAttempt', () => {
    it('submits a started attempt', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      const result = await svc.submitAttempt('att-1', 'stu-1');
      expect(result.status).toBe('submitted');
    });

    it('throws ATTEMPT_ALREADY_SUBMITTED', async () => {
      const repo = makeRepo({ findAttemptById: jest.fn().mockResolvedValue({ ...ATTEMPT, status: 'submitted' }) });
      const svc = new AttemptLifecycleService(makeDb() as any, repo as any, makeDeadline() as any);
      await expect(svc.submitAttempt('att-1', 'stu-1')).rejects.toThrow('ATTEMPT_ALREADY_SUBMITTED');
    });

    it('throws DEADLINE_BLOCKS_SUBMISSION when deadline closed', async () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline(false) as any);
      await expect(svc.submitAttempt('att-1', 'stu-1')).rejects.toThrow('DEADLINE_BLOCKS_SUBMISSION');
    });

    it('submitAttempt never accepts score or correctness fields', () => {
      const svc = new AttemptLifecycleService(makeDb() as any, makeRepo() as any, makeDeadline() as any);
      // Only (attemptId, studentId) — no client score params
      expect(svc.submitAttempt.length).toBe(2);
    });
  });
});
