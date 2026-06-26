// Phase 2 — P2-059 / P2-061
// P11-013: Extended with search/filter and status update.
//
// Admin users service.
//
// Security rules:
// - Only admins and super-admins may call these methods (enforced by RoleGuard at controller).
// - supabase_auth_uid is never returned to the client.
// - Backend is the final authority for identity, roles, permissions, and ownership.
// - User status change is the only mutation exposed — roles are managed via AdminRoleAssignmentController.

import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { DatabaseService } from '../../../database/database.service';
import { UserRow, UserStatus, UserType } from '../../users/users.types';
import {
  AdminAdminProfileDto,
  AdminStudentProfileDto,
  AdminUserDetailDto,
} from './admin-user-detail.dto';
import { SafeUserDto } from './safe-user.dto';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

interface StudentProfileRow {
  id: string;
  display_name: string | null;
  native_language: string | null;
  target_language: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminProfileRow {
  id: string;
  display_name: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
}

interface RoleKeyRow {
  key: string;
}

interface CountRow {
  count: string;
}

interface ProgressRow {
  completed_lessons: string;
  last_active_at: string | null;
}

export type AdminUsersListOptions = {
  page?: number;
  limit?: number;
  status?: UserStatus;
  userType?: UserType;
  email?: string;
};

export type AdminUsersListResult = {
  data: SafeUserDto[];
  total: number;
  page: number;
  limit: number;
};

@Injectable()
export class AdminUsersService {
  constructor(private readonly db: DatabaseService) {}

  async listUsers(options: AdminUsersListOptions = {}): Promise<AdminUsersListResult> {
    const page  = Math.max(options.page  ?? 1, 1);
    const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (options.status) {
      conditions.push(`status = $${paramIdx++}`);
      params.push(options.status);
    }
    if (options.userType) {
      conditions.push(`user_type = $${paramIdx++}`);
      params.push(options.userType);
    }
    if (options.email) {
      conditions.push(`email ILIKE $${paramIdx++}`);
      params.push(`%${options.email}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [dataResult, countResult, totalLessonsResult] = await Promise.all([
      this.db.query<UserRow>(
        `SELECT id, supabase_auth_uid, email, phone, user_type, status, created_at, updated_at
         FROM users
         ${where}
         ORDER BY created_at DESC
         LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, limit, offset],
      ),
      this.db.query<CountRow>(
        `SELECT COUNT(*) AS count FROM users ${where}`,
        params,
      ),
      this.db.query<CountRow>(
        `SELECT COUNT(*) AS count FROM lessons WHERE status = 'published'`,
      ),
    ]);

    const totalLessons = parseInt(totalLessonsResult.rows[0]?.count ?? '0', 10);
    const studentUids = dataResult.rows
      .filter((row) => row.user_type === 'student')
      .map((row) => row.supabase_auth_uid);

    const progressByUid = await this.fetchProgressByUid(studentUids);

    return {
      data: dataResult.rows.map((row) =>
        this.toSafeDto(row, totalLessons, progressByUid.get(row.supabase_auth_uid)),
      ),
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
      page,
      limit,
    };
  }

  private async fetchProgressByUid(
    studentUids: readonly string[],
  ): Promise<Map<string, ProgressRow>> {
    if (studentUids.length === 0) {
      return new Map();
    }

    const result = await this.db.query<ProgressRow & { student_id: string }>(
      `SELECT student_id,
              COUNT(*) FILTER (WHERE completed) AS completed_lessons,
              MAX(last_active_at) AS last_active_at
         FROM lesson_progress
        WHERE student_id = ANY($1::uuid[])
        GROUP BY student_id`,
      [studentUids],
    );

    return new Map(result.rows.map((row) => [row.student_id, row]));
  }

  async getUserDetail(userId: string): Promise<AdminUserDetailDto> {
    if (!userId || userId.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'User ID is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const userResult = await this.db.query<UserRow>(
      `SELECT id, email, phone, user_type, status, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const user = userResult.rows[0];

    const [rolesResult, studentResult, adminResult] = await Promise.all([
      this.db.query<RoleKeyRow>(
        `SELECT r.key
         FROM roles r
         INNER JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = $1
         ORDER BY r.key ASC`,
        [userId],
      ),
      this.db.query<StudentProfileRow>(
        `SELECT id, display_name, native_language, target_language, created_at, updated_at
         FROM student_profiles
         WHERE user_id = $1
         LIMIT 1`,
        [userId],
      ),
      this.db.query<AdminProfileRow>(
        `SELECT id, display_name, department, created_at, updated_at
         FROM admin_profiles
         WHERE user_id = $1
         LIMIT 1`,
        [userId],
      ),
    ]);

    const dto = new AdminUserDetailDto();
    dto.id        = user.id;
    dto.email     = user.email;
    dto.phone     = user.phone;
    dto.userType  = user.user_type;
    dto.status    = user.status;
    dto.createdAt = user.created_at;
    dto.updatedAt = user.updated_at;
    dto.roles     = rolesResult.rows.map((r) => r.key);

    if (studentResult.rows.length > 0) {
      const sp = studentResult.rows[0];
      const spDto = new AdminStudentProfileDto();
      spDto.id             = sp.id;
      spDto.displayName    = sp.display_name;
      spDto.nativeLanguage = sp.native_language;
      spDto.targetLanguage = sp.target_language;
      spDto.createdAt      = sp.created_at;
      spDto.updatedAt      = sp.updated_at;
      dto.studentProfile   = spDto;
    } else {
      dto.studentProfile = null;
    }

    if (adminResult.rows.length > 0) {
      const ap = adminResult.rows[0];
      const apDto = new AdminAdminProfileDto();
      apDto.id          = ap.id;
      apDto.displayName = ap.display_name;
      apDto.department  = ap.department;
      apDto.createdAt   = ap.created_at;
      apDto.updatedAt   = ap.updated_at;
      dto.adminProfile  = apDto;
    } else {
      dto.adminProfile = null;
    }

    return dto;
  }

  /**
   * P11-013: Update user status.
   * Only 'active' and 'disabled' are permitted from the admin UI.
   * The DTO enforces this constraint via class-validator before this method is called.
   * Backend resolves userId from the route param only — never from client body.
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<SafeUserDto> {
    if (!userId || userId.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'User ID is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const result = await this.db.query<UserRow>(
      `UPDATE users
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, phone, user_type, status, created_at, updated_at`,
      [status, userId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.toSafeDto(result.rows[0]);
  }

  private toSafeDto(
    row: UserRow,
    totalLessons: number | null = null,
    progress?: ProgressRow,
  ): SafeUserDto {
    const dto = new SafeUserDto();
    dto.id        = row.id;
    dto.email     = row.email;
    dto.phone     = row.phone;
    dto.userType  = row.user_type;
    dto.status    = row.status;
    dto.createdAt = row.created_at;
    dto.updatedAt = row.updated_at;

    if (row.user_type === 'student' && totalLessons !== null) {
      const completedLessons = parseInt(progress?.completed_lessons ?? '0', 10);
      dto.completedLessons = completedLessons;
      dto.totalLessons     = totalLessons;
      dto.completionPct    =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      dto.lastActiveAt     = progress?.last_active_at ?? null;
    } else {
      dto.completedLessons = null;
      dto.totalLessons     = null;
      dto.completionPct    = null;
      dto.lastActiveAt     = null;
    }

    return dto;
  }
}
