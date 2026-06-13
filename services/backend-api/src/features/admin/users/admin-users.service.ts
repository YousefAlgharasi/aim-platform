// Phase 2 — P2-059 / P2-061
// Admin users service.
//
// Scope: Auth, Users, Roles only.
//
// Security rules:
// - Only admins and super-admins may call these methods (enforced by RoleGuard at controller).
// - supabase_auth_uid is never returned to the client.
// - Backend is the final authority for identity, roles, permissions, and ownership.

import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { DatabaseService } from '../../../database/database.service';
import { UserRow } from '../../users/users.types';
import {
  AdminAdminProfileDto,
  AdminStudentProfileDto,
  AdminUserDetailDto,
} from './admin-user-detail.dto';
import { SafeUserDto } from './safe-user.dto';

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

@Injectable()
export class AdminUsersService {
  constructor(private readonly db: DatabaseService) {}

  async listUsers(): Promise<SafeUserDto[]> {
    const result = await this.db.query<UserRow>(
      `SELECT id, email, phone, user_type, status, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`,
      [],
    );

    return result.rows.map((row) => this.toSafeDto(row));
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
    dto.id = user.id;
    dto.email = user.email;
    dto.phone = user.phone;
    dto.userType = user.user_type;
    dto.status = user.status;
    dto.createdAt = user.created_at;
    dto.updatedAt = user.updated_at;
    dto.roles = rolesResult.rows.map((r) => r.key);

    if (studentResult.rows.length > 0) {
      const sp = studentResult.rows[0];
      const spDto = new AdminStudentProfileDto();
      spDto.id = sp.id;
      spDto.displayName = sp.display_name;
      spDto.nativeLanguage = sp.native_language;
      spDto.targetLanguage = sp.target_language;
      spDto.createdAt = sp.created_at;
      spDto.updatedAt = sp.updated_at;
      dto.studentProfile = spDto;
    } else {
      dto.studentProfile = null;
    }

    if (adminResult.rows.length > 0) {
      const ap = adminResult.rows[0];
      const apDto = new AdminAdminProfileDto();
      apDto.id = ap.id;
      apDto.displayName = ap.display_name;
      apDto.department = ap.department;
      apDto.createdAt = ap.created_at;
      apDto.updatedAt = ap.updated_at;
      dto.adminProfile = apDto;
    } else {
      dto.adminProfile = null;
    }

    return dto;
  }

  private toSafeDto(row: UserRow): SafeUserDto {
    const dto = new SafeUserDto();
    dto.id = row.id;
    dto.email = row.email;
    dto.phone = row.phone;
    dto.userType = row.user_type;
    dto.status = row.status;
    dto.createdAt = row.created_at;
    dto.updatedAt = row.updated_at;
    return dto;
  }
}
