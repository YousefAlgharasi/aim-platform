// P10-032: AssessmentAttemptOwnershipGuard unit tests.
//
// Scope: Attempt ownership access control only.
//
// Coverage:
//   - No authenticated user → UNAUTHORIZED
//   - Missing attemptId param → NOT_FOUND
//   - Attempt does not exist → NOT_FOUND
//   - Attempt belongs to a different student → NOT_FOUND (no existence leak)
//   - Attempt belongs to the authenticated student → allowed, attempt attached

import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { AuthenticatedUser } from '../../../auth/authenticated-user';
import {
  AssessmentRepository,
  AssessmentAttemptRow,
} from '../assessment.repository';
import {
  AssessmentAttemptOwnershipGuard,
  AttemptOwnershipRequest,
} from './assessment-attempt-ownership.guard';

function makeUser(id: string): AuthenticatedUser {
  return { id, expiresAt: Date.now() + 3600, appMetadata: {} };
}

function makeAttempt(overrides: Partial<AssessmentAttemptRow> = {}): AssessmentAttemptRow {
  return {
    id: 'attempt-1',
    assessment_id: 'assessment-1',
    student_id: 'student-1',
    attempt_number: 1,
    status: 'started',
    started_at: new Date(),
    submitted_at: null,
    expires_at: null,
    ...overrides,
  };
}

describe('AssessmentAttemptOwnershipGuard', () => {
  let repository: jest.Mocked<Pick<AssessmentRepository, 'findAttemptById'>>;
  let guard: AssessmentAttemptOwnershipGuard;

  beforeEach(() => {
    repository = { findAttemptById: jest.fn() };
    guard = new AssessmentAttemptOwnershipGuard(
      repository as unknown as AssessmentRepository,
    );
  });

  function makeCtx(
    user: AuthenticatedUser | undefined,
    params: Record<string, string | undefined>,
  ): { ctx: ExecutionContext; request: AttemptOwnershipRequest } {
    const request = { user, params } as AttemptOwnershipRequest;
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

  it('throws NOT_FOUND when the attempt does not exist', async () => {
    repository.findAttemptById.mockResolvedValue(null);
    const { ctx } = makeCtx(makeUser('student-1'), { attemptId: 'missing-attempt' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      expect.objectContaining({ statusCode: HttpStatus.NOT_FOUND } satisfies Partial<AppError>),
    );
  });

  it('throws NOT_FOUND when the attempt belongs to a different student (no existence leak)', async () => {
    repository.findAttemptById.mockResolvedValue(makeAttempt({ student_id: 'other-student' }));
    const { ctx } = makeCtx(makeUser('student-1'), { attemptId: 'attempt-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'NOT_FOUND',
      } satisfies Partial<AppError>),
    );
  });

  it('allows access and attaches the attempt when the student owns it', async () => {
    const attempt = makeAttempt({ student_id: 'student-1' });
    repository.findAttemptById.mockResolvedValue(attempt);
    const { ctx, request } = makeCtx(makeUser('student-1'), { attemptId: 'attempt-1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.assessmentAttempt).toEqual(attempt);
  });
});
