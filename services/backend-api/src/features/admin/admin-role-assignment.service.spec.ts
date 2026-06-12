import { HttpStatus } from '@nestjs/common';
import { AuthLoggingService } from '../../auth';
import { RoleRecord, RolesService } from '../roles';
import { UserRecord } from '../users/users.types';
import { UsersService } from '../users/users.service';
import { AdminRoleAssignmentService } from './admin-role-assignment.service';

describe('AdminRoleAssignmentService', () => {
  let db: ReturnType<typeof makeDb>;
  let usersService: jest.Mocked<Pick<UsersService, 'getBySupabaseUid' | 'getById' | 'assertUserIsActive'>>;
  let rolesService: jest.Mocked<Pick<RolesService, 'getRoleByKey' | 'getUserRoles'>>;
  let authLoggingService: jest.Mocked<Pick<AuthLoggingService, 'log'>>;
  let service: AdminRoleAssignmentService;

  beforeEach(() => {
    db = makeDb();
    usersService = {
      getBySupabaseUid: jest.fn().mockResolvedValue(actorUser),
      getById: jest.fn().mockResolvedValue(targetUser),
      assertUserIsActive: jest.fn(),
    };
    rolesService = {
      getRoleByKey: jest.fn().mockResolvedValue({ role: adminRole, permissions: [] }),
      getUserRoles: jest.fn().mockResolvedValue([adminRole]),
    };
    authLoggingService = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    service = new AdminRoleAssignmentService(
      db as never,
      usersService as unknown as UsersService,
      rolesService as unknown as RolesService,
      authLoggingService as unknown as AuthLoggingService,
    );
  });

  it('replaces existing user roles with the requested backend role and audits the change', async () => {
    const result = await service.assignUserRole({
      actorSupabaseAuthUid: 'auth-admin-001',
      targetUserId: 'user-target-001',
      roleKey: 'admin',
      reason: '  Promotion approved by school owner  ',
    });

    expect(usersService.getBySupabaseUid).toHaveBeenCalledWith('auth-admin-001');
    expect(usersService.getById).toHaveBeenCalledWith('user-target-001');
    expect(rolesService.getRoleByKey).toHaveBeenCalledWith('admin');
    expect(result).toEqual({
      userId: 'user-target-001',
      role: adminRole,
      assignedByUserId: 'user-admin-001',
      assignedAt: '2026-06-12T00:00:00.000Z',
    });
    expect(db.client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(db.client.query).toHaveBeenNthCalledWith(
      2,
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id <> $2 RETURNING role_id',
      ['user-target-001', 'role-admin'],
    );
    expect(db.client.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('INSERT INTO user_roles'),
      ['user-target-001', 'role-admin', 'user-admin-001'],
    );
    expect(db.client.query).toHaveBeenNthCalledWith(4, 'COMMIT');
    expect(authLoggingService.log).toHaveBeenCalledWith('role_assigned', {
      userId: 'user-target-001',
      supabaseAuthUid: 'auth-target-001',
      actorUserId: 'user-admin-001',
      metadata: {
        roleId: 'role-admin',
        roleKey: 'admin',
        assignedAt: '2026-06-12T00:00:00.000Z',
        previousRoleIds: ['role-student'],
        reason: 'Promotion approved by school owner',
      },
    });
  });

  it('blocks admins from assigning roles to themselves', async () => {
    usersService.getById.mockResolvedValue(actorUser);

    await expect(
      service.assignUserRole({
        actorSupabaseAuthUid: 'auth-admin-001',
        targetUserId: 'user-admin-001',
        roleKey: 'admin',
      }),
    ).rejects.toMatchObject({
      code: 'RBAC_SELF_GRANT_FORBIDDEN',
      statusCode: HttpStatus.FORBIDDEN,
    });
    expect(db.withClient).not.toHaveBeenCalled();
    expect(authLoggingService.log).not.toHaveBeenCalled();
  });

  it('blocks non-super admins from assigning the super_admin role', async () => {
    rolesService.getRoleByKey.mockResolvedValue({
      role: superAdminRole,
      permissions: [],
    });
    rolesService.getUserRoles.mockResolvedValue([adminRole]);

    await expect(
      service.assignUserRole({
        actorSupabaseAuthUid: 'auth-admin-001',
        targetUserId: 'user-target-001',
        roleKey: 'super_admin',
      }),
    ).rejects.toMatchObject({
      code: 'RBAC_SYSTEM_ROLE_PROTECTED',
      statusCode: HttpStatus.FORBIDDEN,
    });
    expect(db.withClient).not.toHaveBeenCalled();
    expect(authLoggingService.log).not.toHaveBeenCalled();
  });

  it('allows super admins to assign the super_admin role', async () => {
    rolesService.getRoleByKey.mockResolvedValue({
      role: superAdminRole,
      permissions: [],
    });
    rolesService.getUserRoles.mockResolvedValue([superAdminRole]);

    const result = await service.assignUserRole({
      actorSupabaseAuthUid: 'auth-admin-001',
      targetUserId: 'user-target-001',
      roleKey: 'super_admin',
    });

    expect(result.role.key).toBe('super_admin');
    expect(db.withClient).toHaveBeenCalledTimes(1);
    expect(authLoggingService.log).toHaveBeenCalledWith(
      'role_assigned',
      expect.objectContaining({
        userId: 'user-target-001',
        actorUserId: 'user-admin-001',
        metadata: expect.objectContaining({
          roleId: 'role-super-admin',
          roleKey: 'super_admin',
        }),
      }),
    );
  });

  it('omits blank role change reasons from audit metadata', async () => {
    await service.assignUserRole({
      actorSupabaseAuthUid: 'auth-admin-001',
      targetUserId: 'user-target-001',
      roleKey: 'admin',
      reason: '   ',
    });

    expect(authLoggingService.log).toHaveBeenCalledWith(
      'role_assigned',
      expect.objectContaining({
        metadata: expect.not.objectContaining({
          reason: expect.any(String),
        }),
      }),
    );
  });
});

const timestamp = '2026-06-12T00:00:00.000Z';

const actorUser: UserRecord = {
  id: 'user-admin-001',
  supabaseAuthUid: 'auth-admin-001',
  email: 'admin@example.com',
  phone: null,
  userType: 'admin',
  status: 'active',
  createdAt: timestamp,
  updatedAt: timestamp,
};

const targetUser: UserRecord = {
  id: 'user-target-001',
  supabaseAuthUid: 'auth-target-001',
  email: 'target@example.com',
  phone: null,
  userType: 'student',
  status: 'active',
  createdAt: timestamp,
  updatedAt: timestamp,
};

const adminRole: RoleRecord = {
  id: 'role-admin',
  key: 'admin',
  name: 'Admin',
  description: null,
  isSystem: true,
  createdAt: timestamp,
  updatedAt: timestamp,
};

const superAdminRole: RoleRecord = {
  ...adminRole,
  id: 'role-super-admin',
  key: 'super_admin',
  name: 'Super Admin',
};

function makeDb() {
  const client = {
    query: jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('INSERT INTO user_roles')) {
        return Promise.resolve({ rows: [{ assigned_at: timestamp }] });
      }

      if (sql.includes('DELETE FROM user_roles')) {
        return Promise.resolve({ rows: [{ role_id: 'role-student' }] });
      }

      return Promise.resolve({ rows: [] });
    }),
  };

  return {
    client,
    withClient: jest.fn(async (callback: (dbClient: typeof client) => Promise<unknown>) =>
      callback(client),
    ),
  };
}
