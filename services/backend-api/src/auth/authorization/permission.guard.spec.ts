import { ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../features/roles';
import { UsersService } from '../../features/users';
import { UserRecord, UserStatus } from '../../features/users/users.types';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AuthenticatedRequest, AuthenticatedUser } from '../authenticated-user';
import { REQUIRED_PERMISSIONS_KEY } from './authorization.constants';
import { PermissionGuard } from './permission.guard';
import { RequirePermissions } from './required-permissions.decorator';

describe('PermissionGuard', () => {
  const user: AuthenticatedUser = {
    id: 'user-001',
    email: 'student@example.com',
    expiresAt: 1_900_000_000,
  };

  let reflector: jest.Mocked<Reflector>;
  let rolesService: jest.Mocked<Pick<RolesService, 'hasPermission'>>;
  let usersService: jest.Mocked<Pick<UsersService, 'findBySupabaseUid'>>;
  let guard: PermissionGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    rolesService = {
      hasPermission: jest.fn(),
    };
    usersService = {
      findBySupabaseUid: jest.fn().mockResolvedValue(createUserRecord()),
    };
    guard = new PermissionGuard(
      reflector,
      rolesService as unknown as RolesService,
      usersService as unknown as UsersService,
    );
  });

  it('allows requests when no permission metadata is declared', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(guard.canActivate(createHttpContext({ user }))).resolves.toBe(true);

    expect(rolesService.hasPermission).not.toHaveBeenCalled();
  });

  it('checks each unique required permission against the internal active user', async () => {
    reflector.getAllAndOverride.mockReturnValue([
      'profiles.read.own',
      'profiles.read.own',
      'users.read',
    ]);
    rolesService.hasPermission.mockResolvedValue(true);

    await expect(guard.canActivate(createHttpContext({ user }))).resolves.toBe(true);

    expect(usersService.findBySupabaseUid).toHaveBeenCalledWith('user-001');
    expect(rolesService.hasPermission).toHaveBeenCalledTimes(2);
    expect(rolesService.hasPermission).toHaveBeenCalledWith('internal-user-001', 'profiles.read.own');
    expect(rolesService.hasPermission).toHaveBeenCalledWith('internal-user-001', 'users.read');
  });

  it('rejects requests without an authenticated user', async () => {
    reflector.getAllAndOverride.mockReturnValue(['users.read']);

    await expect(guard.canActivate(createHttpContext({}))).rejects.toMatchObject({
      code: ApiErrorCode.UNAUTHORIZED,
      statusCode: HttpStatus.UNAUTHORIZED,
    });

    expect(rolesService.hasPermission).not.toHaveBeenCalled();
  });

  it('rejects requests when the internal user is missing or inactive', async () => {
    reflector.getAllAndOverride.mockReturnValue(['users.read']);
    usersService.findBySupabaseUid.mockResolvedValueOnce(null);

    await expect(guard.canActivate(createHttpContext({ user }))).rejects.toMatchObject({
      code: ApiErrorCode.UNAUTHORIZED,
      statusCode: HttpStatus.UNAUTHORIZED,
    });

    usersService.findBySupabaseUid.mockResolvedValueOnce(
      createUserRecord({ status: 'disabled' }),
    );

    await expect(guard.canActivate(createHttpContext({ user }))).rejects.toMatchObject({
      code: ApiErrorCode.UNAUTHORIZED,
      statusCode: HttpStatus.UNAUTHORIZED,
    });

    expect(rolesService.hasPermission).not.toHaveBeenCalled();
  });

  it('rejects requests missing any required permission', async () => {
    reflector.getAllAndOverride.mockReturnValue(['users.read', 'roles.assign']);
    rolesService.hasPermission
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(guard.canActivate(createHttpContext({ user }))).rejects.toMatchObject({
      code: ApiErrorCode.FORBIDDEN,
      statusCode: HttpStatus.FORBIDDEN,
    });
  });
});

describe('RequirePermissions', () => {
  it('stores required permission metadata for handlers or classes', () => {
    class TestController {
      @RequirePermissions('users.read', 'roles.assign')
      handle(): void {}
    }

    expect(
      Reflect.getMetadata(REQUIRED_PERMISSIONS_KEY, TestController.prototype.handle),
    ).toEqual(['users.read', 'roles.assign']);
  });
});

function createHttpContext(request: AuthenticatedRequest): ExecutionContext {
  return {
    getHandler: () => createHttpContext,
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function createUserRecord(overrides: { status?: UserStatus } = {}): UserRecord {
  return {
    id: 'internal-user-001',
    supabaseAuthUid: 'user-001',
    email: 'student@example.com',
    phone: null,
    userType: 'student',
    status: overrides.status ?? 'active',
    createdAt: '2026-06-12T00:00:00.000Z',
    updatedAt: '2026-06-12T00:00:00.000Z',
  };
}
