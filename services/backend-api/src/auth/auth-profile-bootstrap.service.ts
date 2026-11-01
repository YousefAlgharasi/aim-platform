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
import { BillingRepository } from '../features/billing/billing.repository';
import { SubscriptionService } from '../features/billing/subscription.service';
import {
  BootstrapProfileInput,
  BootstrapProfileResult,
} from './auth-profile-bootstrap.types';

// Raw row returned by the student_profiles upsert / metadata sync.
interface StudentProfileUpsertRow {
  readonly id: string;
  readonly user_id: string;
  readonly display_name?: string | null;
  readonly avatar_url?: string | null;
  readonly preferred_language?: string | null;
  readonly timezone?: string | null;
}

// Raw row returned by the admin_profiles upsert.
interface AdminProfileUpsertRow {
  readonly id: string;
  readonly user_id: string;
  readonly display_name?: string | null;
}

@Injectable()
export class AuthProfileBootstrapService {
  private readonly logger = new Logger(AuthProfileBootstrapService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly users: UsersService,
    private readonly authLogging: AuthLoggingService,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
    private readonly billingRepo: BillingRepository,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Ensure the authenticated account has an internal user record and a matching
   * profile row.  Idempotent — safe to call on every login.
   *
   * @param input  Fields extracted from the verified Supabase JWT.
   */
  async bootstrap(input: BootstrapProfileInput): Promise<BootstrapProfileResult> {
    let resolvedSupabaseUid = input.supabaseAuthUid;
    let existingUser = await this.users.findBySupabaseUid(resolvedSupabaseUid);

    // Do not allow an internal user ID (public.users.id) to be treated as a new
    // supabase_auth_uid if presented by mistake.
    if (!existingUser && typeof this.users.findById === 'function') {
      const userByInternalId = await this.users.findById(resolvedSupabaseUid);
      if (userByInternalId && userByInternalId.supabaseAuthUid !== resolvedSupabaseUid) {
        this.logger.warn(
          `Bootstrap received internalUserId (${resolvedSupabaseUid}) instead of supabaseAuthUid; resolving to canonical supabaseAuthUid (${userByInternalId.supabaseAuthUid})`,
        );
        resolvedSupabaseUid = userByInternalId.supabaseAuthUid;
        existingUser = userByInternalId;
      }
    }

    // If no record matched by supabase_auth_uid, check whether an active
    // auth.users + public.users account already owns this verified email so we
    // never create a duplicate internal user or student profile.
    if (!existingUser && input.email && typeof this.users.findByEmailWithAuthUser === 'function') {
      const canonicalByEmail = await this.users.findByEmailWithAuthUser(input.email);
      if (canonicalByEmail) {
        resolvedSupabaseUid = canonicalByEmail.supabaseAuthUid;
        existingUser = canonicalByEmail;
      }
    }

    // 1. Upsert the internal user row.  email/phone are synced from the JWT on every call.
    const user = await this.users.upsertBySupabaseUid({
      supabaseAuthUid: resolvedSupabaseUid,
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
    let profileDetails: {
      profileId?: string | null;
      displayName?: string | null;
      avatarUrl?: string | null;
      preferredLanguage?: string | null;
      timezone?: string | null;
    } = {};

    if (user.userType === 'student') {
      profileCreated = await this.ensureStudentProfile(user.id);
      profileType = 'student_profile';
      profileDetails = await this.syncStudentProfileMetadata(user.id, input);
      await this.ensureRoleAssigned(user.id, 'student');
      await this.ensureFreeSubscription(user.id);
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
      ...(profileDetails.profileId !== undefined ? { profileId: profileDetails.profileId } : {}),
      ...(profileDetails.displayName !== undefined ? { displayName: profileDetails.displayName } : {}),
      ...(profileDetails.avatarUrl !== undefined ? { avatarUrl: profileDetails.avatarUrl } : {}),
      ...(profileDetails.preferredLanguage !== undefined
        ? { preferredLanguage: profileDetails.preferredLanguage }
        : {}),
      ...(profileDetails.timezone !== undefined ? { timezone: profileDetails.timezone } : {}),
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
   * Synchronize display_name, avatar_url, preferred_language, and timezone onto
   * student_profiles from the caller input or auth.users.raw_user_meta_data without
   * overwriting custom profile values already chosen by the student.
   */
  private async syncStudentProfileMetadata(
    internalUserId: string,
    input: BootstrapProfileInput,
  ): Promise<{
    profileId?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
    preferredLanguage?: string | null;
    timezone?: string | null;
  }> {
    const cleanDisplayName = input.displayName?.trim() || null;
    const cleanAvatarUrl = input.avatarUrl?.trim() || null;
    const cleanPreferredLanguage = input.preferredLanguage?.trim() || null;
    const cleanTimezone = input.timezone?.trim() || null;

    const result = await this.db.query<StudentProfileUpsertRow>(
      `UPDATE student_profiles sp
       SET
         display_name = CASE
           WHEN sp.display_name IS NULL OR TRIM(sp.display_name) = '' THEN
             COALESCE(
               $2,
               NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')), ''),
               NULLIF(SPLIT_PART(u.email, '@', 1), '')
             )
           WHEN sp.display_name = SPLIT_PART(u.email, '@', 1)
             AND COALESCE($2, NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')), '')) IS NOT NULL THEN
             COALESCE(
               $2,
               NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name')), '')
             )
           ELSE sp.display_name
         END,
         avatar_url = COALESCE(
           NULLIF(TRIM(sp.avatar_url), ''),
           $3,
           NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'avatar_url', au.raw_user_meta_data->>'picture')), '')
         ),
         preferred_language = COALESCE(NULLIF(TRIM(sp.preferred_language), ''), $4, 'en'),
         timezone = COALESCE(NULLIF(TRIM(sp.timezone), ''), $5),
         updated_at = now()
       FROM users u
       LEFT JOIN auth.users au ON au.id::text = u.supabase_auth_uid::text AND au.deleted_at IS NULL
       WHERE sp.user_id = $1 AND u.id = $1
       RETURNING sp.id, sp.user_id, sp.display_name, sp.avatar_url, sp.preferred_language, sp.timezone`,
      [internalUserId, cleanDisplayName, cleanAvatarUrl, cleanPreferredLanguage, cleanTimezone],
    );

    const row = result.rows[0];
    if (!row || row.display_name === undefined) {
      return {};
    }

    return {
      profileId: row.id,
      displayName: row.display_name ?? null,
      avatarUrl: row.avatar_url ?? null,
      preferredLanguage: row.preferred_language ?? null,
      timezone: row.timezone ?? null,
    };
  }

  /**
   * Ensure the user is a member of the given role (by key). System-assigned,
   * so assigned_by is left null. Safe to call on every login.
   */
  private async ensureRoleAssigned(internalUserId: string, roleKey: string): Promise<void> {
    await this.db.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, r.id FROM roles r WHERE r.key = $2
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [internalUserId, roleKey],
    );
  }

  /**
   * Provision the free plan subscription for a student who has no subscription
   * yet, so the Plans/Subscription UI can show "Current Plan: Free" instead of
   * treating the user as having no plan at all. No-op if a subscription
   * already exists. Safe to call on every login.
   */
  private async ensureFreeSubscription(internalUserId: string): Promise<void> {
    const existing = await this.subscriptionService.getUserSubscriptions(internalUserId);
    if (existing.length > 0) {
      return;
    }

    const freePlan = await this.billingRepo.findPlanByType('free');
    if (!freePlan) {
      this.logger.warn(
        `Bootstrap: no active "free" billing plan found; skipping subscription provisioning (userId=${internalUserId})`,
      );
      return;
    }

    await this.subscriptionService.createSubscription({
      userId: internalUserId,
      planId: freePlan.id,
      status: 'active',
    });
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
