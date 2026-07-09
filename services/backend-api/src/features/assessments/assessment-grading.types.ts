// P10-027: Assessment grading types.
//
// Internal types consumed by AssessmentGradingService only.
// These types are NEVER serialized directly to API responses.
// Flutter receives only the subset approved by the result API contract
// (GET /attempts/:attemptId/result and /result/breakdown).

/** Raw answer row joined from DB for grading. */
export interface AnswerRow {
  readonly assessment_question_link_id: string;
  readonly question_id: string;
  readonly response_value: string;
  readonly points: number;
}

/** Correct-choice lookup row from question_choices. */
export interface ChoiceRow {
  readonly question_id: string;
  readonly is_correct: boolean;
  readonly id: string;
}

/** Per-answer grading outcome (internal; not exposed to Flutter). */
export interface GradingOutcome {
  readonly assessmentQuestionLinkId: string;
  readonly isCorrect: boolean;
  readonly pointsAwarded: number;
  readonly pointsPossible: number;
}

/** Final grading result passed to the result-persistence layer. */
export interface AssessmentGradingResult {
  readonly attemptId: string;
  readonly assessmentId: string;
  readonly studentId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: Date;
  readonly outcomes: GradingOutcome[];
}
