// Phase 4 — P4-044
// PlacementAnswerValidationService.
//
// Scope: Placement Test answer validation only.
//
// Responsibility:
//   After a placement attempt transitions to 'submitted' (P4-043), this service
//   evaluates the correctness of every submitted answer by comparing the
//   student's answer_value against the correct_answer stored on the question.
//
//   It updates `is_correct` on each placement_answers row for the attempt.
//   This is the ONLY place where is_correct is written — never during submission
//   and never by any client.
//
//   Validation is objective and deterministic:
//     - multiple_choice / listening_choice: case-insensitive letter match (A/B/C/D)
//     - true_false: case-insensitive string match ("true" / "false")
//     - fill_blank: normalised string match (trim + lower-case)
//
//   This service does NOT:
//     - Compute skill scores, estimated_level, or weakness maps (P4-045/046).
//     - Return any correctness signal to Flutter.
//     - Perform any AIM Engine, AI Teacher, or lesson scoring.
//
// Call sequence:
//   P4-043 (complete attempt) → P4-044 (validate answers) → P4-045 (score)
//
// Security rules:
//   - This service is called by the backend only — never directly by Flutter.
//   - correct_answer is read from placement_questions and never returned to clients.
//   - is_correct results are never returned to students during or after the attempt
//     (P4-012 §4). They feed only into the backend scoring service (P4-045).
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

/** A single answer row joined with its question's correct_answer for validation. */
interface AnswerWithCorrect {
  readonly answer_id: string;
  readonly answer_value: string;
  readonly correct_answer: string;
  readonly question_type: string;
}

/** Summary of validation results for a completed attempt. */
export interface AnswerValidationSummary {
  /** Total answers evaluated. */
  readonly totalEvaluated: number;
  /** Number of answers where is_correct was set to true. */
  readonly totalCorrect: number;
  /** Number of answers where is_correct was set to false. */
  readonly totalIncorrect: number;
}

@Injectable()
export class PlacementAnswerValidationService {
  private readonly logger = new Logger(PlacementAnswerValidationService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Evaluate and persist is_correct for all answers in a submitted attempt.
   *
   * Steps:
   *   1. Fetch all answers for the attempt joined with their question's
   *      correct_answer and question_type.
   *   2. Evaluate correctness deterministically per question type.
   *   3. Bulk-update is_correct on placement_answers for the attempt.
   *   4. Return a validation summary for the calling service (P4-045).
   *
   * This method is idempotent — if called a second time on an already-validated
   * attempt, it overwrites is_correct values with the same result.
   *
   * @param attemptId  UUID of the submitted placement_attempt.
   * @returns          Summary of total evaluated, correct, and incorrect counts.
   */
  async validateAnswersForAttempt(
    attemptId: string,
  ): Promise<AnswerValidationSummary> {
    // -----------------------------------------------------------------------
    // 1. Fetch all answers for the attempt with their question's correct_answer.
    //    correct_answer must NEVER be forwarded to any client response.
    // -----------------------------------------------------------------------
    const answersResult = await this.db.query<AnswerWithCorrect>(
      `SELECT
         pa.id             AS answer_id,
         pa.answer_value,
         pq.correct_answer,
         pq.question_type
       FROM placement_answers pa
       JOIN placement_questions pq ON pq.id = pa.placement_question_id
       WHERE pa.placement_attempt_id = $1`,
      [attemptId],
    );

    if ((answersResult.rowCount ?? 0) === 0) {
      this.logger.warn(
        `PlacementAnswerValidationService: no answers found for attempt ${attemptId}`,
      );
      return { totalEvaluated: 0, totalCorrect: 0, totalIncorrect: 0 };
    }

    const answers = answersResult.rows;

    // -----------------------------------------------------------------------
    // 2. Evaluate correctness for each answer.
    //    Correctness is deterministic — no AI, no external service.
    // -----------------------------------------------------------------------
    const correct: string[] = [];
    const incorrect: string[] = [];

    for (const answer of answers) {
      const isCorrect = this.evaluateCorrectness(
        answer.answer_value,
        answer.correct_answer,
        answer.question_type,
      );

      if (isCorrect) {
        correct.push(answer.answer_id);
      } else {
        incorrect.push(answer.answer_id);
      }
    }

    // -----------------------------------------------------------------------
    // 3. Bulk-update is_correct on placement_answers.
    //    Two UPDATE statements: one for correct, one for incorrect.
    //    Using ANY($1::uuid[]) for efficient IN-clause over UUID arrays.
    // -----------------------------------------------------------------------
    if (correct.length > 0) {
      await this.db.query(
        `UPDATE placement_answers
         SET is_correct = true
         WHERE id = ANY($1::uuid[])`,
        [correct],
      );
    }

    if (incorrect.length > 0) {
      await this.db.query(
        `UPDATE placement_answers
         SET is_correct = false
         WHERE id = ANY($1::uuid[])`,
        [incorrect],
      );
    }

    this.logger.log(
      `PlacementAnswerValidationService: attempt ${attemptId} — ` +
        `${answers.length} evaluated, ${correct.length} correct, ${incorrect.length} incorrect`,
    );

    return {
      totalEvaluated: answers.length,
      totalCorrect: correct.length,
      totalIncorrect: incorrect.length,
    };
  }

  // -------------------------------------------------------------------------
  // Private: correctness evaluation per question type
  // -------------------------------------------------------------------------

  /**
   * Evaluate whether answer_value matches correct_answer for the given type.
   *
   * Rules per P4-012 §2.3 and P4-044 scope:
   *   - multiple_choice / listening_choice: single letter A–D, case-insensitive.
   *   - true_false: "true" or "false", case-insensitive.
   *   - fill_blank: normalised string match (trim + lower-case).
   *
   * Correctness is NEVER communicated back to Flutter during or after the
   * attempt — is_correct feeds only into P4-045 (scoring service).
   */
  private evaluateCorrectness(
    answerValue: string,
    correctAnswer: string,
    questionType: string,
  ): boolean {
    const submitted = answerValue.trim().toLowerCase();
    const expected = correctAnswer.trim().toLowerCase();

    switch (questionType) {
      case 'multiple_choice':
      case 'listening_choice':
        // Both values should be a single letter (A–D).
        // Compare case-insensitively.
        return submitted === expected;

      case 'true_false':
        // Values should be "true" or "false".
        return submitted === expected;

      case 'fill_blank':
        // Normalised string match: trim whitespace and compare case-insensitively.
        // Does not account for synonyms or partial credit — deterministic equality only.
        return submitted === expected;

      default:
        // Unknown question type — treat as incorrect and log.
        this.logger.warn(
          `PlacementAnswerValidationService: unknown question_type "${questionType}" — marking incorrect.`,
        );
        return false;
    }
  }
}
