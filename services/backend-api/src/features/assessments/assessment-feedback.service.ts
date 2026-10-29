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
//   - The per-question review always tells the student which answers were
//     right, wrong or skipped. The correct option is revealed only once it
//     can't help a retake: the student passed, has no attempts left, or the
//     feedback_policy allows feedback.
//   - student_id ownership is verified before any data is returned.
//   - No AIM Engine, AI Teacher, or progress-mutation calls.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { resolveMaxAttempts } from './assessment-policy';

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

export type ReviewStatus = 'correct' | 'wrong' | 'skipped';

export interface ReviewOption {
  readonly id: string;
  readonly label: string;
  readonly text: string;
}

export interface ReviewItem {
  readonly assessmentQuestionLinkId: string;
  readonly number: number;
  readonly prompt: string;
  readonly options: ReviewOption[];
  /** The option the student chose, or null when skipped. */
  readonly selectedOptionId: string | null;
  /** Correct option ids — empty unless answersRevealed. */
  readonly correctOptionIds: string[];
  readonly status: ReviewStatus;
  readonly pointsAwarded: number;
  readonly pointsPossible: number;
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
  readonly assessmentType: string;
  readonly courseId: string | null;
  /** score / maxScore as a whole number out of 100. */
  readonly percentScore: number;
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly wrongCount: number;
  readonly skippedCount: number;
  /** Whether review.correctOptionIds are filled in. */
  readonly answersRevealed: boolean;
  /** Certificate issued for this course (final exams), if any. */
  readonly certificateId: string | null;
  readonly review: ReviewItem[];
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

interface AttemptRow {
  readonly assessment_id: string;
  readonly student_id: string;
  readonly type: string;
  readonly course_id: string | null;
  readonly max_attempts: number | null;
}

interface ReviewQuestionRow {
  readonly link_id: string;
  readonly question_id: string;
  readonly prompt: string;
  readonly points: string;
  readonly response_value: string | null;
}

interface ReviewChoiceRow {
  readonly id: string;
  readonly question_id: string;
  readonly text: string;
  readonly is_correct: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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

    // 5. Per-question review, counts and certificate.
    const extras = await this.buildReview(attemptId, result, breakdownRes.rows, feedbackAllowed);

    const score = Number(result.score);
    const maxScore = Number(result.max_score);

    return {
      ...extras,
      percentScore: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      resultId: result.id,
      attemptId: result.attempt_id,
      score,
      maxScore,
      passed: result.passed,
      latePenaltyApplied: result.late_penalty_applied,
      gradedAt: result.graded_at,
      feedbackAllowed,
      breakdown,
    };
  }

  private async buildReview(
    attemptId: string,
    result: ResultRow,
    breakdownRows: BreakdownRow[],
    feedbackAllowed: boolean,
  ) {
    const attemptRes = await this.db.query<AttemptRow>(
      `SELECT a.assessment_id, a.student_id, asm.type, asm.course_id, s.max_attempts
       FROM assessment_attempts a
       JOIN assessments asm ON asm.id = a.assessment_id
       LEFT JOIN assessment_settings s ON s.assessment_id = a.assessment_id
       WHERE a.id = $1`,
      [attemptId],
    );
    const attempt = attemptRes.rows[0];

    const questionsRes = attempt
      ? await this.db.query<ReviewQuestionRow>(
          `SELECT aq.id AS link_id, aq.question_id, q.stem AS prompt, aq.points,
                  aaa.response_value
           FROM assessment_questions aq
           JOIN question_bank q ON q.id = aq.question_id
           LEFT JOIN assessment_attempt_answers aaa
             ON aaa.assessment_question_link_id = aq.id AND aaa.attempt_id = $2
           WHERE aq.assessment_id = $1
           ORDER BY aq."order" ASC`,
          [attempt.assessment_id, attemptId],
        )
      : { rows: [] as ReviewQuestionRow[] };
    const questions = questionsRes.rows;

    const choicesRes = questions.length
      ? await this.db.query<ReviewChoiceRow>(
          `SELECT id, question_id, text, is_correct
           FROM question_choices
           WHERE question_id = ANY($1)
           ORDER BY sort_order ASC`,
          [[...new Set(questions.map((q) => q.question_id))]],
        )
      : { rows: [] as ReviewChoiceRow[] };
    const choicesByQuestion = new Map<string, ReviewChoiceRow[]>();
    for (const c of choicesRes.rows) {
      const list = choicesByQuestion.get(c.question_id) ?? [];
      list.push(c);
      choicesByQuestion.set(c.question_id, list);
    }

    let attemptsLeft = true;
    if (attempt) {
      const countRes = await this.db.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM assessment_attempts
         WHERE assessment_id = $1 AND student_id = $2`,
        [attempt.assessment_id, attempt.student_id],
      );
      const used = Number(countRes.rows[0]?.count ?? 0);
      attemptsLeft = used < resolveMaxAttempts(attempt.type, attempt.max_attempts);
    }
    const answersRevealed = feedbackAllowed || result.passed || !attemptsLeft;

    const breakdownByLink = new Map(
      breakdownRows
        .filter((b) => b.assessment_question_link_id)
        .map((b) => [b.assessment_question_link_id as string, b]),
    );

    const review: ReviewItem[] = questions.map((q, i) => {
      const choices = choicesByQuestion.get(q.question_id) ?? [];
      const answered = q.response_value != null && q.response_value.trim() !== '';
      const graded = breakdownByLink.get(q.link_id);
      const isCorrect = answered && graded?.is_correct === true;
      return {
        assessmentQuestionLinkId: q.link_id,
        number: i + 1,
        prompt: q.prompt,
        options: choices.map((c, idx) => ({
          id: c.id,
          label: OPTION_LABELS[idx] ?? String(idx + 1),
          text: c.text,
        })),
        selectedOptionId: answered ? q.response_value : null,
        correctOptionIds: answersRevealed
          ? choices.filter((c) => c.is_correct).map((c) => c.id)
          : [],
        status: !answered ? 'skipped' : isCorrect ? 'correct' : 'wrong',
        pointsAwarded: graded ? Number(graded.points_awarded) : 0,
        pointsPossible: Number(q.points),
      };
    });

    let certificateId: string | null = null;
    if (attempt?.type === 'exam' && attempt.course_id && result.passed) {
      const certRes = await this.db.query<{ id: string }>(
        `SELECT id FROM certificates WHERE student_id = $1 AND course_id = $2
         ORDER BY issued_at DESC LIMIT 1`,
        [result.student_id, attempt.course_id],
      );
      certificateId = certRes.rows[0]?.id ?? null;
    }

    return {
      assessmentType: attempt?.type ?? 'quiz',
      courseId: attempt?.course_id ?? null,
      totalQuestions: review.length,
      correctCount: review.filter((r) => r.status === 'correct').length,
      wrongCount: review.filter((r) => r.status === 'wrong').length,
      skippedCount: review.filter((r) => r.status === 'skipped').length,
      answersRevealed,
      certificateId,
      review,
    };
  }
}
