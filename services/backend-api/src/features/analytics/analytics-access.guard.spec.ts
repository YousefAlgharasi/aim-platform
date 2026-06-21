import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AnalyticsAccessGuard } from './analytics-access.guard';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { AnalyticsAccessPolicyService } from './analytics-access-policy.service';

function mockExecContext(user: { id: string } | null, params: Record<string, string> = {}) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as any;
}

describe('AnalyticsAccessGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let usersService: jest.Mocked<Pick<UsersService, 'findBySupabaseUid'>>;
  let rolesService: jest.Mocked<Pick<RolesService, 'getUserRoles'>>;
  let policyService: jest.Mocked<Pick<AnalyticsAccessPolicyService, 'evaluateAccess'>>;
  let guard: AnalyticsAccessGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    usersService = { findBySupabaseUid: jest.fn() };
    rolesService = { getUserRoles: jest.fn() };
    policyService = { evaluateAccess: jest.fn() };

    guard = new AnalyticsAccessGuard(
      reflector as unknown as Reflector,
      usersService as unknown as UsersService,
      rolesService as unknown as RolesService,
      policyService as unknown as AnalyticsAccessPolicyService,
    );
  });

  it('allows routes with no analytics access requirement', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = mockExecContext({ id: 'supa-1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(usersService.findBySupabaseUid).not.toHaveBeenCalled();
  });

  it('rejects with 401 when no user on request', async () => {
    reflector.getAllAndOverride.mockReturnValue({ category: 'learning', action: 'view_dashboard' });
    const ctx = mockExecContext(null);

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects with 401 when internal user is missing or inactive', async () => {
    reflector.getAllAndOverride.mockReturnValue({ category: 'learning', action: 'view_dashboard' });
    usersService.findBySupabaseUid.mockResolvedValue(null);
    const ctx = mockExecContext({ id: 'supa-1' });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects with 403 when no analytics-eligible role is found', async () => {
    reflector.getAllAndOverride.mockReturnValue({ category: 'learning', action: 'view_dashboard' });
    usersService.findBySupabaseUid.mockResolvedValue({ id: 'user-1', status: 'active' } as never);
    rolesService.getUserRoles.mockResolvedValue([{ key: 'teacher' } as never]);
    const ctx = mockExecContext({ id: 'supa-1' });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
    expect(policyService.evaluateAccess).not.toHaveBeenCalled();
  });

  it('delegates the access decision to AnalyticsAccessPolicyService and allows when permitted', async () => {
    reflector.getAllAndOverride.mockReturnValue({ category: 'learning', action: 'view_dashboard' });
    usersService.findBySupabaseUid.mockResolvedValue({ id: 'user-1', status: 'active' } as never);
    rolesService.getUserRoles.mockResolvedValue([{ key: 'admin' } as never]);
    policyService.evaluateAccess.mockResolvedValue({ allowed: true });
    const ctx = mockExecContext({ id: 'supa-1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(policyService.evaluateAccess).toHaveBeenCalledWith(
      expect.objectContaining({ actorUserId: 'user-1', actorRole: 'admin', category: 'learning', action: 'view_dashboard' }),
    );
  });

  it('rejects with 403 when AnalyticsAccessPolicyService denies access', async () => {
    reflector.getAllAndOverride.mockReturnValue({ category: 'billing', action: 'run_report' });
    usersService.findBySupabaseUid.mockResolvedValue({ id: 'user-1', status: 'active' } as never);
    rolesService.getUserRoles.mockResolvedValue([{ key: 'student' } as never]);
    policyService.evaluateAccess.mockResolvedValue({ allowed: false, reason: 'Role student cannot access billing reports' });
    const ctx = mockExecContext({ id: 'supa-1' });

    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('resolves scopeOwnerUserId from route params for ownership-scoped access checks', async () => {
    reflector.getAllAndOverride.mockReturnValue({ category: 'student', action: 'view_dashboard' });
    usersService.findBySupabaseUid.mockResolvedValue({ id: 'user-1', status: 'active' } as never);
    rolesService.getUserRoles.mockResolvedValue([{ key: 'student' } as never]);
    policyService.evaluateAccess.mockResolvedValue({ allowed: true });
    const ctx = mockExecContext({ id: 'supa-1' }, { studentId: 'user-1' });

    await guard.canActivate(ctx);

    expect(policyService.evaluateAccess).toHaveBeenCalledWith(
      expect.objectContaining({ scopeOwnerUserId: 'user-1' }),
    );
  });
});
