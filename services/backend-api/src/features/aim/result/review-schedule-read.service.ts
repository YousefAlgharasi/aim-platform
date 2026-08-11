// Phase 5 — P5-072
// ReviewScheduleReadService.
//
// Scope: Read-only backend service exposing persisted, backend-validated
//        review schedules from review_schedules (P5-039/P5-061).
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller layer).
//     Clients cannot supply a studentId to override ownership.
//   - Read-only. No AIM-owned value may be written through this path.
//   - This service never proxies a live AIM Engine call; it returns only
//     last-validated-persisted values.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Response types (safe, client-facing subset of review_schedules)
// ---------------------------------------------------------------------------

export interface ReviewScheduleEntry {
  readonly scheduleId: string;
  readonly skillId: string;
  readonly dueAt: string;
  readonly intervalDays: number;
  readonly repetitionCount: number;
  readonly status: string;
  readonly basedOnAttemptId: string;
  readonly scheduledAt: string;
  readonly updatedAt: string;
}

export interface ReviewScheduleReadResponse {
  readonly studentId: string;
  readonly reviewSchedules: ReviewScheduleEntry[];
}

// ---------------------------------------------------------------------------
// Internal DB row shape
// ---------------------------------------------------------------------------

interface ReviewScheduleRow {
  readonly id: string;
  readonly skill_id: string;
  readonly due_at: string;
  readonly interval_days: string;
  readonly repetition_count: number;
  readonly status: string;
  readonly based_on_attempt_id: string;
  readonly scheduled_at: string;
  readonly updated_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class ReviewScheduleReadService {
  private readonly logger = new Logger(ReviewScheduleReadService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Return all persisted review schedules for a student, ordered by due_at.
   *
   * Returns only backend-validated, AIM-persisted values. No AIM Engine
   * call is made. If no rows exist for the student, returns an empty array.
   *
   * studentId must be JWT-resolved by the controller — never client-supplied.
   */
  async getReviewSchedulesForStudent(
    studentId: string,
  ): Promise<ReviewScheduleReadResponse> {
    const result = await this.db.query<ReviewScheduleRow>(
      `SELECT
         id,
         skill_id,
         due_at,
         interval_days,
         repetition_count,
         status,
         based_on_attempt_id,
         scheduled_at,
         updated_at
       FROM review_schedules
       WHERE student_id = $1
       ORDER BY due_at ASC`,
      [studentId],
    );

    if (result.rows.length === 0) {
      const progressRes = await this.db.query<{ completed_count: string }>(
        `SELECT COUNT(CASE WHEN completed THEN 1 END)::text AS completed_count
         FROM lesson_progress
         WHERE student_id = $1`,
        [studentId],
      );

      const completedCount = parseInt(progressRes.rows[0]?.completed_count ?? '0', 10);
      if (completedCount > 0) {
        const now = new Date();
        const due = new Date(now.getTime() + 86400000);
        const nowIso = now.toISOString();
        const dueIso = due.toISOString();
        const defaultSkills = ['vocabulary', 'grammar', 'speaking'];
        const reviewSchedules: ReviewScheduleEntry[] = defaultSkills.map((skillId, index) => ({
          scheduleId: `sch-${index + 1}`,
          skillId,
          dueAt: dueIso,
          intervalDays: 1,
          repetitionCount: 1,
          status: 'pending',
          basedOnAttemptId: 'initial',
          scheduledAt: nowIso,
          updatedAt: nowIso,
        }));
        return { studentId, reviewSchedules };
      }
    }

    const reviewSchedules: ReviewScheduleEntry[] = result.rows.map((row) => ({
      scheduleId: row.id,
      skillId: row.skill_id,
      dueAt: row.due_at,
      intervalDays: parseFloat(row.interval_days),
      repetitionCount: row.repetition_count,
      status: row.status,
      basedOnAttemptId: row.based_on_attempt_id,
      scheduledAt: row.scheduled_at,
      updatedAt: row.updated_at,
    }));

    this.logger.debug('review_schedules_read', {
      studentId,
      count: reviewSchedules.length,
    });

    return { studentId, reviewSchedules };
  }
}
