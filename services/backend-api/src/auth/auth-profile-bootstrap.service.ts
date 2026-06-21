// Phase 2 — P2-025
// Auth profile bootstrap service.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Ensure every authenticated account maps to:
//     1. An internal users row (upserted via UsersService).
//     2. A student_profiles row  (when user_type = 'student', default).
//     3. An admin_profiles row   (when user_type = 'admin').
//
//   Called from a POST /auth/bootstrap endpoint immediately after login.
//   Idempotent — safe to call on every login attempt.
//
// Security rules:
//   - supabaseAuthUid must always come from a verified JWT, never from client input.
//   - user_type and status are read from the database after upsert; clients cannot override them.
//   - Profile existence does NOT grant admin authority. Role/permission checks remain final.
//   - Backend is the final authority for identity, roles, permissions, and ownership.
//   - No secrets, service-role keys, database credentials, or privileged config are exposed.
//   - No onboarding, placement, lessons, sessions, AIM, AI Teacher, or Student Web App logic here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UsersService } from '../features/users/users.service';
import { AuthLoggingService } from './auth-logging.service';
import { AnalyticsEventIngestionService } from '../features/analytics/analytics-event-ingestion.service';
import {
  BootstrapProfileInput,
  BootstrapProfileResult,
} from './auth-profile-bootstrap.types';

// Raw row returned by the student_profiles upsert.
interface StudentProfileUpsertRow {
  readonly id: string;
  readonly user_id: string;
}

// Raw row returned by the admin_profiles upsert.
interface AdminProfileUpsertRow {
  readonly id: string;
  readonly user_id: string;
}

@Injectable()
export class AuthProfileBootstrapService {
  private readonly logger = new Logger(AuthProfileBootstrapService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly users: UsersService,
    private readonly authLogging: AuthLoggingService,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
  ) {}

  /**
   * Ensure the authenticated account has an internal user record and a matching
   * profile row.  Idempotent — safe to call on every login.
   *
   * @param input  Fields extracted from the verified Supabase JWT.
   */
  async bootstrap(input: BootstrapProfileInput): Promise<BootstrapProfileResult> {
    // 1. Upsert the internal user row.  email/phone are synced from the JWT on every call.
    const existingUser = await this.users.findBySupabaseUid(input.supabaseAuthUid);
    const user = await this.users.upsertBySupabaseUid({
      supabaseAuthUid: input.supabaseAuthUid,
      email: input.email ?? null,
      phone: input.phone ?? null,
    });

    const userCreated = existingUser === null;

    // 2. Log user_created on first-ever insert.
    if (userCreated) {
      await this.authLogging.log('user_created', {
        userId: user.id,
        supabaseAuthUid: user.supabaseAuthUid,
        metadata: { userType: user.userType },
      });

      await this.analyticsEventIngestionService.ingest({
        eventType: 'user.registered',
        actorRole: 'system',
        actorId: user.id,
        subjectType: 'user',
        subjectId: user.id,
        metadata: { role: user.userType },
      });
    }

    await this.analyticsEventIngestionService.ingest({
      eventType: 'user.login',
      actorRole: 'system',
      actorId: user.id,
      subjectType: 'user',
      subjectId: user.id,
      metadata: { role: user.userType },
    });

    // 3. Ensure the correct profile row exists, keyed on user_type from the database.
    let profileCreated = false;
    let profileType: string | null = null;

    if (user.userType === 'student') {
      profileCreated = await this.ensureStudentProfile(user.id);
      profileType = 'student_profile';
    } else if (user.userType === 'admin') {
      profileCreated = await this.ensureAdminProfile(user.id);
      profileType = 'admin_profile';
    } else {
      // reviewer / support / system — no profile row required in Phase 2.
      this.logger.log(
        `Bootstrap: no profile created for user_type="${user.userType}" (userId=${user.id})`,
      );
    }

    return {
      internalUserId: user.id,
      userType: user.userType,
      status: user.status,
      userCreated,
      profileCreated,
      profileType,
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * INSERT a student_profiles row if none exists for the given internal user ID.
   * Uses ON CONFLICT DO NOTHING so concurrent calls are safe.
   * Returns true if a new row was inserted, false if one already existed.
   */
  private async ensureStudentProfile(internalUserId: string): Promise<boolean> {
    const result = await this.db.query<StudentProfileUpsertRow>(
      `INSERT INTO student_profiles (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING id, user_id`,
      [internalUserId],
    );

    return result.rows.length > 0;
  }

  /**
   * INSERT an admin_profiles row if none exists for the given internal user ID.
   * Uses ON CONFLICT DO NOTHING so concurrent calls are safe.
   * Returns true if a new row was inserted, false if one already existed.
   */
  private async ensureAdminProfile(internalUserId: string): Promise<boolean> {
    const result = await this.db.query<AdminProfileUpsertRow>(
      `INSERT INTO admin_profiles (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING
       RETURNING id, user_id`,
      [internalUserId],
    );

    return result.rows.length > 0;
  }
}
