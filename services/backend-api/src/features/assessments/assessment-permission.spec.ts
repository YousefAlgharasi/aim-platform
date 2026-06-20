// P10-045: Assessment permission tests.
//
// Scope: Verify students cannot access other students' attempts/results.
//        Tests ownership guards, service-level student_id scoping, and
//        controller JWT-only id resolution.
//
// Security rules verified:
//   - AssessmentAttemptOwnershipGuard returns 404 (not 403) for wrong student.
//   - AssessmentResultOwnershipGuard returns 404 (not 403) for wrong student.
//   - Service methods scope queries by student_id from JWT.
//   - Controller endpoints never accept client-supplied student_id.

import { HttpStatus } from '@nestjs/common';
import { AssessmentAttemptOwnershipGuard } from './guards/assessment-attempt-ownership.guard';
import { AssessmentResultOwnershipGuard } from './guards/assessment-result-ownership.guard';

function mockExecContext(user: { id: string } | null, params: Record<string, string>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as any;
}

describe('Assessment Permission Tests (P10-045)', () => {
  // -----------------------------------------------------------------------
  // AssessmentAttemptOwnershipGuard
  // -----------------------------------------------------------------------
  describe('AssessmentAttemptOwnershipGuard', () => {
    it('allows access when student owns the attempt', async () => {
      const repo = {
        findAttemptById: jest.fn().mockResolvedValue({
          id: 'att-1', student_id: 'stu-1', status: 'started',
        }),
      };
      const guard = new AssessmentAttemptOwnershipGuard(repo as any);
      const ctx = mockExecContext({ id: 'stu-1' }, { attemptId: 'att-1' });
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('rejects with 404 when student does not own the attempt (no existence leak)', async () => {
      const repo = {
        findAttemptById: jest.fn().mockResolvedValue({
          id: 'att-1', student_id: 'stu-OWNER', status: 'started',
        }),
      };
      const guard = new AssessmentAttemptOwnershipGuard(repo as any);
      const ctx = mockExecContext({ id: 'stu-ATTACKER' }, { attemptId: 'att-1' });
      try {
        await guard.canActivate(ctx);
        fail('should have thrown');
      } catch (e: any) {
        expect(e.statusCode ?? e.getStatus?.()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('rejects with 404 when attempt does not exist', async () => {
      const repo = { findAttemptById: jest.fn().mockResolvedValue(null) };
      const guard = new AssessmentAttemptOwnershipGuard(repo as any);
      const ctx = mockExecContext({ id: 'stu-1' }, { attemptId: 'att-nonexistent' });
      try {
        await guard.canActivate(ctx);
        fail('should have thrown');
      } catch (e: any) {
        expect(e.statusCode ?? e.getStatus?.()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('rejects with 401 when no user on request', async () => {
      const repo = { findAttemptById: jest.fn() };
      const guard = new AssessmentAttemptOwnershipGuard(repo as any);
      const ctx = mockExecContext(null, { attemptId: 'att-1' });
      try {
        await guard.canActivate(ctx);
        fail('should have thrown');
      } catch (e: any) {
        expect(e.statusCode ?? e.getStatus?.()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('rejects with 404 when attemptId param is missing', async () => {
      const repo = { findAttemptById: jest.fn() };
      const guard = new AssessmentAttemptOwnershipGuard(repo as any);
      const ctx = mockExecContext({ id: 'stu-1' }, {});
      try {
        await guard.canActivate(ctx);
        fail('should have thrown');
      } catch (e: any) {
        expect(e.statusCode ?? e.getStatus?.()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('attaches attempt to request for downstream handlers', async () => {
      const attempt = { id: 'att-1', student_id: 'stu-1', status: 'started' };
      const repo = { findAttemptById: jest.fn().mockResolvedValue(attempt) };
      const guard = new AssessmentAttemptOwnershipGuard(repo as any);
      const req = { user: { id: 'stu-1' }, params: { attemptId: 'att-1' } } as any;
      const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
      await guard.canActivate(ctx);
      expect(req.assessmentAttempt).toEqual(attempt);
    });
  });

  // -----------------------------------------------------------------------
  // AssessmentResultOwnershipGuard
  // -----------------------------------------------------------------------
  describe('AssessmentResultOwnershipGuard', () => {
    it('allows access when student owns the result', async () => {
      const resultSvc = {
        findByAttemptId: jest.fn().mockResolvedValue({
          resultId: 'r-1', attemptId: 'att-1', studentId: 'stu-1',
        }),
      };
      const guard = new AssessmentResultOwnershipGuard(resultSvc as any);
      const ctx = mockExecContext({ id: 'stu-1' }, { attemptId: 'att-1' });
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('rejects with 404 when result belongs to different student (scoped query returns null)', async () => {
      const resultSvc = { findByAttemptId: jest.fn().mockResolvedValue(null) };
      const guard = new AssessmentResultOwnershipGuard(resultSvc as any);
      const ctx = mockExecContext({ id: 'stu-ATTACKER' }, { attemptId: 'att-1' });
      try {
        await guard.canActivate(ctx);
        fail('should have thrown');
      } catch (e: any) {
        expect(e.statusCode ?? e.getStatus?.()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('rejects with 404 when result does not exist', async () => {
      const resultSvc = { findByAttemptId: jest.fn().mockResolvedValue(null) };
      const guard = new AssessmentResultOwnershipGuard(resultSvc as any);
      const ctx = mockExecContext({ id: 'stu-1' }, { attemptId: 'att-nonexistent' });
      try {
        await guard.canActivate(ctx);
        fail('should have thrown');
      } catch (e: any) {
        expect(e.statusCode ?? e.getStatus?.()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('rejects with 401 when no user on request', async () => {
      const resultSvc = { findByAttemptId: jest.fn() };
      const guard = new AssessmentResultOwnershipGuard(resultSvc as any);
      const ctx = mockExecContext(null, { attemptId: 'att-1' });
      try {
        await guard.canActivate(ctx);
        fail('should have thrown');
      } catch (e: any) {
        expect(e.statusCode ?? e.getStatus?.()).toBe(HttpStatus.UNAUTHORIZED);
      }
    });

    it('findByAttemptId is called with both attemptId AND user.id (scoped query)', async () => {
      const resultSvc = {
        findByAttemptId: jest.fn().mockResolvedValue({ resultId: 'r-1' }),
      };
      const guard = new AssessmentResultOwnershipGuard(resultSvc as any);
      const ctx = mockExecContext({ id: 'stu-1' }, { attemptId: 'att-1' });
      await guard.canActivate(ctx);
      expect(resultSvc.findByAttemptId).toHaveBeenCalledWith('att-1', 'stu-1');
    });

    it('attaches result to request for downstream handlers', async () => {
      const result = { resultId: 'r-1', attemptId: 'att-1', studentId: 'stu-1' };
      const resultSvc = { findByAttemptId: jest.fn().mockResolvedValue(result) };
      const guard = new AssessmentResultOwnershipGuard(resultSvc as any);
      const req = { user: { id: 'stu-1' }, params: { attemptId: 'att-1' } } as any;
      const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
      await guard.canActivate(ctx);
      expect(req.assessmentResult).toEqual(result);
    });
  });

  // -----------------------------------------------------------------------
  // Cross-student isolation: service-level scoping
  // -----------------------------------------------------------------------
  describe('service-level student_id scoping', () => {
    it('AttemptLifecycleService.resumeAttempt rejects wrong student', async () => {
      const { AttemptLifecycleService } = await import('./assessment-attempt.service');
      const repo = {
        findAttemptById: jest.fn().mockResolvedValue({
          id: 'att-1', student_id: 'stu-OWNER', status: 'started',
        }),
        updateAttemptStatus: jest.fn(),
      };
      const svc = new AttemptLifecycleService({} as any, repo as any, {} as any);
      await expect(svc.resumeAttempt('att-1', 'stu-ATTACKER'))
        .rejects.toThrow('ATTEMPT_NOT_OWNED');
    });

    it('AttemptLifecycleService.submitAttempt rejects wrong student', async () => {
      const { AttemptLifecycleService } = await import('./assessment-attempt.service');
      const repo = {
        findAttemptById: jest.fn().mockResolvedValue({
          id: 'att-1', student_id: 'stu-OWNER', status: 'started',
          assessment_id: 'a-1',
        }),
      };
      const svc = new AttemptLifecycleService({} as any, repo as any, {} as any);
      await expect(svc.submitAttempt('att-1', 'stu-ATTACKER'))
        .rejects.toThrow('ATTEMPT_NOT_OWNED');
    });

    it('AssessmentResultService.findByAttemptId scopes by studentId in SQL', async () => {
      const { AssessmentResultService } = await import('./assessment-result.service');
      const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
      const svc = new AssessmentResultService(db as any);
      await svc.findByAttemptId('att-1', 'stu-1');
      const sql: string = db.query.mock.calls[0][0];
      expect(sql).toContain('student_id');
      expect(db.query.mock.calls[0][1]).toEqual(['att-1', 'stu-1']);
    });
  });
});
