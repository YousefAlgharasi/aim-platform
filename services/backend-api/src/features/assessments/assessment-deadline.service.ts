// P10-024: AssessmentDeadlineService.
//
// Scope: Centralize all deadline-status computation for the assessment feature.
//
// Responsibility:
//   - Resolves the effective deadline per student (per-student extension > global).
//   - Computes deadline status (upcoming/open/closed/missed/late/extended/expired)
//     from UTC timestamps — the backend is the sole authority for this value.
//   - Checks submission eligibility (is window open or within late window).
//   - Records deadline_events for all state transitions.
//
// Security rules:
//   - Status is ALWAYS computed here — never accepted from a client payload.
//   - Flutter receives the backend-derived status string and raw timestamps
//     for display only; it must never recompute status locally.
//   - late_window_seconds and late_penalty_percent are backend-only config;
//     they are not returned to Flutter in any deadline status response.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

// Inlined until P10-020 branch merges to main
export type DeadlineStatus =
  | 'upcoming' | 'open' | 'closed' | 'missed' | 'late' | 'extended' | 'expired';

export interface DeadlineRow {
  id: string;
  assessment_id: string;
  student_id: string | null;
  opens_at: Date;
  closes_at: Date;
  extended_closes_at: Date | null;
  late_window_seconds: number | null; // backend-only
  late_penalty_percent: number;       // backend-only
  is_active: boolean;
}

export interface DeadlineStatusResult {
  deadlineId: string;
  opensAt: Date;
  closesAt: Date;
  extendedClosesAt: Date | null;
  /** Backend-computed — Flutter displays as-is, never recomputes. */
  status: DeadlineStatus;
}

export interface SubmissionEligibility {
  eligible: boolean;
  isLate: boolean;
  /** Backend-only — never returned to Flutter. */
  latePenaltyPercent: number;
  reason?: string;
}

@Injectable()
export class AssessmentDeadlineService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Resolve the effective deadline for a student and compute its status.
   * Returns null when no deadline is configured for this assessment.
   */
  async getDeadlineStatus(
    assessmentId: string,
    studentId: string,
    now: Date = new Date(),
  ): Promise<DeadlineStatusResult | null> {
    const deadline = await this.resolveDeadline(assessmentId, studentId);
    if (!deadline) return null;

    const status = this.computeStatus(deadline, now);

    return {
      deadlineId: deadline.id,
      opensAt: deadline.opens_at,
      closesAt: deadline.closes_at,
      extendedClosesAt: deadline.extended_closes_at,
      status,
    };
  }

  /**
   * Check whether a submission is eligible at the given time.
   * Returns isLate and latePenaltyPercent (backend-only) for the grading service.
   * latePenaltyPercent must NEVER be returned to Flutter.
   */
  async checkSubmissionEligibility(
    assessmentId: string,
    studentId: string,
    now: Date = new Date(),
  ): Promise<SubmissionEligibility> {
    const deadline = await this.resolveDeadline(assessmentId, studentId);

    if (!deadline) {
      // No deadline configured — always eligible, no penalty.
      return { eligible: true, isLate: false, latePenaltyPercent: 0 };
    }

    const status = this.computeStatus(deadline, now);

    if (status === 'upcoming') {
      return { eligible: false, isLate: false, latePenaltyPercent: 0, reason: 'DEADLINE_NOT_OPEN' };
    }

    if (status === 'open' || status === 'extended') {
      return { eligible: true, isLate: false, latePenaltyPercent: 0 };
    }

    if (status === 'late') {
      return {
        eligible: true,
        isLate: true,
        latePenaltyPercent: deadline.late_penalty_percent, // grading service only
      };
    }

    return { eligible: false, isLate: false, latePenaltyPercent: 0, reason: 'DEADLINE_CLOSED' };
  }

  /**
   * Record a deadline event (opened, closed, extended, etc.).
   * Called by background jobs and the submission flow.
   */
  async recordEvent(
    deadlineId: string,
    eventType: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO deadline_events (deadline_id, event_type, occurred_at, metadata)
       VALUES ($1, $2, NOW(), $3)`,
      [deadlineId, eventType, JSON.stringify(metadata)],
    );
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private async resolveDeadline(
    assessmentId: string,
    studentId: string,
  ): Promise<DeadlineRow | null> {
    const res = await this.db.query<DeadlineRow>(
      `SELECT id, assessment_id, student_id, opens_at, closes_at,
              extended_closes_at, late_window_seconds, late_penalty_percent, is_active
       FROM assessment_deadlines
       WHERE assessment_id = $1 AND is_active = TRUE
         AND (student_id = $2 OR student_id IS NULL)
       ORDER BY student_id NULLS LAST LIMIT 1`,
      [assessmentId, studentId],
    );
    return res.rows[0] ?? null;
  }

  /**
   * Compute deadline status from UTC timestamps.
   * This is the ONLY place status is derived — never in Flutter.
   */
  computeStatus(deadline: DeadlineRow, now: Date): DeadlineStatus {
    const effectiveClose = deadline.extended_closes_at ?? deadline.closes_at;

    if (now < deadline.opens_at) return 'upcoming';

    if (deadline.extended_closes_at && now <= deadline.extended_closes_at) return 'extended';

    if (now <= deadline.closes_at) return 'open';

    // Past standard close — check late window
    if (deadline.late_window_seconds !== null) {
      const lateEnd = new Date(effectiveClose.getTime() + deadline.late_window_seconds * 1000);
      if (now <= lateEnd) return 'late';
      return 'expired';
    }

    return 'closed';
  }
}
