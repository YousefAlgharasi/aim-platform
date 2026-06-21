// Phase 2 — P2-030
// Student profile service.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Centralise all student profile access so no other module duplicates
//   profile query logic or bypasses ownership checks.
//
// Security rules:
//   - user_id is always sourced from the verified internal user record, never from client input.
//   - Backend is the final authority for identity, ownership, and access.
//   - No onboarding, placement, lessons, sessions, progress, AIM, recommendations,
//     AI Teacher, or Student Web App logic is implemented here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  CreateStudentProfileInput,
  StudentProfileRecord,
  StudentProfileRow,
  UpdateStudentProfileInput,
} from './student-profile.types';

@Injectable()
export class StudentProfileService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Find a student profile by its internal UUID primary key.
   * Returns null when no record exists.
   */
  async findById(profileId: string): Promise<StudentProfileRecord | null> {
    this.assertProfileId(profileId);

    const result = await this.db.query<StudentProfileRow>(
      `SELECT id, user_id, profile_type, display_name, avatar_url,
              preferred_language, timezone, created_at, updated_at
       FROM student_profiles
       WHERE id = $1
       LIMIT 1`,
      [profileId],
    );

    return result.rows.length > 0
      ? this.toProfileRecord(result.rows[0])
      : null;
  }

  /**
   * Find a student profile by its owner's internal user ID.
   * user_id must always be resolved by the backend from the verified JWT.
   * Returns null when no record exists.
   */
  async findByUserId(userId: string): Promise<StudentProfileRecord | null> {
    this.assertUserId(userId);

    const result = await this.db.query<StudentProfileRow>(
      `SELECT id, user_id, profile_type, display_name, avatar_url,
              preferred_language, timezone, created_at, updated_at
       FROM student_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [userId],
    );

    return result.rows.length > 0
      ? this.toProfileRecord(result.rows[0])
      : null;
  }

  /**
   * Get a student profile by internal UUID — throws NOT_FOUND when absent.
   */
  async getById(profileId: string): Promise<StudentProfileRecord> {
    const profile = await this.findById(profileId);

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
   * Get a student profile by owner user ID — throws NOT_FOUND when absent.
   */
  async getByUserId(userId: string): Promise<StudentProfileRecord> {
    const profile = await this.findByUserId(userId);

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
   * Create a student profile for an existing internal user.
   * Throws CONFLICT when a profile already exists for the given user_id.
   * userId must come from the backend (verified JWT), never from client payload.
   */
  async create(input: CreateStudentProfileInput): Promise<StudentProfileRecord> {
    this.assertUserId(input.userId);

    try {
      const result = await this.db.query<StudentProfileRow>(
        `INSERT INTO student_profiles
           (user_id, display_name, avatar_url, preferred_language, timezone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, profile_type, display_name, avatar_url,
                   preferred_language, timezone, created_at, updated_at`,
        [
          input.userId,
          input.displayName ?? null,
          input.avatarUrl ?? null,
          input.preferredLanguage ?? null,
          input.timezone ?? null,
        ],
      );

      if (result.rows.length === 0) {
        throw new AppError({
          code: ApiErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to create student profile',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }

      return this.toProfileRecord(result.rows[0]);
    } catch (err: unknown) {
      // PostgreSQL unique violation on user_id
      if (
        err instanceof Error &&
        'code' in err &&
        (err as { code: string }).code === '23505'
      ) {
        throw new AppError({
          code: ApiErrorCode.CONFLICT,
          message: 'Student profile already exists for this user',
          statusCode: HttpStatus.CONFLICT,
        });
      }
      throw err;
    }
  }

  /**
   * Upsert a student profile keyed on user_id.
   * Creates if absent, updates safe fields if present.
   * userId must come from the backend (verified JWT), never from client payload.
   */
  async upsertByUserId(
    input: CreateStudentProfileInput,
  ): Promise<StudentProfileRecord> {
    this.assertUserId(input.userId);

    const result = await this.db.query<StudentProfileRow>(
      `INSERT INTO student_profiles
         (user_id, display_name, avatar_url, preferred_language, timezone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         display_name       = COALESCE(EXCLUDED.display_name, student_profiles.display_name),
         avatar_url         = COALESCE(EXCLUDED.avatar_url, student_profiles.avatar_url),
         preferred_language = COALESCE(EXCLUDED.preferred_language, student_profiles.preferred_language),
         timezone           = COALESCE(EXCLUDED.timezone, student_profiles.timezone),
         updated_at         = now()
       RETURNING id, user_id, profile_type, display_name, avatar_url,
                 preferred_language, timezone, created_at, updated_at`,
      [
        input.userId,
        input.displayName ?? null,
        input.avatarUrl ?? null,
        input.preferredLanguage ?? null,
        input.timezone ?? null,
      ],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Failed to upsert student profile',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }

    return this.toProfileRecord(result.rows[0]);
  }

  /**
   * Update safe, mutable fields on a student profile identified by its owner user ID.
   * user_id and profile_type are immutable after creation.
   * Ownership must be verified by the caller before invoking this method.
   */
  async updateByUserId(
    userId: string,
    input: UpdateStudentProfileInput,
  ): Promise<StudentProfileRecord> {
    this.assertUserId(userId);

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
        userId,
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

    return this.toProfileRecord(result.rows[0]);
  }

  /**
   * Assert that the caller owns the profile.
   * Throws FORBIDDEN when the profile's userId does not match the requesting user's ID.
   * Must be called before any mutating operation exposed to clients.
   */
  assertOwnership(
    profile: StudentProfileRecord,
    requestingUserId: string,
  ): void {
    if (profile.userId !== requestingUserId) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'You do not have permission to access this profile',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private assertProfileId(profileId: string): void {
    if (!profileId || profileId.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'Profile ID is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private assertUserId(userId: string): void {
    if (!userId || userId.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'User ID is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private toProfileRecord(row: StudentProfileRow): StudentProfileRecord {
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
