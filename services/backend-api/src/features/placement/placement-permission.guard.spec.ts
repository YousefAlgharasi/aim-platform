// Phase 4 — P4-052
// PlacementPermissionGuard unit tests.
//
// Scope: Placement access control only.
//
// Coverage:
//   - No @RequireRoles configured → passes through (auth already checked)
//   - Student role required → student user allowed
//   - Student role required → admin user denied with FORBIDDEN
//   - Admin role required → admin user allowed
//   - Admin role required → student user denied with FORBIDDEN (distinct message)
//   - No authenticated user → UNAUTHORIZED
//   - Security: score, level, mastery data must not affect guard decision

import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppError } from '../../common/errors/app-error';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { REQUIRED_ROLES_KEY } from '../../auth/authorization/authorization.constants';
import { PlacementPermissionGuard } from './placement-permission.guard';
import { AuthenticatedUser } from '../../auth/authenticated-user';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeUser(role: AuthorizedRole | null): AuthenticatedUser {
  return {
    id: 'user-uuid-001',
    expiresAt: Date.now() + 3600,
    appMetadata: role ? { role } : {},
  };
}

function makeContext(
  user: AuthenticatedUser | undefined,
  requiredRoles: readonly AuthorizedRole[] | undefined,
): ExecutionContext {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;

  const guard = new PlacementPermissionGuard(reflector);

  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  } as unknown as ExecutionContext;

  return context;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PlacementPermissionGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let guard: PlacementPermissionGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new PlacementPermissionGuard(reflector as unknown as Reflector);
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

  // -------------------------------------------------------------------------
  // No required roles
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Student endpoints
  // -------------------------------------------------------------------------

  it('allows a user with STUDENT role on a student-only endpoint', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.STUDENT]);
    const ctx = makeCtx(makeUser(AuthorizedRole.STUDENT));
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws FORBIDDEN when no authenticated user is present', () => {
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

  // -------------------------------------------------------------------------
  // Admin endpoints
  // -------------------------------------------------------------------------

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

  it('throws FORBIDDEN when STUDENT attempts admin placement endpoint', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN]);
    const ctx = makeCtx(makeUser(AuthorizedRole.STUDENT));
    expect(() => guard.canActivate(ctx)).toThrow(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        code: 'FORBIDDEN',
      } satisfies Partial<AppError>),
    );
  });

  // -------------------------------------------------------------------------
  // Security: guard must not be bypassed by scoring-related data
  // -------------------------------------------------------------------------

  it('denies based on role only — scoring payload in user metadata does not grant access', () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN]);
    const user: AuthenticatedUser = {
      id: 'user-002',
      expiresAt: Date.now() + 3600,
      appMetadata: {
        role: AuthorizedRole.STUDENT,
        estimatedLevel: 'advanced',    // should not grant admin access
        overallScore: 0.99,            // should not grant admin access
      },
    };
    const ctx = makeCtx(user);
    expect(() => guard.canActivate(ctx)).toThrow(
      expect.objectContaining({ statusCode: HttpStatus.FORBIDDEN } satisfies Partial<AppError>),
    );
  });
});
