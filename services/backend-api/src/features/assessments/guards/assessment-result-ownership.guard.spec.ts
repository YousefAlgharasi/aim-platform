// P10-032: AssessmentResultOwnershipGuard unit tests.
//
// Scope: Result ownership access control only.
//
// Coverage:
//   - No authenticated user → UNAUTHORIZED
//   - Missing attemptId param → NOT_FOUND
//   - Result does not exist / belongs to another student → NOT_FOUND
//     (AssessmentResultService.findByAttemptId already scopes by studentId,
//     so a mismatched owner surfaces identically to "not found")
//   - Result belongs to the authenticated student → allowed, result attached

import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { AuthenticatedUser } from '../../../auth/authenticated-user';
import { AssessmentResultService, PersistedResult } from '../assessment-result.service';
import {
  AssessmentResultOwnershipGuard,
  ResultOwnershipRequest,
} from './assessment-result-ownership.guard';

function makeUser(id: string): AuthenticatedUser {
  return { id, expiresAt: Date.now() + 3600, appMetadata: {} };
}

function makeResult(overrides: Partial<PersistedResult> = {}): PersistedResult {
  return {
    resultId: 'result-1',
    attemptId: 'attempt-1',
    assessmentId: 'assessment-1',
    studentId: 'student-1',
    score: 80,
    maxScore: 100,
    passed: true,
    latePenaltyApplied: false,
    gradedAt: new Date(),
    ...overrides,
  };
}

describe('AssessmentResultOwnershipGuard', () => {
  let resultService: jest.Mocked<Pick<AssessmentResultService, 'findByAttemptId'>>;
  let guard: AssessmentResultOwnershipGuard;

  beforeEach(() => {
    resultService = { findByAttemptId: jest.fn() };
    guard = new AssessmentResultOwnershipGuard(
      resultService as unknown as AssessmentResultService,
    );
  });

  function makeCtx(
    user: AuthenticatedUser | undefined,
    params: Record<string, string | undefined>,
  ): { ctx: ExecutionContext; request: ResultOwnershipRequest } {
    const request = { user, params } as ResultOwnershipRequest;
    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
    return { ctx, request };
  }

  it('throws UNAUTHORIZED when no authenticated user is present', async () => {
    const { ctx } = makeCtx(undefined, { attemptId: 'attempt-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      expect.objectContaining({ statusCode: HttpStatus.UNAUTHORIZED } satisfies Partial<AppError>),
    );
  });

  it('throws NOT_FOUND when attemptId param is missing', async () => {
    const { ctx } = makeCtx(makeUser('student-1'), {});
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      expect.objectContaining({ statusCode: HttpStatus.NOT_FOUND } satisfies Partial<AppError>),
    );
  });

  it('throws NOT_FOUND when no result is found for this student (not graded, missing, or owned by another student)', async () => {
    resultService.findByAttemptId.mockResolvedValue(null);
    const { ctx } = makeCtx(makeUser('student-1'), { attemptId: 'attempt-1' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'NOT_FOUND',
      } satisfies Partial<AppError>),
    );
    expect(resultService.findByAttemptId).toHaveBeenCalledWith('attempt-1', 'student-1');
  });

  it('allows access and attaches the result when the student owns it', async () => {
    const result = makeResult({ studentId: 'student-1' });
    resultService.findByAttemptId.mockResolvedValue(result);
    const { ctx, request } = makeCtx(makeUser('student-1'), { attemptId: 'attempt-1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.assessmentResult).toEqual(result);
  });
});
