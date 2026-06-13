// Phase 2 — P2-033
// ProfileOwnershipGuard unit tests.

import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { ProfileOwnershipGuard } from './profile-ownership.guard';
import { PROFILE_OWNERSHIP_KEY } from './authorization.constants';

const INTERNAL_USER_ID = 'aim-user-uuid-001';
const SUPABASE_UID = 'supabase-uid-abc';
const OTHER_USER_ID = 'aim-user-uuid-999';

function makeUser(id: string) {
  return { id, email: 'user@test.com', userType: 'student', status: 'active' };
}

function makeContext(overrides: {
  requiresOwnership?: boolean;
  supabaseUid?: string;
  body?: Record<string, unknown>;
  withoutUser?: boolean;
}): ExecutionContext {
  const {
    requiresOwnership = true,
    supabaseUid = SUPABASE_UID,
    body = {},
    withoutUser = false,
  } = overrides;

  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiresOwnership),
  } as unknown as Reflector;

  const request = {
    user: withoutUser ? undefined : { id: supabaseUid },
    body,
  };

  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return context;
}

function makeUsersService(
  user: { id: string; email: string; userType: string; status: string } | null,
) {
  return {
    findBySupabaseUid: jest.fn().mockResolvedValue(user),
  };
}

describe('ProfileOwnershipGuard', () => {
  function buildGuard(usersServiceUser: ReturnType<typeof makeUser> | null) {
    const reflector = new Reflector();
    const usersService = makeUsersService(usersServiceUser);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    return new ProfileOwnershipGuard(reflector, usersService as never);
  }

  describe('when @RequireProfileOwnership() is not set', () => {
    it('returns true without any checks', async () => {
      const reflector = new Reflector();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const guard = new ProfileOwnershipGuard(reflector, {} as never);
      const ctx = makeContext({ requiresOwnership: false });
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });
  });

  describe('when @RequireProfileOwnership() is set', () => {
    it('allows an active user with no body ID fields', async () => {
      const guard = buildGuard(makeUser(INTERNAL_USER_ID));
      const ctx = makeContext({ body: {} });
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('allows an active user who echoes their own internal user ID in the body', async () => {
      const guard = buildGuard(makeUser(INTERNAL_USER_ID));
      const ctx = makeContext({ body: { userId: INTERNAL_USER_ID } });
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });

    it('throws UNAUTHORIZED when request has no user (JWT guard not applied)', async () => {
      const guard = buildGuard(makeUser(INTERNAL_USER_ID));
      const ctx = makeContext({ withoutUser: true });
      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
      } as Partial<AppError>);
    });

    it('throws UNAUTHORIZED when Supabase UID has no internal AIM account', async () => {
      const guard = buildGuard(null);
      const ctx = makeContext({});
      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
      } as Partial<AppError>);
    });

    it('throws FORBIDDEN when user account is suspended', async () => {
      const guard = buildGuard({ ...makeUser(INTERNAL_USER_ID), status: 'suspended' });
      const ctx = makeContext({});
      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.FORBIDDEN,
        statusCode: HttpStatus.FORBIDDEN,
      } as Partial<AppError>);
    });

    it('throws FORBIDDEN when user account is deleted', async () => {
      const guard = buildGuard({ ...makeUser(INTERNAL_USER_ID), status: 'deleted' });
      const ctx = makeContext({});
      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.FORBIDDEN,
        statusCode: HttpStatus.FORBIDDEN,
      } as Partial<AppError>);
    });

    it('throws FORBIDDEN when body contains a userId for a different account', async () => {
      const guard = buildGuard(makeUser(INTERNAL_USER_ID));
      const ctx = makeContext({ body: { userId: OTHER_USER_ID } });
      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.FORBIDDEN,
        statusCode: HttpStatus.FORBIDDEN,
      } as Partial<AppError>);
    });

    it('throws FORBIDDEN when body contains internalUserId for a different account', async () => {
      const guard = buildGuard(makeUser(INTERNAL_USER_ID));
      const ctx = makeContext({ body: { internalUserId: OTHER_USER_ID } });
      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.FORBIDDEN,
        statusCode: HttpStatus.FORBIDDEN,
      } as Partial<AppError>);
    });

    it('throws FORBIDDEN when body contains user_id for a different account', async () => {
      const guard = buildGuard(makeUser(INTERNAL_USER_ID));
      const ctx = makeContext({ body: { user_id: OTHER_USER_ID } });
      await expect(guard.canActivate(ctx)).rejects.toMatchObject({
        code: ApiErrorCode.FORBIDDEN,
        statusCode: HttpStatus.FORBIDDEN,
      } as Partial<AppError>);
    });

    it('attaches resolvedInternalUserId to the request on success', async () => {
      const guard = buildGuard(makeUser(INTERNAL_USER_ID));
      const request = { user: { id: SUPABASE_UID }, body: {} } as Record<string, unknown>;
      const ctx = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext;

      await guard.canActivate(ctx);
      expect(request.resolvedInternalUserId).toBe(INTERNAL_USER_ID);
    });
  });
});
