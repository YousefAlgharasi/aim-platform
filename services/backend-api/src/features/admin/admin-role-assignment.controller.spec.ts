import { AuthenticatedUser } from '../../auth';
import { AdminRoleAssignmentController } from './admin-role-assignment.controller';
import { AdminRoleAssignmentService } from './admin-role-assignment.service';

describe('AdminRoleAssignmentController', () => {
  it('delegates role assignment using the authenticated actor and route target', async () => {
    const service = {
      assignUserRole: jest.fn().mockResolvedValue({
        userId: 'user-target-001',
        role: {
          id: 'role-admin',
          key: 'admin',
          name: 'Admin',
          description: null,
          isSystem: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        assignedByUserId: 'user-admin-001',
        assignedAt: timestamp,
      }),
    };
    const controller = new AdminRoleAssignmentController(
      service as unknown as AdminRoleAssignmentService,
    );

    const result = await controller.assignUserRole(
      actor,
      'user-target-001',
      { roleKey: 'admin' },
    );

    expect(service.assignUserRole).toHaveBeenCalledWith({
      actorSupabaseAuthUid: 'auth-admin-001',
      targetUserId: 'user-target-001',
      roleKey: 'admin',
    });
    expect(result.userId).toBe('user-target-001');
  });
});

const timestamp = '2026-06-12T00:00:00.000Z';

const actor: AuthenticatedUser = {
  id: 'auth-admin-001',
  email: 'admin@example.com',
  expiresAt: 1_900_000_000,
};
