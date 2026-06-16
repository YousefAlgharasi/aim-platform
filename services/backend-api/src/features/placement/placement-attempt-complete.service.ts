// Phase 4 — P4-043
// PlacementAttemptCompleteService.
//
// Scope: Placement Test attempt completion lifecycle only.
//
// Responsibility:
//   Accept the student's signal that they have finished answering questions,
//   transition the attempt from 'active' to 'submitted', and return a
//   student-safe response confirming the submission.
//
//   The actual scoring and result generation (estimated_level, skill_mastery_map,
//   weakness_map) is NOT performed here — that belongs to P4-046
//   (PlacementResultService) which is invoked after scoring data is ready.
//   This service is intentionally decoupled from scoring to keep concerns separate
//   and to enforce the rule that Flutter never observes intermediate scoring state.
//
// Status transition:
//   active → submitted  (this service)
//   submitted → completed  (P4-046: PlacementResultService, after scoring)
//
// Security rules:
//   - student_id is always sourced from the verified JWT — never from client input.
//   - Attempt ownership is enforced: the attempt must belong to the requesting student.
//   - Backend is the sole authority for all status transitions and timestamps.
//   - Flutter cannot directly set status, submitted_at, or completed_at.
//   - No scoring, level assignment, skill map, or weakness map computation here.
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import {
  PlacementAttemptRow,
  PlacementAttemptCompleteResponse,
} from './placement.types';

@Injectable()
export class PlacementAttemptCompleteService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Complete (submit) an active placement attempt.
   *
   * Steps:
   *   1. Resolve the attempt and enforce ownership (student_id from JWT).
   *   2. Validate the attempt is in 'active' status.
   *   3. Count total questions in the test and total answers submitted.
   *   4. Transition status to 'submitted' and set submitted_at = now().
   *   5. Return student-safe response (P4-013 §3.2).
   *
   * Scoring and result generation (estimated_level, skill maps) is handled
   * by P4-046 (PlacementResultService) — NOT here.
   *
   * @param attemptId  UUID of the target placement_attempt (from URL path).
   * @param studentId  Internal student ID — always from the verified JWT.
   */
  async completeAttempt(
    attemptId: string,
    studentId: string,
  ): Promise<PlacementAttemptCompleteResponse> {
    // -----------------------------------------------------------------------
    // 1. Resolve and validate the attempt.
    //    Ownership enforced by requiring student_id = $2 in the query.
    // -----------------------------------------------------------------------
    const attemptResult = await this.db.query<PlacementAttemptRow>(
      `SELECT id, student_id, placement_test_id, status,
              started_at, submitted_at, completed_at
       FROM placement_attempts
       WHERE id = $1 AND student_id = $2
       LIMIT 1`,
      [attemptId, studentId],
    );

    if ((attemptResult.rowCount ?? 0) === 0) {
      throw new AppError({
        code: 'ATTEMPT_NOT_FOUND',
        message: 'Placement attempt not found or does not belong to you.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const attempt = attemptResult.rows[0];

    // -----------------------------------------------------------------------
    // 2. Validate status — only 'active' attempts may be submitted.
    // -----------------------------------------------------------------------
    if (attempt.status === 'submitted' || attempt.status === 'completed') {
      throw new AppError({
        code: 'ATTEMPT_ALREADY_SUBMITTED',
        message: `Placement attempt has already been submitted (status: ${attempt.status}).`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    if (attempt.status !== 'active') {
      throw new AppError({
        code: 'ATTEMPT_NOT_ACTIVE',
        message: `Placement attempt cannot be submitted (status: ${attempt.status}).`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    // -----------------------------------------------------------------------
    // 3. Count total questions in the placement test and total answers given.
    //    These are returned in the response for client progress display.
    //    Correctness is NOT computed here — that is backend-only (P4-046).
    // -----------------------------------------------------------------------
    const countsResult = await this.db.query<{
      total_questions: string;
      total_answered: string;
    }>(
      `SELECT
         (SELECT COUNT(*)
          FROM placement_questions pq
          JOIN placement_sections ps ON ps.id = pq.placement_section_id
          WHERE ps.placement_test_id = $1
         ) AS total_questions,
         (SELECT COUNT(*)
          FROM placement_answers pa
          WHERE pa.placement_attempt_id = $2
         ) AS total_answered`,
      [attempt.placement_test_id, attemptId],
    );

    const counts = countsResult.rows[0];
    const totalQuestions = parseInt(counts.total_questions, 10);
    const totalAnswered = parseInt(counts.total_answered, 10);

    // -----------------------------------------------------------------------
    // 4. Transition status: active → submitted.
    //    Backend sets submitted_at — Flutter cannot supply this timestamp.
    //    completed_at remains NULL until P4-046 finishes scoring.
    // -----------------------------------------------------------------------
    const updateResult = await this.db.query<PlacementAttemptRow>(
      `UPDATE placement_attempts
       SET status = 'submitted',
           submitted_at = now(),
           updated_at = now()
       WHERE id = $1
       RETURNING id, student_id, placement_test_id, status,
                 started_at, submitted_at, completed_at, created_at, updated_at`,
      [attemptId],
    );

    const updated = updateResult.rows[0];

    // -----------------------------------------------------------------------
    // 5. Return student-safe response (P4-013 §3.2).
    //    student_id and created_at are intentionally excluded.
    //    scoring, level, skill maps — never computed or returned here.
    // -----------------------------------------------------------------------
    return {
      id: updated.id,
      status: 'submitted',
      submittedAt: updated.submitted_at as string,
      totalQuestions,
      totalAnswered,
    };
  }
}
