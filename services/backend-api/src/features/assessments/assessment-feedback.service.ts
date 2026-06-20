// P10-030: AssessmentFeedbackService.
//
// Scope: Generate backend-approved feedback summaries for mobile display.
//
// Responsibility:
//   Reads assessment_results and assessment_result_breakdowns to produce
//   a FeedbackSummary and optional per-question breakdown, gated by the
//   assessment's feedback_policy from assessment_settings.
//
// Security rules:
//   - Called by the backend result API only — never directly by Flutter.
//   - isCorrect in breakdown is only included when feedback_policy allows.
//   - Correct answer text is NEVER included in any feedback response.
//   - student_id ownership is verified before any data is returned.
//   - No AIM Engine, AI Teacher, or progress-mutation calls.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

// ---------------------------------------------------------------------------
// Public types (returned to API layer, never directly to Flutter raw)
// ---------------------------------------------------------------------------

export type FeedbackPolicy = 'none' | 'after_submission' | 'after_deadline' | 'after_review';

export interface BreakdownItem {
  readonly assessmentQuestionLinkId: string;
  readonly sectionId: string | null;
  readonly pointsAwarded: number;
  readonly pointsPossible: number;
  /** Only present when feedback_policy permits it. Never carries correct answer text. */
  readonly isCorrect?: boolean;
}

export interface FeedbackSummary {
  readonly resultId: string;
  readonly attemptId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: Date;
  readonly feedbackAllowed: boolean;
  readonly breakdown: BreakdownItem[];
}

// ---------------------------------------------------------------------------
// Internal DB row types
// ---------------------------------------------------------------------------

interface ResultRow {
  readonly id: string;
  readonly attempt_id: string;
  readonly student_id: string;
  readonly score: string;
  readonly max_score: string;
  readonly passed: boolean;
  readonly late_penalty_applied: boolean;
  readonly graded_at: Date;
}

interface BreakdownRow {
  readonly assessment_question_link_id: string | null;
  readonly section_id: string | null;
  readonly is_correct: boolean | null;
  readonly points_awarded: string;
  readonly points_possible: string;
}

interface SettingsRow {
  readonly feedback_policy: FeedbackPolicy;
  readonly result_visibility: string;
}

// ---------------------------------------------------------------------------

@Injectable()
export class AssessmentFeedbackService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Return a feedback summary for an attempt owned by studentId.
   * feedback_policy from assessment_settings controls isCorrect visibility.
   */
  async getFeedback(attemptId: string, studentId: string): Promise<FeedbackSummary> {
    // 1. Load result — enforce ownership.
    const resultRes = await this.db.query<ResultRow>(
      `SELECT ar.id, ar.attempt_id, ar.student_id, ar.score, ar.max_score,
              ar.passed, ar.late_penalty_applied, ar.graded_at
       FROM assessment_results ar
       WHERE ar.attempt_id = $1`,
      [attemptId],
    );

    if (resultRes.rows.length === 0) {
      throw new NotFoundException(`No result found for attempt ${attemptId}`);
    }

    const result = resultRes.rows[0];

    if (result.student_id !== studentId) {
      throw new ForbiddenException('Result does not belong to this student');
    }

    // 2. Load feedback policy from assessment_settings.
    const settingsRes = await this.db.query<SettingsRow>(
      `SELECT s.feedback_policy, s.result_visibility
       FROM assessment_settings s
       JOIN assessment_attempts a ON a.assessment_id = s.assessment_id
       WHERE a.id = $1`,
      [attemptId],
    );

    const policy: FeedbackPolicy = settingsRes.rows[0]?.feedback_policy ?? 'none';
    const feedbackAllowed = policy !== 'none';

    // 3. Load breakdown rows.
    const breakdownRes = await this.db.query<BreakdownRow>(
      `SELECT assessment_question_link_id, section_id,
              is_correct, points_awarded, points_possible
       FROM assessment_result_breakdowns
       WHERE result_id = $1
       ORDER BY section_id NULLS LAST, assessment_question_link_id`,
      [result.id],
    );

    // 4. Build breakdown — include isCorrect only when policy allows.
    const breakdown: BreakdownItem[] = breakdownRes.rows.map((row) => {
      const item: BreakdownItem = {
        assessmentQuestionLinkId: row.assessment_question_link_id ?? '',
        sectionId: row.section_id,
        pointsAwarded: Number(row.points_awarded),
        pointsPossible: Number(row.points_possible),
      };
      // Correct answer text is NEVER included here regardless of policy.
      if (feedbackAllowed && row.is_correct !== null) {
        return { ...item, isCorrect: row.is_correct };
      }
      return item;
    });

    return {
      resultId: result.id,
      attemptId: result.attempt_id,
      score: Number(result.score),
      maxScore: Number(result.max_score),
      passed: result.passed,
      latePenaltyApplied: result.late_penalty_applied,
      gradedAt: result.graded_at,
      feedbackAllowed,
      breakdown,
    };
  }
}
