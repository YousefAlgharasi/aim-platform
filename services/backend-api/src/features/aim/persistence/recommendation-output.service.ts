// Phase 5 — P5-060
// RecommendationOutputService.
//
// Scope: Persist AIM Engine recommendation outputs to the recommendations
//        table (P5-038). Implements the full-set replacement semantics
//        defined in P5-015.
//
// Responsibility:
//   Receives a validated AimValidatedRecommendation[] array from the
//   pipeline orchestrator (P5-056) and applies the following update rules:
//
//     1. Mark all existing 'active' rows for the student as 'superseded'.
//     2. Insert a new row per entry with status = 'active'.
//     3. Both steps run in sequence within the same logical unit of work
//        (the outer pipeline transaction guards atomicity at Stage 6 level).
//
//   If the AIM Engine omitted recommendations entirely (null/empty array),
//   the student's existing active recommendations are left unchanged.
//
// Backend authority rules enforced here:
//   - studentId is always sourced from the pipeline context (JWT-resolved),
//     never from a client payload.
//   - kind, targetSkillId, targetLessonId, rank, reason, basedOnWeaknessId,
//     generatedAt, and expiresAt come exclusively from the validated AIM
//     Engine response (P5-048 mapped and validated before reaching here).
//   - status is exclusively backend-managed; it is never accepted from the
//     wire output.
//   - The Backend never reorders the AIM-provided rank or invents entries.
//   - Ranks are not renumbered to fill gaps left by dropped entries (handled
//     by the adapter validation layer before this service receives the array).
//   - No AIM Engine call is made here; persistence never talks to the AIM
//     Engine directly.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AimValidatedRecommendation } from '../adapter/aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface RecommendationOutputPersistResult {
  readonly supersededCount: number;
  readonly insertedCount: number;
  readonly skippedReason: 'null_or_empty_array' | null;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class RecommendationOutputService {
  private readonly logger = new Logger(RecommendationOutputService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist a validated recommendation set from the AIM Engine.
   *
   * Applies full-set replacement semantics per P5-015:
   *   1. Mark existing active recommendations for the student as superseded.
   *   2. Insert each validated recommendation with status = 'active'.
   *
   * If recommendations is null, undefined, or empty, existing active
   * recommendations are left unchanged and a skipped_null result is returned
   * per the P5-015 update rules §5 (omitted array = no change).
   *
   * studentId must be JWT-resolved by the pipeline orchestrator — never
   * accepted from a client payload.
   */
  async replaceActiveSet(
    studentId: string,
    recommendations: AimValidatedRecommendation[] | null | undefined,
  ): Promise<RecommendationOutputPersistResult> {
    if (!recommendations || recommendations.length === 0) {
      this.logger.debug('recommendation_output_skipped_null_or_empty', {
        studentId,
        count: recommendations?.length ?? null,
      });
      return { supersededCount: 0, insertedCount: 0, skippedReason: 'null_or_empty_array' };
    }

    // -----------------------------------------------------------------------
    // Step 1: Supersede existing active recommendations for this student
    // -----------------------------------------------------------------------

    const superseded = await this.db.query<{ id: string }>(
      `UPDATE recommendations
          SET status     = 'superseded',
              updated_at = now()
        WHERE student_id = $1
          AND status     = 'active'
        RETURNING id`,
      [studentId],
    );

    const supersededCount = superseded.rowCount ?? 0;

    // -----------------------------------------------------------------------
    // Step 2: Insert the new active set
    // -----------------------------------------------------------------------

    let insertedCount = 0;

    for (const rec of recommendations) {
      // Defensive guard: skip entries with empty recommendationId or skillId
      if (!rec.recommendationId || rec.recommendationId.trim().length === 0) {
        this.logger.warn('recommendation_output_skipped_empty_recommendation_id', {
          studentId,
          rank: rec.rank,
        });
        continue;
      }

      if (!rec.targetSkillId || rec.targetSkillId.trim().length === 0) {
        this.logger.warn('recommendation_output_skipped_empty_skill_id', {
          studentId,
          recommendationId: rec.recommendationId,
        });
        continue;
      }

      await this.db.query(
        `INSERT INTO recommendations (
           id, student_id,
           kind, target_skill_id, target_lesson_id,
           rank, reason, based_on_weakness_id,
           generated_at, expires_at,
           status,
           created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', now(), now())`,
        [
          rec.recommendationId,
          studentId,
          rec.kind,
          rec.targetSkillId,
          rec.targetLessonId ?? null,
          rec.rank,
          rec.reason,
          rec.basedOnWeaknessId ?? null,
          rec.generatedAt,
          rec.expiresAt ?? null,
        ],
      );

      insertedCount += 1;
    }

    this.logger.log('recommendation_output_persisted', {
      studentId,
      supersededCount,
      insertedCount,
    });

    return { supersededCount, insertedCount, skippedReason: null };
  }
}
