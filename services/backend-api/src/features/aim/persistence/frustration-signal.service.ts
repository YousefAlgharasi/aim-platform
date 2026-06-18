// Phase 5 — P5-062
// FrustrationSignalService.
//
// Scope: Persist the AIM Engine's educational behavioral signal output
//        (frustrationLevel, engagementLevel, signalBasis) contained within
//        the validated AimValidatedSessionSummary into the session_summaries
//        table (P5-040).
//
// Responsibility:
//   Receives a validated AimValidatedSessionSummary (optional) from the
//   pipeline orchestrator (P5-056) and upserts the full session_summaries
//   row. The behavioral signal fields (frustration_level, engagement_level,
//   signal_basis) are the primary concern of this service per P5-062 scope.
//
//   Because session_summaries requires all columns to be non-null, this
//   service writes the entire row on insert and overwrites all AIM-derived
//   fields on update. P5-063 (SessionSummaryService) is the canonical owner
//   of the full summary persistence; this service handles the same row from
//   the behavioural-signal angle and may be superseded or composed by P5-063.
//
//   Update rules per P5-017:
//     1. If no row exists for sessionId → INSERT all fields with createdAt=now().
//     2. If a row exists → overwrite all AIM-derived fields, set updatedAt=now().
//     3. A null/absent session summary leaves existing rows unchanged.
//
// Critical safety rules enforced here:
//   - frustrationLevel, engagementLevel, signalBasis are coarse, fixed-enum
//     educational signals ONLY. They are never clinical, diagnostic, or
//     psychological labels. No schema field exists for such a label; none
//     may be added here without revising P5-017 and re-running the Phase 5
//     privacy review.
//   - studentId is always sourced from the pipeline context (JWT-resolved),
//     never from a client payload.
//   - All behavioral signal values come exclusively from the validated AIM
//     Engine response (P5-048 mapped and validated before reaching here).
//   - The Backend never computes frustrationLevel, engagementLevel, or
//     signalBasis itself.
//   - No AIM Engine call is made here.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AimValidatedSessionSummary } from '../adapter/aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Internal row shape (for existence check)
// ---------------------------------------------------------------------------

interface SessionSummaryExistingRow {
  readonly id: string;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type FrustrationSignalPersistAction = 'inserted' | 'updated' | 'skipped_null';

export interface FrustrationSignalPersistResult {
  readonly ok: boolean;
  readonly action: FrustrationSignalPersistAction;
  readonly skippedReason?: 'null_summary' | 'empty_session_id';
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class FrustrationSignalService {
  private readonly logger = new Logger(FrustrationSignalService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist the AIM Engine's validated behavioral signal from a session summary.
   *
   * If sessionSummary is null/undefined (the AIM Engine omitted it for this
   * call), the existing session_summaries row for this session is left
   * unchanged per P5-017 update rules §5.
   *
   * frustrationLevel, engagementLevel, and signalBasis are stored as coarse
   * educational signals only — never clinical or diagnostic labels. The
   * Backend never relabels them as mental-health terms.
   *
   * studentId must be JWT-resolved by the pipeline orchestrator — never
   * accepted from a client payload.
   */
  async persist(
    studentId: string,
    sessionSummary: AimValidatedSessionSummary | null | undefined,
  ): Promise<FrustrationSignalPersistResult> {
    if (!sessionSummary) {
      this.logger.debug('frustration_signal_skipped_null', { studentId });
      return { ok: true, action: 'skipped_null', skippedReason: 'null_summary' };
    }

    // Defensive guard
    if (!sessionSummary.sessionId || sessionSummary.sessionId.trim().length === 0) {
      this.logger.warn('frustration_signal_skipped_empty_session_id', { studentId });
      return { ok: false, action: 'skipped_null', skippedReason: 'empty_session_id' };
    }

    // -----------------------------------------------------------------------
    // Check for existing row
    // -----------------------------------------------------------------------

    const existing = await this.db.query<SessionSummaryExistingRow>(
      `SELECT id FROM session_summaries WHERE session_id = $1 LIMIT 1`,
      [sessionSummary.sessionId],
    );

    const rowExists = (existing.rowCount ?? 0) > 0;

    if (!rowExists) {
      // Rule 1: INSERT — write all required columns
      await this.db.query(
        `INSERT INTO session_summaries (
           student_id, session_id,
           items_attempted, items_correct,
           skills_touched,
           overall_mastery_shift,
           frustration_level, engagement_level, signal_basis,
           closed_out_at,
           created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9::jsonb, $10, now(), now())`,
        [
          studentId,
          sessionSummary.sessionId,
          sessionSummary.itemsAttempted,
          sessionSummary.itemsCorrect,
          JSON.stringify(sessionSummary.skillsTouched),
          sessionSummary.overallMasteryShift,
          sessionSummary.frustrationLevel,
          sessionSummary.engagementLevel,
          JSON.stringify(sessionSummary.signalBasis),
          sessionSummary.closedOutAt,
        ],
      );

      this.logger.log('frustration_signal_inserted', {
        studentId,
        sessionId: sessionSummary.sessionId,
        // Log only coarse signal enum values — never raw payload or PII
        frustrationLevel: sessionSummary.frustrationLevel,
        engagementLevel: sessionSummary.engagementLevel,
      });

      return { ok: true, action: 'inserted' };
    }

    // Rule 2: UPDATE — overwrite all AIM-derived fields
    await this.db.query(
      `UPDATE session_summaries
          SET items_attempted     = $1,
              items_correct       = $2,
              skills_touched      = $3::jsonb,
              overall_mastery_shift = $4,
              frustration_level   = $5,
              engagement_level    = $6,
              signal_basis        = $7::jsonb,
              closed_out_at       = $8,
              updated_at          = now()
        WHERE session_id          = $9`,
      [
        sessionSummary.itemsAttempted,
        sessionSummary.itemsCorrect,
        JSON.stringify(sessionSummary.skillsTouched),
        sessionSummary.overallMasteryShift,
        sessionSummary.frustrationLevel,
        sessionSummary.engagementLevel,
        JSON.stringify(sessionSummary.signalBasis),
        sessionSummary.closedOutAt,
        sessionSummary.sessionId,
      ],
    );

    this.logger.log('frustration_signal_updated', {
      studentId,
      sessionId: sessionSummary.sessionId,
      frustrationLevel: sessionSummary.frustrationLevel,
      engagementLevel: sessionSummary.engagementLevel,
    });

    return { ok: true, action: 'updated' };
  }
}
