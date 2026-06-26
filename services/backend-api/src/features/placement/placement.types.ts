// Phase 4 — P4-040
// Placement feature types.
//
// Scope: Placement Test system only.
//
// Security rules:
// - correct_answer is stored in the DB but NEVER included in any response shape here.
// - skill_code and skill_id are internal scoring data — not returned to students.
// - Backend is the sole authority for question content, scoring, and result generation.
// - Flutter/client must never receive correct_answer, is_correct, or scoring weights.
// - No AIM Engine runtime, lesson delivery, practice sessions, AI Teacher, or
//   progress dashboard data is represented here.
// - No secrets, service-role keys, database credentials, or privileged config here.

// ---------------------------------------------------------------------------
// DB row types (internal — never sent to clients)
// ---------------------------------------------------------------------------

/** Raw row from placement_questions as returned by pg. */
export interface PlacementQuestionRow {
  readonly id: string;
  readonly placement_section_id: string;
  readonly question_type: string;
  readonly prompt: string;
  readonly media_url: string | null;
  readonly order_index: number;
  /** Server-side only. Never sent to clients. */
  readonly correct_answer: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/** Raw row from placement_question_skills (primary skill join). */
export interface PlacementQuestionSkillRow {
  readonly placement_question_id: string;
  readonly skill_id: string;
  readonly skill_code: string; // joined from skills table
  readonly is_primary: boolean;
}

/** Combined DB row used internally when fetching questions with their primary skill. */
export interface PlacementQuestionWithSkillRow {
  readonly id: string;
  readonly placement_section_id: string;
  readonly question_type: string;
  readonly prompt: string;
  readonly media_url: string | null;
  readonly order_index: number;
  /** Server-side only. Never sent to clients. */
  readonly correct_answer: string;
  readonly skill_code: string | null; // from primary skill join (may be null if no primary skill set)
  readonly created_at: string;
  readonly updated_at: string;
}

// ---------------------------------------------------------------------------
// Student-safe response shapes (sent to Flutter)
// ---------------------------------------------------------------------------

/**
 * A single placement question safe for delivery to a student.
 *
 * NEVER includes: correct_answer, skill_id, skill_code, weight, difficultyScore.
 * Defined by P4-011 §4 (student-safe fields).
 *
 * Field names use snake_case to match the Flutter PlacementQuestionModel.fromJson() contract.
 */
export interface PlacementQuestionSafeResponse {
  readonly id: string;
  readonly section_id: string;
  readonly text: string;
  readonly options: Array<{ id: string; text: string }>;
  readonly type: string;
  readonly media_url: string | null;
  readonly ordinal: number;
  // Note: skill_code intentionally excluded — internal scoring field.
  // Note: correct_answer intentionally excluded — must never be sent to students.
}

/** Response type for GET /placement/questions — raw array, no envelope. */
export type PlacementQuestionDeliveryResponse = PlacementQuestionSafeResponse[];

// ---------------------------------------------------------------------------
// Placement test DB row (internal — never sent to clients in full)
// ---------------------------------------------------------------------------

/** Raw row from placement_tests as returned by pg. */
export interface PlacementTestRow {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly estimated_minutes: number;
  readonly total_sections: number;
  readonly version: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly published_at: string | null;
}

// ---------------------------------------------------------------------------
// Placement attempt DB row and response shapes (P4-013)
// ---------------------------------------------------------------------------

/** Raw row from placement_attempts as returned by pg. */
export interface PlacementAttemptRow {
  readonly id: string;
  readonly student_id: string;
  readonly placement_test_id: string;
  readonly status: string;
  readonly started_at: string;
  readonly submitted_at: string | null;
  readonly completed_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Student-safe response for POST /placement/attempts (start attempt).
 * student_id and created_at are intentionally excluded (P4-013 §3.1).
 */
export interface PlacementAttemptStartResponse {
  readonly id: string;
  readonly placement_test_id: string;
  readonly status: 'active';
  readonly started_at: string;
  readonly submitted_at: null;
  readonly completed_at: null;
}

/**
 * Student-safe response for POST /placement/attempts/:id/complete.
 * Defined by P4-013 §3.2 and the API map endpoint #6.
 * student_id and created_at are intentionally excluded.
 * Scoring, level, skill maps are NEVER included — computed by P4-046.
 */
export interface PlacementAttemptCompleteResponse {
  readonly id: string;
  readonly placement_test_id: string;
  readonly status: 'submitted';
  readonly started_at: string;
  readonly submitted_at: string;
  readonly completed_at: null;
}

// ---------------------------------------------------------------------------
// Placement answer DB row and response shapes (P4-012)
// ---------------------------------------------------------------------------

/** Raw row from placement_answers as returned by pg. */
export interface PlacementAnswerRow {
  readonly id: string;
  readonly placement_attempt_id: string;
  readonly placement_question_id: string;
  readonly answer_value: string;
  /** Null during active attempt — evaluated by backend only after submission. */
  readonly is_correct: boolean | null;
  readonly skill_code: string;
  readonly created_at: string;
}

/**
 * Request body for POST /placement/attempts/:id/answers.
 * Defined by P4-012 §3.1.
 */
export interface SubmitPlacementAnswerRequest {
  readonly placement_question_id: string;
  readonly answer_value: string;
}

/**
 * Student-safe response for POST /placement/attempts/:id/answers.
 * Defined by P4-012 §3.1 (response shape).
 * Fields NEVER included: is_correct, skill_code.
 */
export interface SubmitPlacementAnswerResponse {
  readonly id: string;
  readonly placement_attempt_id: string;
  readonly placement_question_id: string;
  readonly answer_value: string;
  readonly created_at: string;
}
