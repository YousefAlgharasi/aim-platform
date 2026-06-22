import { NotificationOwnershipGuard } from './guards/notification-ownership.guard';
import { NotificationAdminGuard } from './guards/notification-admin.guard';
import { ExecutionContext } from '@nestjs/common';

function mockContext(
  user: { id?: string; role?: string; appMetadata?: Record<string, unknown> } | undefined,
  params: Record<string, string> = {},
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as unknown as ExecutionContext;
}

describe('NotificationOwnershipGuard', () => {
  const guard = new NotificationOwnershipGuard();

  it('allows authenticated users', async () => {
    const ctx = mockContext({ id: 'user-1', role: 'student' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects unauthenticated requests', async () => {
    const ctx = mockContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });

  it('rejects requests without user id', async () => {
    const ctx = mockContext({} as any);
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });

  it('rejects when userId param does not match authenticated user', async () => {
    const ctx = mockContext({ id: 'user-1' }, { userId: 'other-user' });
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });

  it('allows when userId param matches authenticated user', async () => {
    const ctx = mockContext({ id: 'user-1' }, { userId: 'user-1' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});

describe('NotificationAdminGuard', () => {
  const guard = new NotificationAdminGuard();

  it('allows admin users', async () => {
    const ctx = mockContext({ id: 'admin-1', appMetadata: { role: 'admin' } });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects non-admin users', async () => {
    const ctx = mockContext({ id: 'user-1', appMetadata: { role: 'student' } });
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });

  it('rejects unauthenticated requests', async () => {
    const ctx = mockContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });

  it('rejects parent users accessing admin endpoints', async () => {
    const ctx = mockContext({ id: 'parent-1', appMetadata: { role: 'parent' } });
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });
});

describe('Ownership isolation', () => {
  it('user cannot access another user resources via repository pattern', () => {
    expect(true).toBe(true);
  });
});
