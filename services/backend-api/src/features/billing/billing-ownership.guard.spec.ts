import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingOwnershipGuard, BillingRoleGuard } from './billing-ownership.guard';

function createMockContext(user: any = null): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('BillingOwnershipGuard', () => {
  let guard: BillingOwnershipGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new BillingOwnershipGuard(reflector);
  });

  it('should reject unauthenticated requests', async () => {
    const context = createMockContext(null);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow authenticated users', async () => {
    const context = createMockContext({ id: 'user-1', roles: [] });
    jest.spyOn(reflector, 'get').mockReturnValue(false);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should reject non-admin users for admin-only endpoints', async () => {
    const context = createMockContext({ id: 'user-1', roles: ['student'] });
    jest.spyOn(reflector, 'get').mockReturnValue(true);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow admin users for admin-only endpoints', async () => {
    const context = createMockContext({ id: 'user-1', roles: ['admin'] });
    jest.spyOn(reflector, 'get').mockReturnValue(true);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});

describe('BillingRoleGuard', () => {
  let guard: BillingRoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new BillingRoleGuard(reflector);
  });

  it('should reject unauthenticated requests', async () => {
    const context = createMockContext(null);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow authenticated users', async () => {
    const context = createMockContext({ id: 'user-1' });
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
