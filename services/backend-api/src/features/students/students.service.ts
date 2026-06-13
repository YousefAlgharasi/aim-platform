// Phase 2 — P2-030 (scaffold) + P2-032 (implementation)
// Students profile service.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Centralise all student_profiles table access.
//   Enforces that user_id is always the internal AIM user ID — never client-supplied.
//
// Security rules:
//   - user_id is always sourced from a verified JWT via UsersService, never from a client payload.
//   - profile_type is a fixed discriminator — it does not grant roles or permissions.
//   - Backend is the final authority for identity, roles, permissions, and ownership.
//   - No onboarding, placement, lessons, sessions, AIM, AI Teacher, or Student Web App logic here.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  StudentProfileRecord,
  StudentProfileRow,
  UpdateStudentProfileInput,
} from '../profile/profile.types';

@Injectable()
export class StudentsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Find a student profile by the internal AIM user ID.
   * Returns null when no profile row exists.
   */
  async findByUserId(internalUserId: string): Promise<StudentProfileRecord | null> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<StudentProfileRow>(
      `SELECT id, user_id, profile_type, display_name, avatar_url,
              preferred_language, timezone, created_at, updated_at
       FROM student_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [internalUserId],
    );

    return result.rows.length > 0 ? this.toRecord(result.rows[0]) : null;
  }

  /**
   * Get a student profile by internal AIM user ID — throws NOT_FOUND when absent.
   */
  async getByUserId(internalUserId: string): Promise<StudentProfileRecord> {
    const profile = await this.findByUserId(internalUserId);

    if (!profile) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Student profile not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return profile;
  }

  /**
   * Update safe, mutable fields on an existing student profile.
   * Only display_name, avatar_url, preferred_language, and timezone may be changed.
   * user_id and profile_type are immutable through this method.
   */
  async updateByUserId(
    internalUserId: string,
    input: UpdateStudentProfileInput,
  ): Promise<StudentProfileRecord> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<StudentProfileRow>(
      `UPDATE student_profiles
       SET
         display_name       = COALESCE($2, display_name),
         avatar_url         = COALESCE($3, avatar_url),
         preferred_language = COALESCE($4, preferred_language),
         timezone           = COALESCE($5, timezone),
         updated_at         = now()
       WHERE user_id = $1
       RETURNING id, user_id, profile_type, display_name, avatar_url,
                 preferred_language, timezone, created_at, updated_at`,
      [
        internalUserId,
        input.displayName ?? null,
        input.avatarUrl ?? null,
        input.preferredLanguage ?? null,
        input.timezone ?? null,
      ],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Student profile not found',
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

  private toRecord(row: StudentProfileRow): StudentProfileRecord {
    return {
      id: row.id,
      userId: row.user_id,
      profileType: row.profile_type,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      preferredLanguage: row.preferred_language,
      timezone: row.timezone,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
