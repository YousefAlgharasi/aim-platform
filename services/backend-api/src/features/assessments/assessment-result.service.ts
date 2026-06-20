// P10-029 / P10-040: AssessmentResultService.
//
// Scope: Persist the authoritative assessment result and per-question
//        breakdown after grading (P10-027) and score policy (P10-028).
//        List result history for a student on an assessment (P10-040).
//
// Security rules:
//   - Called by the backend submission flow only — never by Flutter.
//   - score, maxScore, passed, latePenaltyApplied are written from the
//     backend ScoredResult only; no client-supplied values are accepted.
//   - isCorrect in result_breakdowns is written from GradingOutcome only;
//     the API layer (P10-034+) enforces feedback policy before returning it.
//   - Result history scoped by student_id from JWT — never client-supplied.
//   - No AIM Engine, AI Teacher, or progress-mutation calls here.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
// Inline until P10-027/P10-028 branches merge to main
export interface AssessmentGradingResult {
  readonly attemptId: string;
  readonly assessmentId: string;
  readonly studentId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: Date;
  readonly outcomes: readonly {
    assessmentQuestionLinkId: string;
    isCorrect: boolean;
    pointsAwarded: number;
    pointsPossible: number;
  }[];
}

export interface PersistedResult {
  readonly resultId: string;
  readonly attemptId: string;
  readonly assessmentId: string;
  readonly studentId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: Date;
}

export interface ResultHistoryItem {
  readonly resultId: string;
  readonly attemptId: string;
  readonly attemptNumber: number;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: Date;
  readonly submittedAt: Date | null;
}

export interface ResultHistoryResponse {
  readonly assessmentId: string;
  readonly totalAttempts: number;
  readonly results: readonly ResultHistoryItem[];
}

@Injectable()
export class AssessmentResultService {
  private readonly logger = new Logger(AssessmentResultService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist the grading result to assessment_results and
   * assessment_result_breakdowns. Idempotent: throws ConflictException
   * if a result already exists for this attempt.
   */
  async persistResult(gradingResult: AssessmentGradingResult): Promise<PersistedResult> {
    return this.db.withClient(async (client) => {
      await client.query('BEGIN');

      try {
        // ---------------------------------------------------------------
        // 1. Insert into assessment_results (backend authority only).
        // ---------------------------------------------------------------
        const resultInsert = await client.query<{ id: string; graded_at: Date }>(
          `INSERT INTO assessment_results
             (attempt_id, assessment_id, student_id, score, max_score,
              passed, late_penalty_applied, graded_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, graded_at`,
          [
            gradingResult.attemptId,
            gradingResult.assessmentId,
            gradingResult.studentId,
            gradingResult.score,
            gradingResult.maxScore,
            gradingResult.passed,
            gradingResult.latePenaltyApplied,
            gradingResult.gradedAt,
          ],
        );

        const resultId = resultInsert.rows[0].id;
        const gradedAt = resultInsert.rows[0].graded_at;

        // ---------------------------------------------------------------
        // 2. Insert per-question breakdown rows.
        //    isCorrect stored here for audit; API layer controls visibility.
        // ---------------------------------------------------------------
        if (gradingResult.outcomes.length > 0) {
          const values: unknown[] = [];
          const placeholders = gradingResult.outcomes.map((o, i) => {
            const base = i * 4;
            values.push(resultId, o.assessmentQuestionLinkId, o.isCorrect, o.pointsAwarded, o.pointsPossible);
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
          });

          // Rebuild with correct indexing
          const vals: unknown[] = [];
          const rows = gradingResult.outcomes.map((o, i) => {
            const b = i * 5 + 1;
            vals.push(resultId, o.assessmentQuestionLinkId, o.isCorrect, o.pointsAwarded, o.pointsPossible);
            return `($${b}, $${b+1}, $${b+2}, $${b+3}, $${b+4})`;
          });

          await client.query(
            `INSERT INTO assessment_result_breakdowns
               (result_id, assessment_question_link_id, is_correct,
                points_awarded, points_possible)
             VALUES ${rows.join(', ')}`,
            vals,
          );
        }

        // ---------------------------------------------------------------
        // 3. Mark attempt as graded.
        // ---------------------------------------------------------------
        await client.query(
          `UPDATE assessment_attempts SET status = 'graded', updated_at = NOW()
           WHERE id = $1`,
          [gradingResult.attemptId],
        );

        await client.query('COMMIT');

        this.logger.log(
          `ResultService: persisted result ${resultId} for attempt ${gradingResult.attemptId}`,
        );

        return {
          resultId,
          attemptId: gradingResult.attemptId,
          assessmentId: gradingResult.assessmentId,
          studentId: gradingResult.studentId,
          score: gradingResult.score,
          maxScore: gradingResult.maxScore,
          passed: gradingResult.passed,
          latePenaltyApplied: gradingResult.latePenaltyApplied,
          gradedAt,
        };
      } catch (err: unknown) {
        await client.query('ROLLBACK');
        if (
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code: string }).code === '23505'
        ) {
          throw new ConflictException(
            `Result already exists for attempt ${gradingResult.attemptId}`,
          );
        }
        throw err;
      }
    });
  }

  /** List all graded results for a student on a given assessment (P10-040). */
  async listByAssessment(assessmentId: string, studentId: string): Promise<ResultHistoryResponse> {
    const res = await this.db.query<{
      result_id: string; attempt_id: string; attempt_number: number;
      score: number; max_score: number; passed: boolean;
      late_penalty_applied: boolean; graded_at: Date; submitted_at: Date | null;
    }>(
      `SELECT r.id AS result_id, r.attempt_id, a.attempt_number,
              r.score, r.max_score, r.passed, r.late_penalty_applied,
              r.graded_at, a.submitted_at
       FROM assessment_results r
       JOIN assessment_attempts a ON a.id = r.attempt_id
       WHERE r.assessment_id = $1 AND r.student_id = $2
       ORDER BY a.attempt_number ASC`,
      [assessmentId, studentId],
    );

    return {
      assessmentId,
      totalAttempts: res.rows.length,
      results: res.rows.map(r => ({
        resultId: r.result_id,
        attemptId: r.attempt_id,
        attemptNumber: r.attempt_number,
        score: Number(r.score),
        maxScore: Number(r.max_score),
        passed: r.passed,
        latePenaltyApplied: r.late_penalty_applied,
        gradedAt: r.graded_at,
        submittedAt: r.submitted_at,
      })),
    };
  }

  /** Read a result by attempt ID — for the result API (P10-034). */
  async findByAttemptId(attemptId: string, studentId: string): Promise<PersistedResult | null> {
    const res = await this.db.query<{
      id: string; attempt_id: string; assessment_id: string;
      student_id: string; score: number; max_score: number;
      passed: boolean; late_penalty_applied: boolean; graded_at: Date;
    }>(
      `SELECT id, attempt_id, assessment_id, student_id, score, max_score,
              passed, late_penalty_applied, graded_at
       FROM assessment_results
       WHERE attempt_id = $1 AND student_id = $2`,
      [attemptId, studentId],
    );

    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    return {
      resultId: r.id,
      attemptId: r.attempt_id,
      assessmentId: r.assessment_id,
      studentId: r.student_id,
      score: Number(r.score),
      maxScore: Number(r.max_score),
      passed: r.passed,
      latePenaltyApplied: r.late_penalty_applied,
      gradedAt: r.graded_at,
    };
  }
}
