// Phase 4 — P4-042
// PlacementAnswerSubmitService.
//
// Scope: Placement Test answer submission only.
//
// Responsibility:
//   Persist a single student answer for a question within an active placement
//   attempt.  Enforces all validation rules from P4-012:
//     - The attempt must exist, belong to the student, and be 'active'.
//     - The question must belong to a section of the attempt's placement test.
//     - Duplicate answers (same question in same attempt) are rejected.
//     - answer_value format is validated against the question type.
//     - is_correct is NOT evaluated here — that happens during scoring (P4-043/046).
//     - skill_code is inherited from the parent question — clients cannot set it.
//
// Security rules:
//   - student_id is always sourced from the verified JWT — never from client input.
//   - Attempt ownership is enforced: student may only submit to their own active attempt.
//   - is_correct is never returned to students during an active attempt (P4-012 §4).
//   - skill_code is never set by the client — inherited from placement_questions.
//   - Backend is the sole authority for answer evaluation, correctness, and scoring.
//   - No scoring, level assignment, or skill map computation here (P4-046).
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import {
  PlacementAnswerRow,
  PlacementAttemptRow,
  SubmitPlacementAnswerRequest,
  SubmitPlacementAnswerResponse,
} from './placement.types';
import { PlacementAuditService } from './placement-audit.service';

/** Allowed answer_value formats per question type (P4-012 §2.3). */
const VALID_OPTION_LETTERS = new Set(['A', 'B', 'C', 'D']);
const VALID_TRUE_FALSE_VALUES = new Set(['true', 'false']);

@Injectable()
export class PlacementAnswerSubmitService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: PlacementAuditService,
  ) {}

  /**
   * Submit a single answer to a question within an active placement attempt.
   *
   * Steps:
   *   1. Resolve and validate the active attempt (ownership + status).
   *   2. Verify the question belongs to the attempt's placement test.
   *   3. Reject duplicate answers for the same question in this attempt.
   *   4. Validate answer_value format against question type.
   *   5. Inherit skill_code from the parent question.
   *   6. Insert the answer row — is_correct is NULL (evaluated after submission).
   *   7. Return student-safe fields only (P4-012 §4).
   *
   * @param attemptId  UUID of the target placement_attempt (from URL path).
   * @param studentId  Internal student ID — always from the verified JWT.
   * @param input      Student-supplied placement_question_id and answer_value.
   */
  async submitAnswer(
    attemptId: string,
    studentId: string,
    input: SubmitPlacementAnswerRequest,
  ): Promise<SubmitPlacementAnswerResponse> {
    // -----------------------------------------------------------------------
    // 1. Resolve and validate the active attempt.
    //    Ownership is enforced by requiring student_id = $2 in the query.
    // -----------------------------------------------------------------------
    const attemptResult = await this.db.query<PlacementAttemptRow>(
      `SELECT id, student_id, placement_test_id, status
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

    if (attempt.status !== 'active') {
      throw new AppError({
        code: 'ATTEMPT_NOT_ACTIVE',
        message: `Placement attempt is not active (status: ${attempt.status}). Answers can only be submitted to active attempts.`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    // -----------------------------------------------------------------------
    // 2. Verify the question belongs to this placement test.
    //    JOIN through placement_sections to confirm the question is part of
    //    the attempt's test. Also fetch question_type for answer validation
    //    and skill_code via the primary skill link.
    // -----------------------------------------------------------------------
    const questionResult = await this.db.query<{
      id: string;
      question_type: string;
      skill_code: string | null;
    }>(
      `SELECT pq.id, pq.question_type, ps.skill_code
       FROM placement_questions pq
       JOIN placement_sections ps ON ps.id = pq.placement_section_id
       WHERE pq.id = $1
         AND ps.placement_test_id = $2
       LIMIT 1`,
      [input.placement_question_id, attempt.placement_test_id],
    );

    if ((questionResult.rowCount ?? 0) === 0) {
      throw new AppError({
        code: 'QUESTION_NOT_FOUND',
        message:
          'Question not found in this placement test.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const question = questionResult.rows[0];

    // -----------------------------------------------------------------------
    // 3. Reject duplicate answers (one answer per question per attempt).
    //    The DB partial unique index (placement_answers_attempt_question_unique_idx)
    //    also enforces this — this service-layer check provides a clean error.
    // -----------------------------------------------------------------------
    const duplicateResult = await this.db.query<{ id: string }>(
      `SELECT id FROM placement_answers
       WHERE placement_attempt_id = $1
         AND placement_question_id = $2
       LIMIT 1`,
      [attemptId, input.placement_question_id],
    );

    if ((duplicateResult.rowCount ?? 0) > 0) {
      throw new AppError({
        code: 'DUPLICATE_ANSWER',
        message: 'An answer for this question has already been submitted in this attempt.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    // -----------------------------------------------------------------------
    // 4. Validate answer_value format against the question type (P4-012 §2.3).
    // -----------------------------------------------------------------------
    this.validateAnswerValue(input.answer_value, question.question_type);

    // -----------------------------------------------------------------------
    // 5. Inherit skill_code from the primary skill link on the question.
    //    If no primary skill is set (edge case — should be enforced at
    //    question activation), we record an empty string so the column
    //    NOT NULL constraint is satisfied and the scoring service can flag it.
    // -----------------------------------------------------------------------
    const skillCode = question.skill_code ?? '';

    // -----------------------------------------------------------------------
    // 6. Insert the answer row.
    //    is_correct is NULL — evaluated by backend only after attempt submission.
    //    skill_code is inherited from the question — never set by the client.
    // -----------------------------------------------------------------------
    const insertResult = await this.db.query<PlacementAnswerRow>(
      `INSERT INTO placement_answers
         (placement_attempt_id, placement_question_id, answer_value, is_correct, skill_code)
       VALUES ($1, $2, $3, NULL, $4)
       RETURNING id, placement_attempt_id, placement_question_id,
                 answer_value, is_correct, skill_code, created_at`,
      [attemptId, input.placement_question_id, input.answer_value, skillCode],
    );

    const answer = insertResult.rows[0];

    void this.audit.logAnswerSubmitted(
      studentId,
      attemptId,
      answer.placement_question_id,
      question.question_type,
      answer.answer_value,
    );

    // -----------------------------------------------------------------------
    // 7. Return student-safe fields only (P4-012 §4).
    //    is_correct is intentionally excluded — must not be revealed during
    //    an active attempt.
    //    skill_code is intentionally excluded — internal field.
    // -----------------------------------------------------------------------
    return {
      id: answer.id,
      placement_attempt_id: answer.placement_attempt_id,
      placement_question_id: answer.placement_question_id,
      answer_value: answer.answer_value,
      created_at: answer.created_at,
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Validate the student's answer_value against the expected format for
   * the given question type (P4-012 §2.3).
   *
   * Does NOT evaluate correctness — that is backend-only (P4-046).
   */
  private validateAnswerValue(answerValue: string, questionType: string): void {
    const trimmed = answerValue.trim();

    if (trimmed.length === 0) {
      throw new AppError({
        code: 'INVALID_ANSWER_VALUE',
        message: 'answer_value must be a non-empty string.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    switch (questionType) {
      case 'multiple_choice':
      case 'listening_choice':
        // Must be exactly one of: A, B, C, D
        if (!VALID_OPTION_LETTERS.has(trimmed.toUpperCase())) {
          throw new AppError({
            code: 'INVALID_ANSWER_VALUE',
            message: `answer_value for ${questionType} must be one of: A, B, C, D. Received: "${trimmed}".`,
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }
        break;

      case 'true_false':
        // Must be exactly "true" or "false" (lowercase)
        if (!VALID_TRUE_FALSE_VALUES.has(trimmed.toLowerCase())) {
          throw new AppError({
            code: 'INVALID_ANSWER_VALUE',
            message: `answer_value for true_false must be "true" or "false". Received: "${trimmed}".`,
            statusCode: HttpStatus.BAD_REQUEST,
          });
        }
        break;

      case 'fill_blank':
        // Any non-empty string is valid — no format restriction beyond length.
        break;

      default:
        throw new AppError({
          code: 'INVALID_ANSWER_VALUE',
          message: `Unknown question type: "${questionType}". Cannot validate answer_value.`,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        });
    }
  }
}
