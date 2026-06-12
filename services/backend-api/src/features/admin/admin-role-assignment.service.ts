import { HttpStatus, Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { AuthLoggingService } from '../../auth';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AppError } from '../../common/errors/app-error';
import { DatabaseService } from '../../database/database.service';
import { RolesService } from '../roles';
import { UsersService } from '../users';
import {
  AdminRoleAssignmentResponse,
  AssignAdminUserRoleInput,
} from './admin-role-assignment.types';

interface AssignmentRow {
  readonly assigned_at: string | Date;
}

interface RoleAssignmentWriteResult {
  readonly assignedAt: string;
  readonly previousRoleIds: readonly string[];
}

@Injectable()
export class AdminRoleAssignmentService {
  constructor(
    private readonly db: DatabaseService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly authLoggingService: AuthLoggingService,
  ) {}

  async assignUserRole(
    input: AssignAdminUserRoleInput,
  ): Promise<AdminRoleAssignmentResponse> {
    this.assertRoleKey(input.roleKey);

    const actor = await this.usersService.getBySupabaseUid(input.actorSupabaseAuthUid);
    this.usersService.assertUserIsActive(actor);

    const targetUser = await this.usersService.getById(input.targetUserId);
    this.usersService.assertUserIsActive(targetUser);

    if (actor.id === targetUser.id) {
      throw new AppError({
        code: 'RBAC_SELF_GRANT_FORBIDDEN',
        message: 'Admins cannot assign roles to themselves',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const { role } = await this.rolesService.getRoleByKey(input.roleKey);
    await this.assertActorMayAssignRole(actor.id, role.key);

    const assignment = await this.replaceUserRole({
      targetUserId: targetUser.id,
      roleId: role.id,
      actorUserId: actor.id,
    });
    const reason = this.normalizeReason(input.reason);

    await this.authLoggingService.log('role_assigned', {
      userId: targetUser.id,
      supabaseAuthUid: targetUser.supabaseAuthUid,
      actorUserId: actor.id,
      metadata: {
        roleId: role.id,
        roleKey: role.key,
        assignedAt: assignment.assignedAt,
        previousRoleIds: assignment.previousRoleIds,
        ...(reason ? { reason } : {}),
      },
    });

    return {
      userId: targetUser.id,
      role,
      assignedByUserId: actor.id,
      assignedAt: assignment.assignedAt,
    };
  }

  private async assertActorMayAssignRole(
    actorUserId: string,
    roleKey: string,
  ): Promise<void> {
    if (roleKey !== 'super_admin') {
      return;
    }

    const actorRoles = await this.rolesService.getUserRoles(actorUserId);
    const actorIsSuperAdmin = actorRoles.some((role) => role.key === 'super_admin');

    if (!actorIsSuperAdmin) {
      throw new AppError({
        code: 'RBAC_SYSTEM_ROLE_PROTECTED',
        message: 'Only super admins can assign the super_admin role',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
  }

  private async replaceUserRole({
    targetUserId,
    roleId,
    actorUserId,
  }: Readonly<{
    targetUserId: string;
    roleId: string;
    actorUserId: string;
  }>): Promise<RoleAssignmentWriteResult> {
    return this.db.withClient(async (client) => {
      await client.query('BEGIN');

      try {
        const removedRoles = await client.query<{ role_id: string }>(
          'DELETE FROM user_roles WHERE user_id = $1 AND role_id <> $2 RETURNING role_id',
          [targetUserId, roleId],
        );

        const result = await client.query<AssignmentRow>(
          `INSERT INTO user_roles (user_id, role_id, assigned_by)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, role_id)
           DO UPDATE SET
             assigned_by = EXCLUDED.assigned_by,
             assigned_at = now()
           RETURNING assigned_at`,
          [targetUserId, roleId, actorUserId],
        );

        await client.query('COMMIT');

        const assignedAt = result.rows[0]?.assigned_at;

        if (!assignedAt) {
          throw new AppError({
            code: ApiErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Failed to assign user role',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          });
        }

        return {
          assignedAt: assignedAt instanceof Date ? assignedAt.toISOString() : assignedAt,
          previousRoleIds: removedRoles.rows.map((row) => row.role_id),
        };
      } catch (error) {
        await this.rollback(client);
        throw error;
      }
    });
  }

  private async rollback(client: PoolClient): Promise<void> {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original assignment error.
    }
  }

  private assertRoleKey(roleKey: string): void {
    if (!roleKey || roleKey.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'Role key is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private normalizeReason(reason: string | undefined): string | undefined {
    const normalized = reason?.trim();
    return normalized ? normalized : undefined;
  }
}
