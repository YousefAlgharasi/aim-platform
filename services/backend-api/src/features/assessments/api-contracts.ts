// P10-048: Assessment API Contracts
//
// Scope: Type-safe API contract definitions for all student-facing assessment
//        endpoints. These types define the exact JSON shapes returned by the
//        backend — Flutter consumes these contracts as-is.
//
// Security invariants:
//   - pass_threshold, late_penalty_percent, section_weight, correct_answer,
//     grading_mode, and late_window_seconds are NEVER included in any response.
//   - score, passed, latePenaltyApplied, isCorrect are backend-authoritative.
//   - deadline status is backend-derived; Flutter never recomputes it.
//   - student_id is resolved from JWT; never accepted from client input.

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export type AssessmentType = 'quiz' | 'exam';

export type DeadlineStatus =
  | 'upcoming'
  | 'open'
  | 'closed'
  | 'missed'
  | 'late'
  | 'extended'
  | 'expired';

export type AttemptStatus =
  | 'started'
  | 'in_progress'
  | 'submitted'
  | 'graded'
  | 'expired';

// ---------------------------------------------------------------------------
// GET /student/assessments
// ---------------------------------------------------------------------------

export interface ListAssessmentsResponse {
  /** Array of published assessments visible to the authenticated student. */
  items: AssessmentListItemContract[];
}

export interface AssessmentListItemContract {
  id: string;
  type: AssessmentType;
  title: string;
  description: string | null;
  deadlineStatus: DeadlineStatus | null;
}

// ---------------------------------------------------------------------------
// GET /student/assessments/:id
// ---------------------------------------------------------------------------

export interface AssessmentDetailContract {
  id: string;
  type: AssessmentType;
  title: string;
  description: string | null;
  sections: AssessmentSectionContract[];
  maxAttempts: number;
  timeLimitSeconds: number | null;
  deadline: DeadlineContract | null;
}

export interface AssessmentSectionContract {
  id: string;
  title: string;
  order: number;
  questionCount: number;
}

export interface DeadlineContract {
  deadlineId: string;
  opensAt: string;   // ISO 8601
  closesAt: string;  // ISO 8601
  extendedClosesAt: string | null; // ISO 8601
  status: DeadlineStatus;
}

// ---------------------------------------------------------------------------
// GET /student/assessments/:id/history
// ---------------------------------------------------------------------------

export interface ResultHistoryContract {
  assessmentId: string;
  totalAttempts: number;
  results: ResultHistoryItemContract[];
}

export interface ResultHistoryItemContract {
  resultId: string;
  attemptId: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  passed: boolean;
  latePenaltyApplied: boolean;
  gradedAt: string;    // ISO 8601
  submittedAt: string | null; // ISO 8601
}

// ---------------------------------------------------------------------------
// POST /student/assessments/:id/attempts
// ---------------------------------------------------------------------------

export interface StartAttemptContract {
  attemptId: string;
  assessmentId: string;
  attemptNumber: number;
  status: 'started';
  startedAt: string;        // ISO 8601
  expiresAt: string | null; // ISO 8601 — backend-computed from time_limit_seconds
}

// ---------------------------------------------------------------------------
// GET /student/assessments/attempts/:attemptId/resume
// ---------------------------------------------------------------------------

export interface ResumeAttemptContract {
  attemptId: string;
  status: 'in_progress';
  expiresAt: string | null; // ISO 8601
}

// ---------------------------------------------------------------------------
// POST /student/assessments/attempts/:attemptId/submit
// ---------------------------------------------------------------------------

export interface SubmitAttemptContract {
  attemptId: string;
  status: 'graded';
  submittedAt: string; // ISO 8601
  resultId: string;
  // score, maxScore, passed, latePenaltyApplied: NEVER returned here.
  // Use GET /attempts/:attemptId/result to retrieve grading outcome.
}

// ---------------------------------------------------------------------------
// GET /student/assessments/attempts/:attemptId/result
// ---------------------------------------------------------------------------

export interface AttemptResultContract {
  resultId: string;
  attemptId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  latePenaltyApplied: boolean;
  gradedAt: string; // ISO 8601
  feedbackAllowed: boolean;
  breakdown: BreakdownItemContract[];
}

export interface BreakdownItemContract {
  assessmentQuestionLinkId: string;
  sectionId: string | null;
  pointsAwarded: number;
  pointsPossible: number;
  isCorrect?: boolean; // only when feedback_policy permits; correct answer text is NEVER included
}

// ---------------------------------------------------------------------------
// GET /student/assessments/deadlines
// ---------------------------------------------------------------------------

export interface StudentDeadlinesContract {
  upcoming: StudentDeadlineItemContract[];
  active: StudentDeadlineItemContract[];
  late: StudentDeadlineItemContract[];
  missed: StudentDeadlineItemContract[];
  closed: StudentDeadlineItemContract[];
}

export interface StudentDeadlineItemContract {
  assessmentId: string;
  assessmentTitle: string;
  deadlineId: string;
  opensAt: string;   // ISO 8601
  closesAt: string;  // ISO 8601
  extendedClosesAt: string | null; // ISO 8601
  status: DeadlineStatus;
}

// ---------------------------------------------------------------------------
// Error response shape (all endpoints)
// ---------------------------------------------------------------------------

export interface AssessmentErrorContract {
  code: string;
  message: string;
  statusCode: number;
}

// ---------------------------------------------------------------------------
// Endpoint summary table
// ---------------------------------------------------------------------------
//
// Method | Path                                          | Auth   | Response Type                | Status
// -------|-----------------------------------------------|--------|-----------------------------|-------
// GET    | /student/assessments                          | JWT    | AssessmentListItemContract[] | 200
// GET    | /student/assessments/deadlines                | JWT    | StudentDeadlinesContract     | 200
// GET    | /student/assessments/:id                      | JWT    | AssessmentDetailContract     | 200
// GET    | /student/assessments/:id/history              | JWT    | ResultHistoryContract        | 200
// POST   | /student/assessments/:id/attempts             | JWT    | StartAttemptContract         | 201
// GET    | /student/assessments/attempts/:attemptId/resume | JWT  | ResumeAttemptContract        | 200
// POST   | /student/assessments/attempts/:attemptId/submit | JWT  | SubmitAttemptContract        | 200
// GET    | /student/assessments/attempts/:attemptId/result | JWT  | AttemptResultContract        | 200
//
// All endpoints require SupabaseJwtAuthGuard + AssessmentPermissionGuard (STUDENT role).
// Attempt-level endpoints additionally require ownership guards.
//
// Fields NEVER included in any response:
//   pass_threshold, late_penalty_percent, section_weight, correct_answer,
//   grading_mode, late_window_seconds, is_correct (raw DB field).
