// Phase 2 — P2-029
// Users service.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Centralise all internal user record access so no other module
//   duplicates user query logic or bypasses status/ownership checks.
//
// Security rules:
//   - supabase_auth_uid is always sourced from the verified JWT, never from client input.
//   - user_type and status are read from the database; clients cannot set them here.
//   - Backend is the final authority for identity, roles, permissions, and ownership.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  UpdateUserInput,
  UpsertUserInput,
  UserRecord,
  UserRow,
  UsersPage,
} from './users.types';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Find an internal user record by its internal UUID primary key.
   * Returns null when no record exists.
   */
  async findById(internalUserId: string): Promise<UserRecord | null> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<UserRow>(
      `SELECT id, supabase_auth_uid, email, phone, user_type, status, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [internalUserId],
    );

    return result.rows.length > 0 ? this.toUserRecord(result.rows[0]) : null;
  }

  /**
   * Find an internal user record by the verified Supabase Auth UID.
   * The UID must always be sourced from the verified JWT, never from a client payload.
   * Returns null when no record exists.
   */
  async findBySupabaseUid(supabaseAuthUid: string): Promise<UserRecord | null> {
    this.assertSupabaseUid(supabaseAuthUid);

    const result = await this.db.query<UserRow>(
      `SELECT id, supabase_auth_uid, email, phone, user_type, status, created_at, updated_at
       FROM users
       WHERE supabase_auth_uid = $1
       LIMIT 1`,
      [supabaseAuthUid],
    );

    return result.rows.length > 0 ? this.toUserRecord(result.rows[0]) : null;
  }

  /**
   * Get an internal user record by internal UUID — throws NOT_FOUND when absent.
   */
  async getById(internalUserId: string): Promise<UserRecord> {
    const user = await this.findById(internalUserId);

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return user;
  }

  /**
   * Get an internal user record by Supabase Auth UID — throws NOT_FOUND when absent.
   */
  async getBySupabaseUid(supabaseAuthUid: string): Promise<UserRecord> {
    const user = await this.findBySupabaseUid(supabaseAuthUid);

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return user;
  }

  /**
   * Upsert a user record keyed on supabase_auth_uid.
   * Called during auth profile bootstrap (P2-025) to ensure every
   * authenticated account has an internal user row.
   *
   * user_type defaults to 'student' on INSERT; it is not updated on conflict.
   * status defaults to 'active' on INSERT; it is not updated on conflict.
   * email and phone are refreshed on conflict so they stay in sync with Supabase Auth.
   */
  async upsertBySupabaseUid(input: UpsertUserInput): Promise<UserRecord> {
    this.assertSupabaseUid(input.supabaseAuthUid);

    const result = await this.db.query<UserRow>(
      `INSERT INTO users (supabase_auth_uid, email, phone)
       VALUES ($1, $2, $3)
       ON CONFLICT (supabase_auth_uid)
       DO UPDATE SET
         email      = EXCLUDED.email,
         phone      = EXCLUDED.phone,
         updated_at = now()
       RETURNING id, supabase_auth_uid, email, phone, user_type, status, created_at, updated_at`,
      [
        input.supabaseAuthUid,
        input.email ?? null,
        input.phone ?? null,
      ],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Failed to upsert user record',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }

    return this.toUserRecord(result.rows[0]);
  }

  /**
   * Update safe, mutable fields on an existing user record.
   * Only email and phone may be changed through this method.
   * user_type, status, and supabase_auth_uid are not writable here.
   */
  async updateById(
    internalUserId: string,
    input: UpdateUserInput,
  ): Promise<UserRecord> {
    this.assertUserId(internalUserId);

    const result = await this.db.query<UserRow>(
      `UPDATE users
       SET
         email      = COALESCE($2, email),
         phone      = COALESCE($3, phone),
         updated_at = now()
       WHERE id = $1
       RETURNING id, supabase_auth_uid, email, phone, user_type, status, created_at, updated_at`,
      [internalUserId, input.email ?? null, input.phone ?? null],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return this.toUserRecord(result.rows[0]);
  }

  /**
   * Assert that the user is active. Throws FORBIDDEN when the account is
   * disabled or deleted. Throws BAD_REQUEST when pending.
   * Called by guards and other services before acting on a user.
   */
  assertUserIsActive(user: UserRecord): void {
    if (user.status === 'disabled' || user.status === 'deleted') {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'User account is not active',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (user.status === 'pending') {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'User account is pending activation',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
  }

  /**
   * List all users with offset-based pagination.
   * Returns safe UserRecord objects — supabaseAuthUid is present on the
   * domain record but callers (e.g. AdminService) must strip it before
   * including it in any client-facing response.
   */
  async listAll(offset: number, limit: number): Promise<UsersPage> {
    const [dataResult, countResult] = await Promise.all([
      this.db.query<UserRow>(
        `SELECT id, supabase_auth_uid, email, phone, user_type, status, created_at, updated_at
         FROM users
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset],
      ),
      this.db.query<{ count: string }>(`SELECT COUNT(*) AS count FROM users`),
    ]);

    return {
      users: dataResult.rows.map((row) => this.toUserRecord(row)),
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
    };
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

  private assertSupabaseUid(supabaseAuthUid: string): void {
    if (!supabaseAuthUid || supabaseAuthUid.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'Supabase Auth UID is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
  }

  private toUserRecord(row: UserRow): UserRecord {
    return {
      id: row.id,
      supabaseAuthUid: row.supabase_auth_uid,
      email: row.email,
      phone: row.phone,
      userType: row.user_type,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
