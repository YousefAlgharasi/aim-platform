// P10-027: AssessmentGradingService.
//
// Scope: Assessment grading (quizzes and exams) only.
//
// Responsibility:
//   Called by the backend attempt-submission flow after an attempt is
//   submitted. This service:
//
//   1. Fetches all submitted answers for the attempt.
//   2. Looks up the correct choice for each question from question_choices.
//   3. Computes per-answer correctness and points (GradingOutcome[]).
//   4. Sums total score and max score.
//   5. Applies the pass threshold from assessment_settings to derive passed.
//   6. Checks whether a late penalty applies (via assessment_deadlines) and
//      adjusts score accordingly.
//   7. Returns an AssessmentGradingResult for the result-persistence layer
//      (P10-028/P10-029) to write to assessment_results and
//      assessment_result_breakdowns.
//
// Security rules:
//   - This service is called by the backend only — never triggered directly
//     by Flutter.
//   - correct_answer / is_correct values from question_choices are NEVER
//     returned to Flutter here. They feed the GradingOutcome array for
//     result-persistence only.
//   - Raw grading fields (isCorrect, pointsAwarded, score, maxScore, passed,
//     passThreshold, latePenaltyPercent) are NEVER returned to Flutter from
//     this service. Flutter receives only the approved result shape via
//     GET /attempts/:attemptId/result (P10-029).
//   - passThreshold and latePenaltyPercent are backend config pulled from
//     assessment_settings — they are NOT accepted from any client payload.
//   - No AIM Engine, AI Teacher, parent dashboard, or voice AI calls here.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are present in this file.

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  AnswerRow,
  AssessmentGradingResult,
  ChoiceRow,
  GradingOutcome,
} from './assessment-grading.types';

// ---------------------------------------------------------------------------
// Internal DB row types
// ---------------------------------------------------------------------------

interface AttemptRow {
  readonly assessment_id: string;
  readonly student_id: string;
  readonly submitted_at: Date;
}

interface SettingsRow {
  readonly pass_threshold: number;        // e.g. 60.00 — NEVER returned to Flutter
  readonly late_penalty_percent: number;  // e.g. 10.00 — NEVER returned to Flutter
}

interface DeadlineRow {
  readonly closes_at: Date;
  readonly extended_closes_at: Date | null;
  readonly late_window_seconds: number | null;
}

// ---------------------------------------------------------------------------

@Injectable()
export class AssessmentGradingService {
  private readonly logger = new Logger(AssessmentGradingService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Grade a submitted attempt.
   *
   * Precondition: the attempt must already be in 'submitted' status.
   * Called by the submission flow — never directly by Flutter.
   *
   * @param attemptId UUID of the submitted assessment_attempt.
   * @returns AssessmentGradingResult for the result-persistence layer.
   */
  async gradeAttempt(attemptId: string): Promise<AssessmentGradingResult> {
    // -----------------------------------------------------------------------
    // 1. Load attempt metadata.
    // -----------------------------------------------------------------------
    const attemptResult = await this.db.query<AttemptRow>(
      `SELECT assessment_id, student_id, submitted_at
       FROM assessment_attempts
       WHERE id = $1`,
      [attemptId],
    );

    if (attemptResult.rows.length === 0) {
      throw new NotFoundException(`Attempt ${attemptId} not found`);
    }

    const attempt = attemptResult.rows[0];

    // -----------------------------------------------------------------------
    // 2. Load backend grading policy from assessment_settings.
    //    pass_threshold and late_penalty_percent are NEVER accepted from
    //    Flutter — always resolved from DB.
    // -----------------------------------------------------------------------
    const settingsResult = await this.db.query<SettingsRow>(
      `SELECT pass_threshold, late_penalty_percent
       FROM assessment_settings
       WHERE assessment_id = $1`,
      [attempt.assessment_id],
    );

    const settings = settingsResult.rows[0] ?? {
      pass_threshold: 60,
      late_penalty_percent: 0,
    };

    // -----------------------------------------------------------------------
    // 3. Load submitted answers for this attempt.
    // -----------------------------------------------------------------------
    const answersResult = await this.db.query<AnswerRow>(
      `SELECT
         aaa.assessment_question_link_id,
         aq.question_id,
         aaa.response_value,
         aq.points
       FROM assessment_attempt_answers aaa
       JOIN assessment_questions aq
         ON aq.id = aaa.assessment_question_link_id
       WHERE aaa.attempt_id = $1`,
      [attemptId],
    );

    const answers = answersResult.rows;

    // -----------------------------------------------------------------------
    // 4. Load correct choices for all questions in this attempt.
    //    is_correct is used here for grading only — it is NEVER returned
    //    to Flutter from this service.
    // -----------------------------------------------------------------------
    const questionIds = [...new Set(answers.map((a) => a.question_id))];

    let correctChoices: ChoiceRow[] = [];

    if (questionIds.length > 0) {
      const placeholders = questionIds.map((_, i) => `$${i + 1}`).join(', ');
      const choicesResult = await this.db.query<ChoiceRow>(
        `SELECT question_id, is_correct, id
         FROM question_choices
         WHERE question_id IN (${placeholders})
           AND is_correct = TRUE`,
        questionIds,
      );
      correctChoices = choicesResult.rows;
    }

    // Build a lookup: question_id → Set of correct choice ids
    // (Flutter submits the chosen option's `id` as responseValue — see
    // attempt_page.dart's responseValue: optionId.)
    const correctLabelsByQuestion = new Map<string, Set<string>>();
    for (const choice of correctChoices) {
      if (!correctLabelsByQuestion.has(choice.question_id)) {
        correctLabelsByQuestion.set(choice.question_id, new Set());
      }
      correctLabelsByQuestion.get(choice.question_id)!.add(choice.id);
    }

    // -----------------------------------------------------------------------
    // 5. Compute per-answer grading outcomes.
    // -----------------------------------------------------------------------
    const outcomes: GradingOutcome[] = answers.map((answer) => {
      const correctLabels = correctLabelsByQuestion.get(answer.question_id);
      const isCorrect = correctLabels
        ? correctLabels.has(answer.response_value)
        : false;
      // node-postgres returns NUMERIC columns as strings (to avoid float
      // precision loss), despite AnswerRow.points being typed `number` —
      // coerce explicitly here so the reduce() sums below do real
      // arithmetic instead of string concatenation (which silently
      // produced NaN/garbled scores and a downstream CHECK-constraint
      // violation on assessment_results.max_score at persist time).
      const points = Number(answer.points);
      const pointsAwarded = isCorrect ? points : 0;

      return {
        assessmentQuestionLinkId: answer.assessment_question_link_id,
        isCorrect,
        pointsAwarded,
        pointsPossible: points,
      };
    });

    // -----------------------------------------------------------------------
    // 6. Sum score and max score.
    // -----------------------------------------------------------------------
    const rawScore = outcomes.reduce((sum, o) => sum + o.pointsAwarded, 0);
    const maxScore = outcomes.reduce((sum, o) => sum + o.pointsPossible, 0);

    // -----------------------------------------------------------------------
    // 7. Check deadline for late-penalty eligibility.
    //    Late penalty is backend-evaluated only — NEVER accepted from Flutter.
    // -----------------------------------------------------------------------
    const { penalizedScore, latePenaltyApplied } =
      await this.applyLatePolicy(
        attemptId,
        attempt.assessment_id,
        attempt.student_id,
        attempt.submitted_at,
        rawScore,
        settings.late_penalty_percent,
      );

    // -----------------------------------------------------------------------
    // 8. Derive pass/fail from pass_threshold — NEVER from Flutter input.
    // -----------------------------------------------------------------------
    const percentageScore = maxScore > 0 ? (penalizedScore / maxScore) * 100 : 0;
    const passed = percentageScore >= settings.pass_threshold;

    this.logger.log(
      `GradingService: attempt ${attemptId} — ` +
        `score=${penalizedScore.toFixed(2)}/${maxScore.toFixed(2)} ` +
        `(${percentageScore.toFixed(1)}%), passed=${passed}, ` +
        `latePenalty=${latePenaltyApplied}`,
    );

    return {
      attemptId,
      assessmentId: attempt.assessment_id,
      studentId: attempt.student_id,
      score: Math.round(penalizedScore * 100) / 100,
      maxScore: Math.round(maxScore * 100) / 100,
      passed,
      latePenaltyApplied,
      gradedAt: new Date(),
      outcomes,
    };
  }

  // -------------------------------------------------------------------------
  // Late-penalty application (backend-only; never triggered by Flutter)
  // -------------------------------------------------------------------------

  private async applyLatePolicy(
    attemptId: string,
    assessmentId: string,
    studentId: string,
    submittedAt: Date,
    rawScore: number,
    latePenaltyPercent: number,
  ): Promise<{ penalizedScore: number; latePenaltyApplied: boolean }> {
    // Resolve effective deadline: per-student extension first, then global.
    const deadlineResult = await this.db.query<DeadlineRow>(
      `SELECT closes_at, extended_closes_at, late_window_seconds
       FROM assessment_deadlines
       WHERE assessment_id = $1
         AND is_active = TRUE
         AND (student_id = $2 OR student_id IS NULL)
       ORDER BY student_id NULLS LAST
       LIMIT 1`,
      [assessmentId, studentId],
    );

    if (deadlineResult.rows.length === 0) {
      // No deadline configured — no late penalty possible.
      return { penalizedScore: rawScore, latePenaltyApplied: false };
    }

    const deadline = deadlineResult.rows[0];
    const effectiveClose = deadline.extended_closes_at ?? deadline.closes_at;

    // Submission is on-time — no penalty.
    if (submittedAt <= effectiveClose) {
      return { penalizedScore: rawScore, latePenaltyApplied: false };
    }

    // Submission is late — check whether within the late window.
    if (
      deadline.late_window_seconds === null ||
      latePenaltyPercent === 0
    ) {
      // Late window not configured or no penalty configured.
      return { penalizedScore: rawScore, latePenaltyApplied: false };
    }

    const lateWindowEnd = new Date(
      effectiveClose.getTime() + deadline.late_window_seconds * 1000,
    );

    if (submittedAt <= lateWindowEnd) {
      // Within late window — apply penalty.
      const penaltyMultiplier = 1 - latePenaltyPercent / 100;
      const penalizedScore = rawScore * penaltyMultiplier;
      return { penalizedScore, latePenaltyApplied: true };
    }

    // Beyond late window — still no penalty adjustment here; submission
    // validity is enforced by the attempt-submission service upstream.
    return { penalizedScore: rawScore, latePenaltyApplied: false };
  }
}
