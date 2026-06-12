import { HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.guard';
import { AuthorizedRole } from './authorized-role';
import { AppError } from '../../common/errors/app-error';
import { REQUIRED_ROLES_KEY } from './authorization.constants';
import { RequireRoles } from './required-roles.decorator';
import { RolesService } from '../../features/roles/roles.service';
import { UsersService } from '../../features/users/users.service';
import { UserRecord, UserStatus } from '../../features/users/users.types';

const handler = jest.fn();
const controller = jest.fn();

describe('RoleGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let usersService: jest.Mocked<Pick<UsersService, 'findBySupabaseUid'>>;
  let rolesService: jest.Mocked<Pick<RolesService, 'getUserRoles'>>;
  let guard: RoleGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    usersService = {
      findBySupabaseUid: jest.fn(),
    };
    rolesService = {
      getUserRoles: jest.fn(),
    };
    guard = new RoleGuard(
      reflector as unknown as Reflector,
      usersService as unknown as UsersService,
      rolesService as unknown as RolesService,
    );
  });

  it('allows routes with no required roles', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(usersService.findBySupabaseUid).not.toHaveBeenCalled();
    expect(rolesService.getUserRoles).not.toHaveBeenCalled();
  });

  it('throws UNAUTHORIZED when authenticated user is missing', async () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN]);

    await expect(guard.canActivate(createContext())).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: HttpStatus.UNAUTHORIZED,
    } satisfies Partial<AppError>);
  });

  it('allows when database-backed user roles include a required role', async () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN]);
    usersService.findBySupabaseUid.mockResolvedValue(createUserRecord());
    rolesService.getUserRoles.mockResolvedValue([
      createRoleRecord({ key: AuthorizedRole.STUDENT }),
      createRoleRecord({ key: AuthorizedRole.ADMIN }),
    ]);

    await expect(
      guard.canActivate(createContext({ user: { id: 'supabase-user-1', expiresAt: 1 } })),
    ).resolves.toBe(true);

    expect(usersService.findBySupabaseUid).toHaveBeenCalledWith('supabase-user-1');
    expect(rolesService.getUserRoles).toHaveBeenCalledWith('internal-user-1');
  });

  it('ignores JWT app metadata roles and denies when database roles do not match', async () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN]);
    usersService.findBySupabaseUid.mockResolvedValue(createUserRecord());
    rolesService.getUserRoles.mockResolvedValue([
      createRoleRecord({ key: AuthorizedRole.STUDENT }),
    ]);

    await expect(
      guard.canActivate(
        createContext({
          user: {
            id: 'supabase-user-1',
            appMetadata: { roles: [AuthorizedRole.ADMIN] },
            expiresAt: 1,
          },
        }),
      ),
    ).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: HttpStatus.FORBIDDEN,
    } satisfies Partial<AppError>);
  });

  it('throws UNAUTHORIZED when internal user is missing or inactive', async () => {
    reflector.getAllAndOverride.mockReturnValue([AuthorizedRole.ADMIN]);
    usersService.findBySupabaseUid.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext({ user: { id: 'supabase-user-1', expiresAt: 1 } })),
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: HttpStatus.UNAUTHORIZED,
    } satisfies Partial<AppError>);

    usersService.findBySupabaseUid.mockResolvedValue(
      createUserRecord({ status: 'disabled' }),
    );

    await expect(
      guard.canActivate(createContext({ user: { id: 'supabase-user-1', expiresAt: 1 } })),
    ).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      statusCode: HttpStatus.UNAUTHORIZED,
    } satisfies Partial<AppError>);
  });
});

describe('RequireRoles', () => {
  it('stores required role metadata for handlers or classes', () => {
    class TestController {
      @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
      handle(): void {}
    }

    expect(Reflect.getMetadata(REQUIRED_ROLES_KEY, TestController.prototype.handle)).toEqual([
      AuthorizedRole.ADMIN,
      AuthorizedRole.SUPER_ADMIN,
    ]);
  });
});

function createContext(options: { user?: { id: string; expiresAt: number; appMetadata?: Record<string, unknown> } } = {}) {
  return {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({
      getRequest: () => ({
        ...(options.user ? { user: options.user } : {}),
      }),
    }),
  } as never;
}

function createUserRecord(overrides: { status?: UserStatus } = {}): UserRecord {
  return {
    id: 'internal-user-1',
    supabaseAuthUid: 'supabase-user-1',
    email: 'user@example.com',
    phone: null,
    userType: 'student',
    status: overrides.status ?? 'active',
    createdAt: '2026-06-12T00:00:00.000Z',
    updatedAt: '2026-06-12T00:00:00.000Z',
  };
}

function createRoleRecord(overrides: { key: string }) {
  return {
    id: `role-${overrides.key}`,
    key: overrides.key,
    name: overrides.key,
    description: null,
    isSystem: true,
    createdAt: '2026-06-12T00:00:00.000Z',
    updatedAt: '2026-06-12T00:00:00.000Z',
  };
}
