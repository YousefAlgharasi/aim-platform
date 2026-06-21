// P10-020: Assessment entities and DTOs.
//
// Scope: Assessment feature (quizzes, exams, deadlines) only.
//
// Security rules:
//   - correct_answer / is_correct are NEVER included in any student-facing
//     response shape. They live in question_choices (DB) and GradingOutcome
//     (internal grading service) only.
//   - pass_threshold, late_penalty_percent, grading_mode, section weights
//     are NEVER included in any response DTO.
//   - deadline status is always backend-derived; Flutter must display it
//     as-is and must never recompute it from raw timestamps.
//   - score, maxScore, passed are written by the backend grading service
//     only; no client-supplied values are accepted in write DTOs.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, database credentials, or AI provider keys.

// ===========================================================================
// Shared literals
// ===========================================================================

export type AssessmentType   = 'quiz' | 'exam';
export type AssessmentStatus = 'draft' | 'published' | 'archived';
export type AttemptStatus    = 'started' | 'in_progress' | 'submitted' | 'graded' | 'expired';
export type DeadlineStatus   = 'upcoming' | 'open' | 'closed' | 'missed' | 'late' | 'extended' | 'expired';
export type FeedbackPolicy   = 'none' | 'after_submission' | 'after_deadline' | 'after_review';

// ===========================================================================
// Internal DB row types (never sent to Flutter)
// ===========================================================================

/** Raw assessments table row. */
export interface AssessmentRow {
  readonly id: string;
  readonly type: AssessmentType;
  readonly title: string;
  readonly description: string | null;
  readonly status: AssessmentStatus;
  readonly created_by: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}

/** Raw assessment_sections table row. */
export interface AssessmentSectionRow {
  readonly id: string;
  readonly assessment_id: string;
  readonly title: string;
  readonly order: number;
  /** Backend scoring weight — NEVER returned to Flutter. */
  readonly weight: number;
  readonly created_at: Date;
  readonly updated_at: Date;
}

/** Raw assessment_questions (question link) row. */
export interface AssessmentQuestionRow {
  readonly id: string;
  readonly assessment_id: string;
  readonly section_id: string | null;
  readonly question_id: string;
  readonly order: number;
  /** Backend scoring config — NEVER returned to Flutter on question delivery. */
  readonly points: number;
  readonly created_at: Date;
  readonly updated_at: Date;
}

/** Raw assessment_attempts row. */
export interface AssessmentAttemptRow {
  readonly id: string;
  readonly assessment_id: string;
  readonly student_id: string;
  readonly attempt_number: number;
  readonly status: AttemptStatus;
  readonly started_at: Date;
  readonly submitted_at: Date | null;
  readonly expires_at: Date | null;
  readonly created_at: Date;
  readonly updated_at: Date;
}

/** Raw assessment_attempt_answers row. */
export interface AssessmentAnswerRow {
  readonly id: string;
  readonly attempt_id: string;
  readonly assessment_question_link_id: string;
  /** Opaque student response — never authoritative for correctness. */
  readonly response_value: string;
  readonly submitted_at: Date;
}

/** Raw assessment_deadlines row. */
export interface AssessmentDeadlineRow {
  readonly id: string;
  readonly assessment_id: string;
  readonly student_id: string | null;
  readonly timezone: string;
  readonly opens_at: Date;
  readonly closes_at: Date;
  readonly extended_closes_at: Date | null;
  /** Backend-only — NEVER returned to Flutter. */
  readonly late_window_seconds: number | null;
  /** Backend-only — NEVER returned to Flutter. */
  readonly late_penalty_percent: number;
  readonly is_active: boolean;
}

// ===========================================================================
// Student-safe response shapes (returned to Flutter via API layer)
// ===========================================================================

/** Assessment list item (GET /assessments). */
export interface AssessmentListItemDto {
  readonly id: string;
  readonly type: AssessmentType;
  readonly title: string;
  readonly description: string | null;
  /** Backend-derived — Flutter displays as-is. */
  readonly deadlineStatus: DeadlineStatus | null;
}

/** Assessment detail (GET /assessments/:id). */
export interface AssessmentDetailDto {
  readonly id: string;
  readonly type: AssessmentType;
  readonly title: string;
  readonly description: string | null;
  readonly sections: AssessmentSectionDto[];
  /** Informational only — backend enforces attempt eligibility. */
  readonly maxAttempts: number;
  /** Informational only — backend enforces time limit. */
  readonly timeLimitSeconds: number | null;
  // NOTE: passThreshold, sectionWeight, latePolicy NEVER included here.
}

/** Section shape within assessment detail (no weight exposed). */
export interface AssessmentSectionDto {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly questionCount: number;
}

/** Deadline status response (GET /assessments/:id/deadline). */
export interface DeadlineStatusDto {
  readonly deadlineId: string;
  readonly opensAt: string;
  readonly closesAt: string;
  readonly extendedClosesAt: string | null;
  /** Backend-computed — Flutter must display as-is, never recompute. */
  readonly status: DeadlineStatus;
}

/** Question option delivered to Flutter (no correctness). */
export interface QuestionOptionDto {
  readonly id: string;
  readonly label: string;
  readonly text: string;
}

/** Question delivered to Flutter (no correct answer, no points, no weight). */
export interface QuestionDeliveryDto {
  readonly id: string;
  readonly assessmentQuestionLinkId: string;
  readonly sectionId: string | null;
  readonly order: number;
  readonly type: string;
  readonly prompt: string;
  readonly options: QuestionOptionDto[];
  // correctOptionId, points, sectionWeight: NEVER included here.
}

/** Attempt started/resumed response. */
export interface AttemptDto {
  readonly attemptId: string;
  readonly assessmentId: string;
  readonly attemptNumber: number;
  readonly status: AttemptStatus;
  readonly startedAt: string;
  readonly expiresAt: string | null;
}

/** Answer submission response (no correctness returned). */
export interface AnswerSubmittedDto {
  readonly answerId: string;
  readonly assessmentQuestionLinkId: string;
  readonly submittedAt: string;
  // isCorrect, pointsAwarded: NEVER included here.
}

/** Attempt submission response. */
export interface AttemptSubmittedDto {
  readonly attemptId: string;
  readonly status: 'submitted';
  readonly submittedAt: string;
  readonly resultId: string;
}

/** Result summary (GET /attempts/:attemptId/result). */
export interface ResultSummaryDto {
  readonly resultId: string;
  readonly attemptId: string;
  /** Backend grading output — never client-writable. */
  readonly score: number;
  readonly maxScore: number;
  /** Backend score-policy output — never recomputed by Flutter. */
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: string;
}

/** Result breakdown item (GET /attempts/:attemptId/result/breakdown). */
export interface ResultBreakdownItemDto {
  readonly sectionId: string | null;
  readonly assessmentQuestionLinkId: string;
  readonly pointsAwarded: number;
  readonly pointsPossible: number;
  /**
   * Only present when backend feedback_policy permits it.
   * Correct answer text is NEVER included here regardless of policy.
   */
  readonly isCorrect?: boolean;
}

/** Result breakdown response. */
export interface ResultBreakdownDto {
  readonly resultId: string;
  readonly breakdown: ResultBreakdownItemDto[];
}

/** Assessment result history item (GET /assessments/results). */
export interface ResultHistoryItemDto {
  readonly resultId: string;
  readonly assessmentId: string;
  readonly assessmentTitle: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly gradedAt: string;
}

// ===========================================================================
// Write DTOs (client → backend) — no scoring/correctness/deadline fields
// ===========================================================================

/** Body for POST /attempts/:attemptId/answers. */
export interface SubmitAnswerDto {
  readonly assessmentQuestionLinkId: string;
  /** Opaque student selection — backend evaluates correctness only. */
  readonly responseValue: string;
  // isCorrect, score, correctAnswer: NEVER accepted from client.
}
