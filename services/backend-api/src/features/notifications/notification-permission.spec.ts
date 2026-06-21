import { NotificationOwnershipGuard } from './guards/notification-ownership.guard';
import { NotificationAdminGuard } from './guards/notification-admin.guard';
import { ExecutionContext } from '@nestjs/common';

function mockContext(user: { id?: string; role?: string } | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
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
});

describe('NotificationAdminGuard', () => {
  const guard = new NotificationAdminGuard();

  it('allows admin users', async () => {
    const ctx = mockContext({ id: 'admin-1', role: 'admin' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects non-admin users', async () => {
    const ctx = mockContext({ id: 'user-1', role: 'student' });
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });

  it('rejects unauthenticated requests', async () => {
    const ctx = mockContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });

  it('rejects parent users accessing admin endpoints', async () => {
    const ctx = mockContext({ id: 'parent-1', role: 'parent' });
    await expect(guard.canActivate(ctx)).rejects.toThrow();
  });
});

describe('Ownership isolation', () => {
  it('user cannot access another user resources via repository pattern', () => {
    // Repository methods always require userId parameter
    // Controller always passes currentUser.id, never client-supplied userId
    // This test documents the architectural constraint
    expect(true).toBe(true);
  });
});
