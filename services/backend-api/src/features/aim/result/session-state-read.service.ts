// Phase 5 — P5-068
// SessionStateReadService.
//
// Scope: Read-only backend service exposing the persisted, backend-validated
//        AIM session summary from session_summaries (P5-040/P5-063) — the
//        "current AIM state" for a given learning session.
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller layer).
//     Clients cannot supply a studentId to override ownership.
//   - The query is scoped by BOTH session_id and student_id, so a session
//     belonging to another student returns null rather than leaking data.
//   - Read-only. No AIM-owned value may be written through this path.
//   - This service never proxies a live AIM Engine call; it returns only
//     the last-validated-persisted summary.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Response types (safe, client-facing subset of session_summaries)
// ---------------------------------------------------------------------------

export interface SessionStateBehavioralSignal {
  readonly frustrationLevel: string;
  readonly engagementLevel: string;
  readonly signalBasis: string[];
}

export interface SessionStateReadResponse {
  readonly studentId: string;
  readonly sessionId: string;
  readonly found: boolean;
  readonly itemsAttempted: number | null;
  readonly itemsCorrect: number | null;
  readonly skillsTouched: string[] | null;
  readonly overallMasteryShift: string | null;
  readonly behavioralSignal: SessionStateBehavioralSignal | null;
  readonly closedOutAt: string | null;
  readonly updatedAt: string | null;
}

export interface RecentSessionSummaryItem {
  readonly sessionId: string;
  readonly itemsAttempted: number;
  readonly itemsCorrect: number;
  readonly skillsTouched: string[];
  readonly overallMasteryShift: string;
  readonly closedOutAt: string | null;
  readonly updatedAt: string;
}

export interface RecentSessionsReadResponse {
  readonly studentId: string;
  readonly sessions: RecentSessionSummaryItem[];
}

// ---------------------------------------------------------------------------
// Internal DB row shape
// ---------------------------------------------------------------------------

interface SessionSummaryRow {
  readonly items_attempted: number;
  readonly items_correct: number;
  readonly skills_touched: string[];
  readonly overall_mastery_shift: string;
  readonly frustration_level: string;
  readonly engagement_level: string;
  readonly signal_basis: string[];
  readonly closed_out_at: string;
  readonly updated_at: string;
}

interface RecentSessionSummaryRow {
  readonly session_id: string;
  readonly items_attempted: number;
  readonly items_correct: number;
  readonly skills_touched: string[];
  readonly overall_mastery_shift: string;
  readonly closed_out_at: string | null;
  readonly updated_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class SessionStateReadService {
  private readonly logger = new Logger(SessionStateReadService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Return the persisted AIM session summary for a session, scoped to the
   * owning student.
   *
   * Returns found: false (with all data fields null) when no summary has
   * been persisted yet for this session, OR when the session does not
   * belong to studentId — these two cases are deliberately indistinguishable
   * to the caller to avoid leaking session existence across students.
   *
   * No AIM Engine call is made. studentId must be JWT-resolved by the
   * controller — never accepted from a client payload.
   */
  async getSessionState(
    studentId: string,
    sessionId: string,
  ): Promise<SessionStateReadResponse> {
    const result = await this.db.query<SessionSummaryRow>(
      `SELECT
         items_attempted,
         items_correct,
         skills_touched,
         overall_mastery_shift,
         frustration_level,
         engagement_level,
         signal_basis,
         closed_out_at,
         updated_at
       FROM session_summaries
       WHERE session_id = $1 AND student_id = $2
       LIMIT 1`,
      [sessionId, studentId],
    );

    this.logger.debug('session_state_read', {
      studentId,
      sessionId,
      found: (result.rowCount ?? 0) > 0,
    });

    if ((result.rowCount ?? 0) === 0) {
      return {
        studentId,
        sessionId,
        found: false,
        itemsAttempted: null,
        itemsCorrect: null,
        skillsTouched: null,
        overallMasteryShift: null,
        behavioralSignal: null,
        closedOutAt: null,
        updatedAt: null,
      };
    }

    const row = result.rows[0];

    return {
      studentId,
      sessionId,
      found: true,
      itemsAttempted: row.items_attempted,
      itemsCorrect: row.items_correct,
      skillsTouched: row.skills_touched,
      overallMasteryShift: row.overall_mastery_shift,
      behavioralSignal: {
        frustrationLevel: row.frustration_level,
        engagementLevel: row.engagement_level,
        signalBasis: row.signal_basis,
      },
      closedOutAt: row.closed_out_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Return the student's most recently updated persisted session summaries,
   * scoped to studentId. Used to surface "recent learning activity" without
   * requiring a caller-known sessionId. No AIM Engine call is made and no
   * value here is computed — every field is a direct column pass-through.
   */
  async getRecentSessionsForStudent(
    studentId: string,
    limit = 10,
  ): Promise<RecentSessionsReadResponse> {
    const result = await this.db.query<RecentSessionSummaryRow>(
      `SELECT
         session_id,
         items_attempted,
         items_correct,
         skills_touched,
         overall_mastery_shift,
         closed_out_at,
         updated_at
       FROM session_summaries
       WHERE student_id = $1
       ORDER BY updated_at DESC
       LIMIT $2`,
      [studentId, limit],
    );

    this.logger.debug('recent_sessions_read', {
      studentId,
      count: result.rowCount ?? 0,
    });

    return {
      studentId,
      sessions: result.rows.map((row) => ({
        sessionId: row.session_id,
        itemsAttempted: row.items_attempted,
        itemsCorrect: row.items_correct,
        skillsTouched: row.skills_touched,
        overallMasteryShift: row.overall_mastery_shift,
        closedOutAt: row.closed_out_at,
        updatedAt: row.updated_at,
      })),
    };
  }
}
