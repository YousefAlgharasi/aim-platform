// Phase 5 — P5-063
// SessionSummaryService.
//
// Scope: Canonical persistence service for AIM Engine session summary outputs
//        to the session_summaries table (P5-040). Implements the update rules
//        defined in P5-017.
//
// Responsibility:
//   Receives a validated AimValidatedSessionSummary (optional) from the
//   pipeline orchestrator (P5-056) and upserts the session_summaries row.
//
//   Update rules per P5-017:
//     1. If no row exists for sessionId → INSERT all AIM-derived fields,
//        with createdAt = updatedAt = now().
//     2. If a row exists → overwrite all AIM-derived fields, set updatedAt=now().
//     3. A null/absent session summary leaves the existing row unchanged.
//
//   This is the canonical, and (as of P20-017) sole, session_summaries
//   persistence service. FrustrationSignalService (P5-062) was a
//   byte-for-byte duplicate writer of the same row and has been deleted.
//
// Backend authority rules enforced here:
//   - studentId is always sourced from the pipeline context (JWT-resolved),
//     never from a client payload.
//   - All AIM-derived fields (overallMasteryShift, frustrationLevel,
//     engagementLevel, signalBasis, closedOutAt, itemsAttempted,
//     itemsCorrect, skillsTouched) come exclusively from the validated AIM
//     Engine response (P5-048 mapped and validated before reaching here).
//   - frustrationLevel and engagementLevel are stored as coarse, fixed-enum
//     EDUCATIONAL signals only — never clinical or diagnostic labels. No
//     such label may be added here without revising P5-017 and re-running
//     the Phase 5 security and privacy review.
//   - No AIM Engine call is made here.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AimValidatedSessionSummary } from '../adapter/aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Internal row shape
// ---------------------------------------------------------------------------

interface SessionSummaryExistingRow {
  readonly id: string;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type SessionSummaryPersistAction = 'inserted' | 'updated' | 'skipped_null';

export interface SessionSummaryPersistResult {
  readonly ok: boolean;
  readonly action: SessionSummaryPersistAction;
  readonly skippedReason?: 'null_summary' | 'empty_session_id';
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class SessionSummaryService {
  private readonly logger = new Logger(SessionSummaryService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist an AIM Engine validated session summary.
   *
   * If sessionSummary is null/undefined (the AIM Engine omitted it for this
   * call), the existing row for this session is left unchanged per P5-017
   * update rules §3.
   *
   * frustrationLevel and engagementLevel are stored as coarse educational
   * signals only — never clinical or diagnostic labels.
   *
   * studentId must be JWT-resolved by the pipeline orchestrator — never
   * accepted from a client payload.
   */
  async persist(
    studentId: string,
    sessionSummary: AimValidatedSessionSummary | null | undefined,
  ): Promise<SessionSummaryPersistResult> {
    if (!sessionSummary) {
      this.logger.debug('session_summary_skipped_null', { studentId });
      return { ok: true, action: 'skipped_null', skippedReason: 'null_summary' };
    }

    // Defensive guard
    if (!sessionSummary.sessionId || sessionSummary.sessionId.trim().length === 0) {
      this.logger.warn('session_summary_skipped_empty_session_id', { studentId });
      return { ok: false, action: 'skipped_null', skippedReason: 'empty_session_id' };
    }

    // -----------------------------------------------------------------------
    // Check for existing row by sessionId
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

      this.logger.log('session_summary_inserted', {
        studentId,
        sessionId: sessionSummary.sessionId,
        itemsAttempted: sessionSummary.itemsAttempted,
        itemsCorrect: sessionSummary.itemsCorrect,
        overallMasteryShift: sessionSummary.overallMasteryShift,
        // Log coarse enum signals only — never raw payload
        frustrationLevel: sessionSummary.frustrationLevel,
        engagementLevel: sessionSummary.engagementLevel,
      });

      return { ok: true, action: 'inserted' };
    }

    // Rule 2: UPDATE — overwrite all AIM-derived fields
    await this.db.query(
      `UPDATE session_summaries
          SET items_attempted       = $1,
              items_correct         = $2,
              skills_touched        = $3::jsonb,
              overall_mastery_shift = $4,
              frustration_level     = $5,
              engagement_level      = $6,
              signal_basis          = $7::jsonb,
              closed_out_at         = $8,
              updated_at            = now()
        WHERE session_id            = $9`,
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

    this.logger.log('session_summary_updated', {
      studentId,
      sessionId: sessionSummary.sessionId,
      overallMasteryShift: sessionSummary.overallMasteryShift,
      frustrationLevel: sessionSummary.frustrationLevel,
      engagementLevel: sessionSummary.engagementLevel,
    });

    return { ok: true, action: 'updated' };
  }
}
