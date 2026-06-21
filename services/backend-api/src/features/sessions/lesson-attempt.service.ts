// Phase 5 — P5-054
// LessonAttemptService.
//
// Scope: Raw attempt and answer persistence for AIM Engine Integration only.
//
// Responsibility:
//   Record a lesson attempt (lesson_attempts, P5-032) and its corresponding
//   answer (answers, P5-033) atomically within a single DB transaction.
//   Both rows are written together so the AIM pipeline's state assembly
//   service always finds a consistent (attempt, answer) pair when building
//   AimAttemptInput (P5-010) for POST /aim/v1/analysis.
//
//   This service also backend-counts attempt_number_for_item from existing
//   attempt history for the (session, item) pair — never trusting a
//   client-supplied counter.
//
//   Backend-authority rules enforced here:
//   - studentId is always sourced from the verified JWT by the caller —
//     never accepted as a raw client payload field by this service.
//   - isCorrect is always the backend-evaluated value — never a client value.
//   - skillIds are always backend-resolved curriculum keys — never a raw
//     client-supplied list.
//   - attemptNumberForItem is backend-counted by querying existing attempts
//     for the (learningSessionId, itemId) pair before insert — never a
//     client counter.
//   - responseTimeMs is backend-computed (submittedAt - startedAt) —
//     never a client-pre-aggregated behavioral score.
//   - Session ownership and active status are verified before any write;
//     a non-existent, foreign, or inactive session all surface as NOT_FOUND
//     to avoid leaking session existence to a non-owner.
//   - No AIM Engine call is made here; features/sessions never talks to the
//     AIM Engine. Only features/aim does.
//   - No mastery, level, weakness, difficulty, recommendation, review schedule,
//     retention, or frustration is computed or stored here.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  AnswerRow,
  AttemptCountRow,
  LessonAttemptRow,
  RecordLessonAttemptInput,
  RecordLessonAttemptResponse,
  SessionOwnershipRow,
} from './lesson-attempt.types';

const VALID_ITEM_TYPES = new Set([
  'lesson_question',
  'practice_question',
  'review_question',
  'drill_question',
]);

const VALID_ANSWER_FORMATS = new Set([
  'multiple_choice',
  'true_false',
  'fill_blank',
  'listening_choice',
  'free_text',
]);

const OPTION_BASED_FORMATS = new Set([
  'multiple_choice',
  'true_false',
  'listening_choice',
]);

@Injectable()
export class LessonAttemptService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Record a lesson attempt and its answer atomically.
   *
   * Steps:
   *   1. Validate input fields (item type, answer format, difficulty,
   *      options count / format consistency, answer value non-empty,
   *      temporal ordering).
   *   2. Verify session exists, belongs to studentId, and is active.
   *   3. Count existing attempts for (session, item) to get attempt number.
   *   4. Compute responseTimeMs from submittedAt - startedAt.
   *   5. Insert lesson_attempts row and answers row in a single transaction.
   *   6. Return safe response shape.
   */
  async recordAttempt(
    input: RecordLessonAttemptInput,
  ): Promise<RecordLessonAttemptResponse> {
    // -----------------------------------------------------------------------
    // Step 1: input validation
    // -----------------------------------------------------------------------
    if (!VALID_ITEM_TYPES.has(input.itemType)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `Invalid itemType: ${input.itemType}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (!VALID_ANSWER_FORMATS.has(input.answerFormat)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `Invalid answerFormat: ${input.answerFormat}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (
      input.presentedDifficulty < 1 ||
      input.presentedDifficulty > 4 ||
      !Number.isInteger(input.presentedDifficulty)
    ) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `presentedDifficulty must be 1, 2, 3, or 4. Got: ${input.presentedDifficulty}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (!input.answerValue || input.answerValue.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'answerValue must be non-empty.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Format-consistency: options_presented_count required for option-based
    // formats, must be null for text-based formats.
    if (OPTION_BASED_FORMATS.has(input.answerFormat)) {
      if (
        input.optionsPresentedCount === null ||
        input.optionsPresentedCount === undefined
      ) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: `optionsPresentedCount is required for answerFormat '${input.answerFormat}'.`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      if (input.optionsPresentedCount < 0) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'optionsPresentedCount must be non-negative.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    } else {
      if (
        input.optionsPresentedCount !== null &&
        input.optionsPresentedCount !== undefined
      ) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: `optionsPresentedCount must be null for answerFormat '${input.answerFormat}'.`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    const startedAt = new Date(input.startedAt);
    const submittedAt = new Date(input.submittedAt);

    if (isNaN(startedAt.getTime()) || isNaN(submittedAt.getTime())) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'startedAt and submittedAt must be valid ISO-8601 timestamps.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (startedAt > submittedAt) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'startedAt must be <= submittedAt.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (
      input.hesitationBeforeSubmitMs !== null &&
      input.hesitationBeforeSubmitMs !== undefined &&
      input.hesitationBeforeSubmitMs < 0
    ) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'hesitationBeforeSubmitMs must be non-negative.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // -----------------------------------------------------------------------
    // Step 2: verify session ownership and active status
    // -----------------------------------------------------------------------
    await this.verifyActiveSessionOwnership(
      input.learningSessionId,
      input.studentId,
    );

    // -----------------------------------------------------------------------
    // Step 3: backend-count attempt number for this (session, item) pair
    // -----------------------------------------------------------------------
    const countResult = await this.db.query<AttemptCountRow>(
      `SELECT COUNT(*)::text AS count
         FROM lesson_attempts
        WHERE learning_session_id = $1
          AND item_id = $2`,
      [input.learningSessionId, input.itemId],
    );
    const attemptNumberForItem =
      parseInt(countResult.rows[0].count, 10) + 1;

    // -----------------------------------------------------------------------
    // Step 4: compute responseTimeMs (backend-computed, never client-supplied)
    // -----------------------------------------------------------------------
    const responseTimeMs = submittedAt.getTime() - startedAt.getTime();

    // -----------------------------------------------------------------------
    // Step 5: insert lesson_attempts + answers atomically
    // -----------------------------------------------------------------------
    const answerChangeCount = input.answerChangeCount ?? 0;
    const hesitationBeforeSubmitMs = input.hesitationBeforeSubmitMs ?? null;
    const usedHint = input.usedHint ?? false;
    const abandonedFirstThenRetried = input.abandonedFirstThenRetried ?? false;
    const optionsPresentedCount = input.optionsPresentedCount ?? null;

    await this.db.query('BEGIN', []);

    let attemptRow: LessonAttemptRow;
    let answerRow: AnswerRow;

    try {
      const attemptResult = await this.db.query<LessonAttemptRow>(
        `INSERT INTO lesson_attempts (
           learning_session_id, student_id,
           item_id, item_type, skill_ids,
           presented_difficulty,
           answer_format, answer_value, options_presented_count,
           is_correct, attempt_number_for_item,
           started_at, submitted_at, response_time_ms,
           answer_change_count, hesitation_before_submit_ms,
           used_hint, abandoned_first_then_retried,
           created_at
         )
         VALUES (
           $1, $2,
           $3, $4, $5::jsonb,
           $6,
           $7, $8, $9,
           $10, $11,
           $12, $13, $14,
           $15, $16,
           $17, $18,
           now()
         )
         RETURNING id, learning_session_id, student_id,
                   item_id, item_type, skill_ids,
                   presented_difficulty,
                   answer_format, answer_value, options_presented_count,
                   is_correct, attempt_number_for_item,
                   started_at, submitted_at, response_time_ms,
                   answer_change_count, hesitation_before_submit_ms,
                   used_hint, abandoned_first_then_retried,
                   created_at`,
        [
          input.learningSessionId,
          input.studentId,
          input.itemId,
          input.itemType,
          JSON.stringify(input.skillIds),
          input.presentedDifficulty,
          input.answerFormat,
          input.answerValue,
          optionsPresentedCount,
          input.isCorrect,
          attemptNumberForItem,
          input.startedAt,
          input.submittedAt,
          responseTimeMs,
          answerChangeCount,
          hesitationBeforeSubmitMs,
          usedHint,
          abandonedFirstThenRetried,
        ],
      );

      attemptRow = attemptResult.rows[0];

      const answerResult = await this.db.query<AnswerRow>(
        `INSERT INTO answers (
           lesson_attempt_id, student_id, item_id,
           answer_format, answer_value, options_presented_count,
           is_correct, submitted_at,
           created_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
         RETURNING id, lesson_attempt_id, student_id, item_id,
                   answer_format, answer_value, options_presented_count,
                   is_correct, submitted_at, created_at`,
        [
          attemptRow.id,
          input.studentId,
          input.itemId,
          input.answerFormat,
          input.answerValue,
          optionsPresentedCount,
          input.isCorrect,
          input.submittedAt,
        ],
      );

      answerRow = answerResult.rows[0];

      await this.db.query('COMMIT', []);
    } catch (err) {
      await this.db.query('ROLLBACK', []);
      throw err;
    }

    // -----------------------------------------------------------------------
    // Step 6: return safe response shape
    // -----------------------------------------------------------------------
    return {
      attemptId: attemptRow.id,
      answerId: answerRow.id,
      attemptNumberForItem: attemptRow.attempt_number_for_item,
      isCorrect: attemptRow.is_correct,
      submittedAt: attemptRow.submitted_at,
    };
  }

  /**
   * Verify the session exists, belongs to studentId, and is active.
   * Missing, foreign, or inactive sessions all surface as NOT_FOUND to
   * avoid leaking session existence to a non-owner.
   */
  private async verifyActiveSessionOwnership(
    learningSessionId: string,
    studentId: string,
  ): Promise<void> {
    const result = await this.db.query<SessionOwnershipRow>(
      `SELECT id FROM learning_sessions
        WHERE id = $1 AND student_id = $2 AND status = 'active'`,
      [learningSessionId, studentId],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'No active learning session found for this student.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }
}
