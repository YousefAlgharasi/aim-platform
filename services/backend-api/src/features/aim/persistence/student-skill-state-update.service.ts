// Phase 5 — P5-057
// StudentSkillStateUpdateService.
//
// Scope: Persist AIM Engine skill state outputs (mastery, confidence, trend)
//        to the student_skill_states table (P5-029).
//
// Responsibility:
//   Receives a validated AimValidatedSkillState[] array from the pipeline
//   orchestrator (P5-056) and upserts one row per (student_id, skill_id) pair
//   using an INSERT … ON CONFLICT DO UPDATE (upsert) pattern.
//
//   This is the sole path for writing AIM-owned mastery values to the backend
//   database. No other service, controller, or client may write mastery_score,
//   mastery_confidence, or mastery_trend directly.
//
// Backend authority rules enforced here:
//   - studentId is always sourced from the pipeline context (JWT-resolved),
//     never from a client payload.
//   - All mastery values come exclusively from the validated AIM Engine
//     response (P5-048 mapped and validated before reaching this service).
//   - previous_mastery_score is read from the existing row (if any) before
//     the upsert, so the history is preserved by the backend — not supplied
//     by the AIM Engine or a client.
//   - No mastery, level, weakness, difficulty, recommendation, review
//     schedule, retention, or frustration is computed here; values are
//     persisted as received from the validated response.
//   - No AIM Engine call is made here; features/aim/persistence never
//     talks to the AIM Engine. Only the adapter (P5-051) does.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AimValidatedSkillState } from '../adapter/aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Internal row shape
// ---------------------------------------------------------------------------

interface SkillStateCurrentRow {
  readonly mastery_score: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class StudentSkillStateUpdateService {
  private readonly logger = new Logger(StudentSkillStateUpdateService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist validated skill state updates from the AIM Engine.
   *
   * Each entry in skillStates is upserted into student_skill_states as
   * an authoritative backend record. The previous_mastery_score column
   * is populated from the current row before the upsert so the trajectory
   * is always backend-tracked, not AIM Engine-supplied.
   *
   * studentId must be JWT-resolved by the pipeline orchestrator — never
   * accepted from a client payload.
   *
   * Skips any entry where skillId is empty (defensive guard).
   */
  async upsertMany(
    studentId: string,
    skillStates: AimValidatedSkillState[],
  ): Promise<void> {
    if (skillStates.length === 0) return;

    for (const state of skillStates) {
      if (!state.skillId || state.skillId.trim().length === 0) {
        this.logger.warn('skill_state_upsert_skipped_empty_skill_id', {
          studentId,
          lastAttemptId: state.lastAttemptId,
        });
        continue;
      }

      await this.upsertOne(studentId, state);
    }
  }

  // -------------------------------------------------------------------------
  // Private: upsert a single skill state row
  // -------------------------------------------------------------------------

  private async upsertOne(
    studentId: string,
    state: AimValidatedSkillState,
  ): Promise<void> {
    // Read current mastery_score (if row exists) so we can preserve history
    // in previous_mastery_score. This is backend-tracked — not AIM-supplied.
    const existing = await this.db.query<SkillStateCurrentRow>(
      `SELECT mastery_score
         FROM student_skill_states
        WHERE student_id = $1 AND skill_id = $2
        LIMIT 1`,
      [studentId, state.skillId],
    );

    const previousMasteryScore =
      (existing.rowCount ?? 0) > 0 ? existing.rows[0].mastery_score : null;

    await this.db.query(
      `INSERT INTO student_skill_states (
         student_id, skill_id,
         mastery_score, mastery_confidence, mastery_trend,
         previous_mastery_score,
         last_attempt_id, last_evaluated_at,
         created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
       ON CONFLICT (student_id, skill_id) DO UPDATE
         SET mastery_score          = EXCLUDED.mastery_score,
             mastery_confidence     = EXCLUDED.mastery_confidence,
             mastery_trend          = EXCLUDED.mastery_trend,
             previous_mastery_score = $6,
             last_attempt_id        = EXCLUDED.last_attempt_id,
             last_evaluated_at      = EXCLUDED.last_evaluated_at,
             updated_at             = now()`,
      [
        studentId,
        state.skillId,
        state.masteryScore,
        state.masteryConfidence,
        state.masteryTrend,
        previousMasteryScore,
        state.lastAttemptId,
        state.evaluatedAt,
      ],
    );

    this.logger.log('skill_state_upserted', {
      studentId,
      skillId: state.skillId,
      masteryTrend: state.masteryTrend,
      lastAttemptId: state.lastAttemptId,
    });
  }
}
