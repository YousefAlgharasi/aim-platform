// Phase 2 — P2-031
// Admin profile service.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Centralise all admin profile access so no other module duplicates
//   profile query logic or bypasses ownership / role checks.
//
// Security rules:
//   - user_id is always sourced from the verified internal user record, never from client input.
//   - Admin profile existence does NOT grant admin authority.
//     Admin access must be verified via backend role and permission guards.
//   - Backend is the final authority for identity, roles, permissions, and ownership.
//   - No onboarding, placement, lessons, sessions, progress, AIM, recommendations,
//     AI Teacher, or Student Web App logic is implemented here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  AdminProfileRecord,
  AdminProfileRow,
  CreateAdminProfileInput,
  UpdateAdminProfileInput,
} from './admin-profile.types';

@Injectable()
export class AdminProfileService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Find an admin profile by its internal UUID primary key.
   * Returns null when no record exists.
   */
  async findById(profileId: string): Promise<AdminProfileRecord | null> {
    this.assertProfileId(profileId);

    const result = await this.db.query<AdminProfileRow>(
      `SELECT id, user_id, profile_type, display_name, avatar_url,
              department, created_at, updated_at
       FROM admin_profiles
       WHERE id = $1
       LIMIT 1`,
      [profileId],
    );

    return result.rows.length > 0
      ? this.toProfileRecord(result.rows[0])
      : null;
  }

  /**
   * Find an admin profile by its owner's internal user ID.
   * userId must always be resolved by the backend from a verified JWT.
   * Returns null when no record exists.
   */
  async findByUserId(userId: string): Promise<AdminProfileRecord | null> {
    this.assertUserId(userId);

    const result = await this.db.query<AdminProfileRow>(
      `SELECT id, user_id, profile_type, display_name, avatar_url,
              department, created_at, updated_at
       FROM admin_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [userId],
    );

    return result.rows.length > 0
      ? this.toProfileRecord(result.rows[0])
      : null;
  }

  /**
   * Get an admin profile by internal UUID — throws NOT_FOUND when absent.
   */
  async getById(profileId: string): Promise<AdminProfileRecord> {
    const profile = await this.findById(profileId);

    if (!profile) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Admin profile not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return profile;
  }

  /**
   * Get an admin profile by owner user ID — throws NOT_FOUND when absent.
   */
  async getByUserId(userId: string): Promise<AdminProfileRecord> {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Admin profile not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return profile;
  }

  /**
   * Create an admin profile for an existing internal user.
   * Throws CONFLICT when a profile already exists for the given user_id.
   * userId must come from the backend (verified JWT + internal user lookup),
   * never from a client payload.
   */
  async create(input: CreateAdminProfileInput): Promise<AdminProfileRecord> {
    this.assertUserId(input.userId);

    try {
      const result = await this.db.query<AdminProfileRow>(
        `INSERT INTO admin_profiles (user_id, display_name, avatar_url, department)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, profile_type, display_name, avatar_url,
                   department, created_at, updated_at`,
        [
          input.userId,
          input.displayName ?? null,
          input.avatarUrl ?? null,
          input.department ?? null,
        ],
      );

      if (result.rows.length === 0) {
        throw new AppError({
          code: ApiErrorCode.INTERNAL_SERVER_ERROR,
          message: 'Failed to create admin profile',
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
          message: 'Admin profile already exists for this user',
          statusCode: HttpStatus.CONFLICT,
        });
      }
      throw err;
    }
  }

  /**
   * Upsert an admin profile keyed on user_id.
   * Creates if absent, refreshes safe fields if present.
   * userId must come from the backend, never from client payload.
   */
  async upsertByUserId(
    input: CreateAdminProfileInput,
  ): Promise<AdminProfileRecord> {
    this.assertUserId(input.userId);

    const result = await this.db.query<AdminProfileRow>(
      `INSERT INTO admin_profiles (user_id, display_name, avatar_url, department)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         display_name = COALESCE(EXCLUDED.display_name, admin_profiles.display_name),
         avatar_url   = COALESCE(EXCLUDED.avatar_url,   admin_profiles.avatar_url),
         department   = COALESCE(EXCLUDED.department,   admin_profiles.department),
         updated_at   = now()
       RETURNING id, user_id, profile_type, display_name, avatar_url,
                 department, created_at, updated_at`,
      [
        input.userId,
        input.displayName ?? null,
        input.avatarUrl ?? null,
        input.department ?? null,
      ],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Failed to upsert admin profile',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }

    return this.toProfileRecord(result.rows[0]);
  }

  /**
   * Update safe, mutable fields on an admin profile identified by owner user ID.
   * userId and profileType are immutable after creation.
   * Caller must verify the requesting user has the correct role before invoking.
   */
  async updateByUserId(
    userId: string,
    input: UpdateAdminProfileInput,
  ): Promise<AdminProfileRecord> {
    this.assertUserId(userId);

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
        userId,
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

    return this.toProfileRecord(result.rows[0]);
  }

  /**
   * Assert that the caller owns the profile.
   * Throws FORBIDDEN when the profile's userId does not match the requesting user's ID.
   * Must be called before any mutating operation exposed to clients.
   * Note: admin authority still requires a separate role/permission guard.
   */
  assertOwnership(
    profile: AdminProfileRecord,
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

  private toProfileRecord(row: AdminProfileRow): AdminProfileRecord {
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
