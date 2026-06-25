import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  OperationsOwnershipGuard,
  OperationsAdminGuard,
  OPERATIONS_RESOURCE_KEY,
  OPERATIONS_ADMIN_KEY,
} from '../operations.guards';

function createMockContext(user: Record<string, unknown> | null, handlerMetadata?: Record<string, unknown>): ExecutionContext {
  const handler = () => {};
  if (handlerMetadata) {
    if (handlerMetadata[OPERATIONS_RESOURCE_KEY] !== undefined) {
      Reflect.defineMetadata(OPERATIONS_RESOURCE_KEY, handlerMetadata[OPERATIONS_RESOURCE_KEY], handler);
    }
    if (handlerMetadata[OPERATIONS_ADMIN_KEY] !== undefined) {
      Reflect.defineMetadata(OPERATIONS_ADMIN_KEY, handlerMetadata[OPERATIONS_ADMIN_KEY], handler);
    }
  }

  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
    getHandler: () => handler,
    getClass: () => ({}),
    getArgs: () => [],
    getArgByIndex: () => ({}),
    switchToRpc: () => ({} as any),
    switchToWs: () => ({} as any),
    getType: () => 'http',
  } as unknown as ExecutionContext;
}

describe('OperationsOwnershipGuard', () => {
  let guard: OperationsOwnershipGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new OperationsOwnershipGuard(reflector);
  });

  it('should throw UnauthorizedException if no user is present', async () => {
    const context = createMockContext(null, {
      [OPERATIONS_RESOURCE_KEY]: 'support_ticket',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow access when no resource metadata is set', async () => {
    const context = createMockContext({ id: 'user-1', expiresAt: Date.now() + 3600 });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access for valid resource types', async () => {
    const validResources = ['support_ticket', 'feedback', 'feature_request'];

    for (const resource of validResources) {
      const context = createMockContext(
        { id: 'user-1', expiresAt: Date.now() + 3600 },
        { [OPERATIONS_RESOURCE_KEY]: resource },
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    }
  });

  it('should throw ForbiddenException for unknown resource types', async () => {
    const context = createMockContext(
      { id: 'user-1', expiresAt: Date.now() + 3600 },
      { [OPERATIONS_RESOURCE_KEY]: 'unknown_resource' },
    );

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow('Unknown operations resource: unknown_resource');
  });
});

describe('OperationsAdminGuard', () => {
  let guard: OperationsAdminGuard;
  let reflector: Reflector;
  let mockUsersService: { findBySupabaseUid: jest.Mock };
  let mockRolesService: { getUserRoles: jest.Mock };

  beforeEach(() => {
    reflector = new Reflector();
    mockUsersService = { findBySupabaseUid: jest.fn() };
    mockRolesService = { getUserRoles: jest.fn() };
    guard = new OperationsAdminGuard(reflector, mockUsersService as any, mockRolesService as any);
  });

  it('should throw UnauthorizedException if no user is present', async () => {
    const context = createMockContext(null, {
      [OPERATIONS_ADMIN_KEY]: true,
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow access when admin-only is not set', async () => {
    const context = createMockContext({ id: 'user-1', expiresAt: Date.now() + 3600 });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access for users with admin role', async () => {
    mockUsersService.findBySupabaseUid.mockResolvedValue({ id: 1 });
    mockRolesService.getUserRoles.mockResolvedValue([{ key: 'admin' }]);
    const context = createMockContext(
      { id: 'admin-1', expiresAt: Date.now() + 3600 },
      { [OPERATIONS_ADMIN_KEY]: true },
    );

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow access for users with super_admin role', async () => {
    mockUsersService.findBySupabaseUid.mockResolvedValue({ id: 1 });
    mockRolesService.getUserRoles.mockResolvedValue([{ key: 'super_admin' }]);
    const context = createMockContext(
      { id: 'admin-1', expiresAt: Date.now() + 3600 },
      { [OPERATIONS_ADMIN_KEY]: true },
    );

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException for non-admin users on admin-only endpoints', async () => {
    mockUsersService.findBySupabaseUid.mockResolvedValue({ id: 1 });
    mockRolesService.getUserRoles.mockResolvedValue([{ key: 'student' }]);
    const context = createMockContext(
      { id: 'user-1', expiresAt: Date.now() + 3600 },
      { [OPERATIONS_ADMIN_KEY]: true },
    );

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    await expect(guard.canActivate(context)).rejects.toThrow('Admin access required for operations management');
  });

  it('should throw ForbiddenException for users not found in database', async () => {
    mockUsersService.findBySupabaseUid.mockResolvedValue(null);
    const context = createMockContext(
      { id: 'user-1', expiresAt: Date.now() + 3600 },
      { [OPERATIONS_ADMIN_KEY]: true },
    );

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
