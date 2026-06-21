import { AnalyticsAccessPolicyService } from './analytics-access-policy.service';
import { AnalyticsRepository } from './analytics.repository';

describe('AnalyticsAccessPolicyService', () => {
  let analyticsRepository: jest.Mocked<Pick<AnalyticsRepository, 'insertAccessAuditLog'>>;
  let service: AnalyticsAccessPolicyService;

  beforeEach(() => {
    analyticsRepository = { insertAccessAuditLog: jest.fn().mockResolvedValue(undefined) };
    service = new AnalyticsAccessPolicyService(analyticsRepository as unknown as AnalyticsRepository);
  });

  it('denies a role that is not allowed for the report category', async () => {
    const decision = await service.evaluateAccess({
      actorUserId: 'user-1',
      actorRole: 'student',
      category: 'billing',
      action: 'view_dashboard',
      targetType: 'billing',
    });

    expect(decision).toEqual({ allowed: false, reason: 'Role student cannot access billing reports' });
  });

  it('allows admin to bypass scope ownership for a category it is permitted to access', async () => {
    const decision = await service.evaluateAccess({
      actorUserId: 'admin-1',
      actorRole: 'admin',
      category: 'admin',
      action: 'view_dashboard',
      targetType: 'admin',
      scopeOwnerUserId: 'some-other-user',
    });

    expect(decision).toEqual({ allowed: true });
  });

  it('denies a role with no category mapping at all (e.g. system) even with matching scope', async () => {
    const decision = await service.evaluateAccess({
      actorUserId: 'system-1',
      actorRole: 'system' as never,
      category: 'admin',
      action: 'view_dashboard',
      targetType: 'admin',
      scopeOwnerUserId: 'system-1',
    });

    expect(decision.allowed).toBe(false);
  });

  it('allows a non-admin role when scope ownership matches the actor', async () => {
    const decision = await service.evaluateAccess({
      actorUserId: 'parent-1',
      actorRole: 'parent',
      category: 'parent',
      action: 'view_dashboard',
      targetType: 'parent',
      scopeOwnerUserId: 'parent-1',
    });

    expect(decision).toEqual({ allowed: true });
  });

  it('denies a non-admin role when scope ownership does not match the actor', async () => {
    const decision = await service.evaluateAccess({
      actorUserId: 'parent-1',
      actorRole: 'parent',
      category: 'parent',
      action: 'view_dashboard',
      targetType: 'parent',
      scopeOwnerUserId: 'parent-2',
    });

    expect(decision).toEqual({
      allowed: false,
      reason: "Scope is outside the requester's own data",
    });
  });

  it('allows a non-admin role when no scope owner is specified', async () => {
    const decision = await service.evaluateAccess({
      actorUserId: 'student-1',
      actorRole: 'student',
      category: 'learning',
      action: 'view_dashboard',
      targetType: 'learning',
    });

    expect(decision).toEqual({ allowed: true });
  });

  it('writes an audit log entry for an allowed decision', async () => {
    await service.evaluateAccess({
      actorUserId: 'admin-1',
      actorRole: 'admin',
      category: 'admin',
      action: 'run_report',
      targetType: 'admin',
      targetId: 'target-1',
    });

    expect(analyticsRepository.insertAccessAuditLog).toHaveBeenCalledWith({
      actorUserId: 'admin-1',
      actorRole: 'admin',
      action: 'run_report',
      targetType: 'admin',
      targetId: 'target-1',
      scope: { category: 'admin' },
      result: 'allowed',
    });
  });

  it('writes an audit log entry for a denied decision', async () => {
    await service.evaluateAccess({
      actorUserId: 'student-1',
      actorRole: 'student',
      category: 'curriculum',
      action: 'view_dashboard',
      targetType: 'curriculum',
    });

    expect(analyticsRepository.insertAccessAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ result: 'denied' }),
    );
  });

  it.each([
    ['learning', ['admin', 'parent', 'student']],
    ['curriculum', ['admin']],
    ['assessment', ['admin', 'parent', 'student']],
    ['notification', ['admin']],
    ['billing', ['admin', 'parent']],
    ['user', ['admin']],
    ['admin', ['admin']],
    ['parent', ['parent']],
    ['student', ['student']],
  ] as const)('only allows %s reports for roles %p', async (category, allowedRoles) => {
    for (const role of ['student', 'parent', 'admin'] as const) {
      const decision = await service.evaluateAccess({
        actorUserId: 'user-1',
        actorRole: role,
        category,
        action: 'view_dashboard',
        targetType: category,
      });

      expect(decision.allowed).toBe((allowedRoles as readonly string[]).includes(role));
    }
  });
});
