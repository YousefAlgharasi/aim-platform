// Phase 2 — P2-059 (user list) + P2-031/P2-032 (admin profile CRUD)
// Admin service.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Centralise admin-only operations:
//   - listUsers: paginated safe user list (P2-059)
//   - findByUserId / getByUserId / updateByUserId: admin profile CRUD (P2-031/P2-032)
//
// Security rules:
//   - supabase_auth_uid is never returned to admin clients.
//   - user_id for profile operations is always sourced from the verified JWT, never client input.
//   - Admin profile existence does NOT grant admin authority — role guards remain final authority.
//   - Callers must apply RoleGuard (admin/super_admin) before invoking this service.
//   - Backend is the final authority for authorization.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { UsersService } from '../users/users.service';
import { UserRecord } from '../users/users.types';
import {
  AdminProfileRecord,
  AdminProfileRow,
  UpdateAdminProfileInput,
} from '../profile/profile.types';
import { AdminUserListItem, AdminUserListResponse } from './admin.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class AdminService {
  constructor(
    private readonly db: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

  // ---------------------------------------------------------------------------
  // User list (P2-059)
  // ---------------------------------------------------------------------------

  async listUsers(page: number, limit: number): Promise<AdminUserListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    const { users, total } = await this.usersService.listAll(offset, safeLimit);

    return {
      users: users.map(toAdminUserListItem),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  // ---------------------------------------------------------------------------
  // Admin profile CRUD (P2-031 / P2-032)
  // ---------------------------------------------------------------------------

  async findByUserId(internalUserId: string): Promise<AdminProfileRecord | null> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<AdminProfileRow>(
      `SELECT id, user_id, profile_type, display_name, avatar_url,
              department, created_at, updated_at
       FROM admin_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [internalUserId],
    );

    return result.rows.length > 0 ? this.toRecord(result.rows[0]) : null;
  }

  async getByUserId(internalUserId: string): Promise<AdminProfileRecord> {
    const profile = await this.findByUserId(internalUserId);

    if (!profile) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Admin profile not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return profile;
  }

  async updateByUserId(
    internalUserId: string,
    input: UpdateAdminProfileInput,
  ): Promise<AdminProfileRecord> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<AdminProfileRow>(
      `UPDATE admin_profiles
       SET
         display_name = COALESCE($2, display_name),
         avatar_url   = COALESCE($3, avatar_url),
         department   = COALESCE($4, department),
         updated_at   = now()
       WHERE user_id = $1
       RETURNING id, user_id, profile_type, display_name, avatar_url,
                 department, created_at, updated_at`,
      [
        internalUserId,
        input.displayName ?? null,
        input.avatarUrl ?? null,
        input.department ?? null,
      ],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Admin profile not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.toRecord(result.rows[0]);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private assertUserId(internalUserId: string): void {
    if (!internalUserId || internalUserId.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'Internal user ID is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private toRecord(row: AdminProfileRow): AdminProfileRecord {
    return {
      id: row.id,
      userId: row.user_id,
      profileType: row.profile_type,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      department: row.department,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

function toAdminUserListItem(user: UserRecord): AdminUserListItem {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
