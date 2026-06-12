import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  PermissionRecord,
  PermissionRow,
  RoleRecord,
  RoleRow,
  RoleWithPermissions,
} from './roles.types';

@Injectable()
export class RolesService {
  constructor(private readonly db: DatabaseService) {}

  async getRoles(): Promise<RoleRecord[]> {
    const result = await this.db.query<RoleRow>(
      `SELECT id, key, name, description, is_system, created_at, updated_at
       FROM roles
       ORDER BY key ASC`,
    );

    return result.rows.map(this.toRoleRecord);
  }

  async getRoleByKey(key: string): Promise<RoleWithPermissions> {
    const roleResult = await this.db.query<RoleRow>(
      `SELECT id, key, name, description, is_system, created_at, updated_at
       FROM roles
       WHERE key = $1
       LIMIT 1`,
      [key],
    );

    if (roleResult.rowCount === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Role not found: ${key}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const role = this.toRoleRecord(roleResult.rows[0]);
    const permissions = await this.getPermissionsForRole(roleResult.rows[0].id);

    return { role, permissions };
  }

  async getUserRoles(internalUserId: string): Promise<RoleRecord[]> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<RoleRow>(
      `SELECT r.id, r.key, r.name, r.description, r.is_system, r.created_at, r.updated_at
       FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1
       ORDER BY r.key ASC`,
      [internalUserId],
    );

    return result.rows.map(this.toRoleRecord);
  }

  async getUserPermissions(internalUserId: string): Promise<PermissionRecord[]> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<PermissionRow>(
      `SELECT DISTINCT p.id, p.key, p.scope, p.description, p.created_at, p.updated_at
       FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       INNER JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = $1
       ORDER BY p.key ASC`,
      [internalUserId],
    );

    return result.rows.map(this.toPermissionRecord);
  }

  async getUserPermissionKeys(internalUserId: string): Promise<string[]> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<{ key: string }>(
      `SELECT DISTINCT p.key
       FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       INNER JOIN user_roles ur ON ur.role_id = rp.role_id
       WHERE ur.user_id = $1`,
      [internalUserId],
    );

    return result.rows.map((r) => r.key);
  }

  async hasPermission(internalUserId: string, permissionKey: string): Promise<boolean> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.id
         INNER JOIN user_roles ur ON ur.role_id = rp.role_id
         WHERE ur.user_id = $1
           AND p.key = $2
       ) AS exists`,
      [internalUserId, permissionKey],
    );

    return result.rows[0]?.exists ?? false;
  }

  private async getPermissionsForRole(roleId: string): Promise<PermissionRecord[]> {
    const result = await this.db.query<PermissionRow>(
      `SELECT p.id, p.key, p.scope, p.description, p.created_at, p.updated_at
       FROM permissions p
       INNER JOIN role_permissions rp ON rp.permission_id = p.id
       WHERE rp.role_id = $1
       ORDER BY p.key ASC`,
      [roleId],
    );

    return result.rows.map(this.toPermissionRecord);
  }

  private assertUserId(internalUserId: string): void {
    if (!internalUserId || internalUserId.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'Internal user ID is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private toRoleRecord(row: RoleRow): RoleRecord {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      description: row.description,
      isSystem: row.is_system,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private toPermissionRecord(row: PermissionRow): PermissionRecord {
    return {
      id: row.id,
      key: row.key,
      scope: row.scope,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
