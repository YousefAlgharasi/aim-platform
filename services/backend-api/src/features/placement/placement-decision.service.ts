// P4-052: PlacementDecisionService.
//
// Scope: First-login placement gate only.
//
// Responsibility:
//   Determine whether a student who has never taken a placement test and
//   has no learning progress should be shown the "Take the placement test"
//   vs "Start from scratch" gate, and persist their one-time choice so it
//   only shows once (student_profiles.placement_decision).
//
// Security rules:
//   - studentId is always the internal user id resolved from the verified
//     JWT — never from client input.
//   - Backend is the sole authority for whether the gate should show —
//     the client never decides this itself from local state alone.
//   - No secrets, service-role keys, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';

export type PlacementDecision = 'take_placement' | 'start_from_scratch';

export interface PlacementGateStatusResponse {
  /** True only when the student has never decided AND has no placement/progress signal yet. */
  readonly should_show_gate: boolean;
  readonly decision: PlacementDecision | null;
}

@Injectable()
export class PlacementDecisionService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Compute whether the first-login placement gate should be shown.
   *
   * should_show_gate is true only when ALL of:
   *   - the student has not already recorded a placement_decision, AND
   *   - the student has never completed a placement attempt, AND
   *   - the student has no student_level_state row (no learning progress yet).
   */
  async getGateStatus(studentId: string): Promise<PlacementGateStatusResponse> {
    const profileResult = await this.db.query<{ placement_decision: PlacementDecision | null }>(
      `WITH resolved_user AS (
         SELECT u.id AS user_id, sp.id AS profile_id
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       )
       SELECT sp.placement_decision
       FROM student_profiles sp
       WHERE sp.user_id = $1
          OR sp.id = $1
          OR sp.user_id IN (SELECT user_id FROM resolved_user)
          OR sp.id IN (SELECT profile_id FROM resolved_user)
       LIMIT 1`,
      [studentId],
    );

    const decision = profileResult.rows[0]?.placement_decision ?? null;
    if (decision) {
      return { should_show_gate: false, decision };
    }

    const completedAttempt = await this.db.query<{ id: string }>(
      `WITH resolved_user AS (
         SELECT u.id AS user_id, sp.id AS profile_id
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       )
       SELECT pa.id FROM placement_attempts pa
       WHERE (
         pa.student_id = $1
         OR pa.student_id IN (SELECT user_id FROM resolved_user)
       )
       AND pa.status = 'completed'
       LIMIT 1`,
      [studentId],
    );
    if ((completedAttempt.rowCount ?? 0) > 0) {
      return { should_show_gate: false, decision: null };
    }

    const levelState = await this.db.query<{ student_id: string }>(
      `WITH resolved_user AS (
         SELECT u.id AS user_id, sp.id AS profile_id
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       )
       SELECT sls.student_id FROM student_level_state sls
       WHERE (
         sls.student_id = $1
         OR sls.student_id IN (SELECT profile_id FROM resolved_user)
         OR sls.student_id IN (SELECT user_id FROM resolved_user)
       )
       LIMIT 1`,
      [studentId],
    );
    if ((levelState.rowCount ?? 0) > 0) {
      return { should_show_gate: false, decision: null };
    }

    return { should_show_gate: true, decision: null };
  }

  /**
   * Persist the student's one-time placement gate choice. Idempotent: once
   * set, calling again overwrites it (e.g. support/admin correction) but the
   * gate itself will no longer be shown to the student regardless.
   */
  async setDecision(studentId: string, decision: PlacementDecision): Promise<PlacementGateStatusResponse> {
    if (decision !== 'take_placement' && decision !== 'start_from_scratch') {
      throw new AppError({
        code: PlacementErrorCode.INVALID_ANSWER_VALUE,
        message: `Invalid placement decision: "${decision}".`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const updated = await this.db.query<{ id: string; placement_decision: PlacementDecision }>(
      `WITH prof AS (
         INSERT INTO student_profiles (user_id, placement_decision)
         VALUES (
           COALESCE((SELECT id FROM users WHERE id = $1 OR supabase_auth_uid = $1 LIMIT 1), $1),
           $2
         )
         ON CONFLICT (user_id) DO UPDATE
         SET placement_decision = $2, updated_at = now()
         RETURNING id, user_id, placement_decision
       ),
       seed_level AS (
         INSERT INTO student_level_state (
           student_id, current_cefr_rank, max_unlocked_cefr_rank, source, track_slug, updated_at
         )
         SELECT id, 1, 1, 'scratch', 'english', now()
         FROM prof
         WHERE $2 = 'start_from_scratch'
         ON CONFLICT (student_id, track_slug) DO UPDATE
           SET current_cefr_rank = GREATEST(student_level_state.current_cefr_rank, 1),
               max_unlocked_cefr_rank = GREATEST(student_level_state.max_unlocked_cefr_rank, 1),
               updated_at = now()
       ),
       seed_attempt AS (
         INSERT INTO placement_attempts (
           student_id, placement_test_id, status, started_at, completed_at, duration_seconds
         )
         SELECT prof.user_id, pt.id, 'completed', now(), now(), 0
         FROM prof
         CROSS JOIN LATERAL (SELECT id FROM placement_tests WHERE status = 'published' LIMIT 1) pt
         WHERE $2 = 'start_from_scratch'
           AND NOT EXISTS (SELECT 1 FROM placement_attempts pa WHERE pa.student_id = prof.user_id AND pa.status = 'completed')
         RETURNING id, student_id
       ),
       seed_result AS (
         INSERT INTO placement_results (
           placement_attempt_id, student_id, estimated_level, skill_mastery_map, weakness_map, created_at
         )
         SELECT sa.id, sa.student_id, 'beginner', '{}'::jsonb, '{"weaknesses":[]}'::jsonb, now()
         FROM seed_attempt sa
         WHERE NOT EXISTS (SELECT 1 FROM placement_results pr WHERE pr.placement_attempt_id = sa.id)
       )
       SELECT id, placement_decision FROM prof`,
      [studentId, decision],
    );

    if (!updated?.rows || updated.rows.length === 0) {
      throw new AppError({
        code: PlacementErrorCode.ATTEMPT_NOT_FOUND,
        message: 'Student profile not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return { should_show_gate: false, decision: updated.rows[0].placement_decision };
  }
}
