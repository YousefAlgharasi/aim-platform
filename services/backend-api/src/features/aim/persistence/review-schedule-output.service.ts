// Phase 5 — P5-061
// ReviewScheduleOutputService.
//
// Scope: Persist AIM Engine review schedule outputs to the review_schedules
//        table (P5-039). Implements the update rules defined in P5-016.
//
// Responsibility:
//   Receives a validated AimValidatedReviewSchedule[] array from the
//   pipeline orchestrator (P5-056) and applies the following update rules
//   per P5-016 §Update Rules:
//
//     1. For each entry, look up the existing row by id = scheduleId.
//     2. If no row exists → INSERT with status computed from dueAt vs now().
//     3. If a row exists and repetitionCount > stored → overwrite row in
//        place (new spaced-repetition cycle); recompute status.
//     4. If a row exists and repetitionCount == stored but dueAt differs →
//        reschedule: update dueAt, intervalDays, scheduledAt; recompute
//        status (rescheduled is an audit signal only, not a persisted state).
//     5. If a row exists and repetitionCount < stored → contract violation;
//        skip entry and log warning.
//     6. If a response omits reviewSchedule entirely (null/empty), leave
//        existing rows unchanged.
//
// Status computation (backend-only, never wire-sourced):
//   - status = 'due'     when dueAt <= now()
//   - status = 'pending' when dueAt >  now()
//
// Backend authority rules enforced here:
//   - studentId is always sourced from the pipeline context (JWT-resolved).
//   - dueAt, intervalDays, repetitionCount, basedOnAttemptId, scheduledAt
//     come exclusively from the validated AIM Engine response.
//   - status is exclusively backend-computed; never accepted from the wire.
//   - The Backend never computes dueAt, intervalDays, or repetitionCount.
//   - No AIM Engine call is made here.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AimValidatedReviewSchedule } from '../adapter/aim-response-mapper.types';

// ---------------------------------------------------------------------------
// Internal row shape
// ---------------------------------------------------------------------------

interface ReviewScheduleCurrentRow {
  readonly repetition_count: number;
  readonly due_at: string;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type ReviewScheduleEntryAction =
  | 'inserted'
  | 'updated_new_cycle'
  | 'updated_rescheduled'
  | 'skipped_repetition_regression'
  | 'skipped_no_change'
  | 'skipped_empty_id'
  | 'skipped_empty_skill_id';

export interface ReviewScheduleOutputPersistResult {
  readonly processedCount: number;
  readonly skippedNullOrEmpty: boolean;
  readonly actions: ReviewScheduleEntryAction[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class ReviewScheduleOutputService {
  private readonly logger = new Logger(ReviewScheduleOutputService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist a validated review schedule set from the AIM Engine.
   *
   * Each entry is upserted per P5-016 update rules. The status column
   * is always backend-computed from dueAt vs now() — never wire-sourced.
   *
   * If schedules is null, undefined, or empty, existing rows are left
   * unchanged (P5-016 §Update Rules §6).
   *
   * studentId must be JWT-resolved by the pipeline orchestrator.
   */
  async upsertMany(
    studentId: string,
    schedules: AimValidatedReviewSchedule[] | null | undefined,
  ): Promise<ReviewScheduleOutputPersistResult> {
    if (!schedules || schedules.length === 0) {
      this.logger.debug('review_schedule_output_skipped_null_or_empty', { studentId });
      return { processedCount: 0, skippedNullOrEmpty: true, actions: [] };
    }

    const actions: ReviewScheduleEntryAction[] = [];

    for (const schedule of schedules) {
      const action = await this.upsertOne(studentId, schedule);
      actions.push(action);
    }

    const processedCount = actions.filter(
      a => a === 'inserted' || a === 'updated_new_cycle' || a === 'updated_rescheduled',
    ).length;

    this.logger.log('review_schedule_output_persisted', {
      studentId,
      processedCount,
      total: schedules.length,
    });

    return { processedCount, skippedNullOrEmpty: false, actions };
  }

  // -------------------------------------------------------------------------
  // Private: upsert a single schedule entry
  // -------------------------------------------------------------------------

  private async upsertOne(
    studentId: string,
    schedule: AimValidatedReviewSchedule,
  ): Promise<ReviewScheduleEntryAction> {
    // Defensive guards
    if (!schedule.scheduleId || schedule.scheduleId.trim().length === 0) {
      this.logger.warn('review_schedule_skipped_empty_schedule_id', { studentId });
      return 'skipped_empty_id';
    }

    if (!schedule.skillId || schedule.skillId.trim().length === 0) {
      this.logger.warn('review_schedule_skipped_empty_skill_id', {
        studentId,
        scheduleId: schedule.scheduleId,
      });
      return 'skipped_empty_skill_id';
    }

    // Look up existing row
    const existing = await this.db.query<ReviewScheduleCurrentRow>(
      `SELECT repetition_count, due_at
         FROM review_schedules
        WHERE id = $1
        LIMIT 1`,
      [schedule.scheduleId],
    );

    const rowExists = (existing.rowCount ?? 0) > 0;

    // Backend-compute status from dueAt
    const computedStatus = this.computeStatus(schedule.dueAt);

    if (!rowExists) {
      // Rule 2: INSERT new row
      await this.db.query(
        `INSERT INTO review_schedules (
           id, student_id, skill_id,
           due_at, interval_days, repetition_count,
           based_on_attempt_id, scheduled_at,
           status,
           created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())`,
        [
          schedule.scheduleId,
          studentId,
          schedule.skillId,
          schedule.dueAt,
          schedule.intervalDays,
          schedule.repetitionCount,
          schedule.basedOnAttemptId,
          schedule.scheduledAt,
          computedStatus,
        ],
      );

      this.logger.log('review_schedule_inserted', {
        studentId,
        scheduleId: schedule.scheduleId,
        skillId: schedule.skillId,
        status: computedStatus,
      });

      return 'inserted';
    }

    const storedRepetitionCount = existing.rows[0].repetition_count;
    const storedDueAt = existing.rows[0].due_at;

    // Rule 5: repetition regression → contract violation, skip
    if (schedule.repetitionCount < storedRepetitionCount) {
      this.logger.warn('review_schedule_skipped_repetition_regression', {
        studentId,
        scheduleId: schedule.scheduleId,
        incomingRepetitionCount: schedule.repetitionCount,
        storedRepetitionCount,
      });
      return 'skipped_repetition_regression';
    }

    if (schedule.repetitionCount > storedRepetitionCount) {
      // Rule 3: new spaced-repetition cycle → overwrite in place
      await this.db.query(
        `UPDATE review_schedules
            SET due_at              = $1,
                interval_days       = $2,
                repetition_count    = $3,
                based_on_attempt_id = $4,
                scheduled_at        = $5,
                status              = $6,
                updated_at          = now()
          WHERE id = $7`,
        [
          schedule.dueAt,
          schedule.intervalDays,
          schedule.repetitionCount,
          schedule.basedOnAttemptId,
          schedule.scheduledAt,
          computedStatus,
          schedule.scheduleId,
        ],
      );

      this.logger.log('review_schedule_updated_new_cycle', {
        studentId,
        scheduleId: schedule.scheduleId,
        newRepetitionCount: schedule.repetitionCount,
        status: computedStatus,
      });

      return 'updated_new_cycle';
    }

    // repetitionCount == stored
    if (schedule.dueAt !== storedDueAt) {
      // Rule 4: reschedule — dueAt changed, same cycle
      await this.db.query(
        `UPDATE review_schedules
            SET due_at              = $1,
                interval_days       = $2,
                scheduled_at        = $3,
                status              = $4,
                updated_at          = now()
          WHERE id = $5`,
        [
          schedule.dueAt,
          schedule.intervalDays,
          schedule.scheduledAt,
          computedStatus,
          schedule.scheduleId,
        ],
      );

      this.logger.log('review_schedule_updated_rescheduled', {
        studentId,
        scheduleId: schedule.scheduleId,
        newDueAt: schedule.dueAt,
        status: computedStatus,
      });

      return 'updated_rescheduled';
    }

    // Same repetitionCount and same dueAt — no meaningful change
    this.logger.debug('review_schedule_skipped_no_change', {
      studentId,
      scheduleId: schedule.scheduleId,
    });

    return 'skipped_no_change';
  }

  // -------------------------------------------------------------------------
  // Private: compute status from dueAt (backend-only, never wire-sourced)
  // -------------------------------------------------------------------------

  private computeStatus(dueAt: string): 'pending' | 'due' {
    return new Date(dueAt) <= new Date() ? 'due' : 'pending';
  }
}
