// P10-032: AssessmentPermissionGuard unit tests.
//
// Scope: Assessment role-based access control only.
//
// Coverage:
//   - No @RequireRoles configured → passes through (auth already checked)
//   - Student role required → student user allowed
//   - Student role required → role-less user denied
//   - Admin role required → admin/super_admin user allowed
//   - Admin role required → student user denied with FORBIDDEN
//   - No authenticated user → UNAUTHORIZED
//   - Security: score/mastery/level metadata must not affect guard decision

import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppError } from '../../../common/errors/app-error';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { AuthenticatedUser } from '../../../auth/authenticated-user';
import { AssessmentPermissionGuard } from './assessment-permission.guard';

function makeUser(role: AuthorizedRole | null): AuthenticatedUser {
  return {
    id: 'user-uuid-001',
    expiresAt: Date.now() + 3600,
    appMetadata: role ? { role } : {},
  };
}

describe('AssessmentPermissionGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let guard: AssessmentPermissionGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new AssessmentPermissionGuard(reflector as unknown as Reflector);
  });

  function makeCtx(user: AuthenticatedUser | undefined): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('passes through when no @RequireRoles configured (auth already enforced)', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = makeCtx(makeUser(AuthorizedRole.STUDENT));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('passes through when required roles array is empty', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const ctx = makeCtx(makeUser(AuthorizedRole.STUDENT));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows a user with STUDENT role on a student-only endpoint', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.STUDENT]);
    const ctx = makeCtx(makeUser(AuthorizedRole.STUDENT));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws UNAUTHORIZED when no authenticated user is present', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.STUDENT]);
    const ctx = makeCtx(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(
      expect.objectContaining({ statusCode: HttpStatus.UNAUTHORIZED } satisfies Partial<AppError>),
    );
  });

  it('throws FORBIDDEN when role-less user attempts student endpoint', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.STUDENT]);
    const ctx = makeCtx(makeUser(null));
    expect(() => guard.canActivate(ctx)).toThrow(
      expect.objectContaining({ statusCode: HttpStatus.FORBIDDEN } satisfies Partial<AppError>),
    );
  });

  it('allows a user with ADMIN role on an admin endpoint', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN]);
    const ctx = makeCtx(makeUser(AuthorizedRole.ADMIN));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows SUPER_ADMIN on an admin endpoint', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN]);
    const ctx = makeCtx(makeUser(AuthorizedRole.SUPER_ADMIN));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws FORBIDDEN when STUDENT attempts admin assessment endpoint', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN]);
    const ctx = makeCtx(makeUser(AuthorizedRole.STUDENT));
    expect(() => guard.canActivate(ctx)).toThrow(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        code: 'FORBIDDEN',
      } satisfies Partial<AppError>),
    );
  });

  it('denies based on role only — scoring payload in user metadata does not grant access', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN]);
    const user: AuthenticatedUser = {
      id: 'user-002',
      expiresAt: Date.now() + 3600,
      appMetadata: {
        role: AuthorizedRole.STUDENT,
        score: 100,
        passed: true,
        latePenaltyApplied: false,
      },
    };
    const ctx = makeCtx(user);
    expect(() => guard.canActivate(ctx)).toThrow(
      expect.objectContaining({ statusCode: HttpStatus.FORBIDDEN } satisfies Partial<AppError>),
    );
  });
});
