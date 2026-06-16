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
 */
export interface PlacementQuestionSafeResponse {
  readonly id: string;
  readonly questionType: string;
  readonly prompt: string;
  readonly mediaUrl: string | null;
  readonly orderIndex: number;
  // Note: skill_code intentionally excluded — internal scoring field.
  // Note: correct_answer intentionally excluded — must never be sent to students.
}

/** Response envelope for GET /placement/questions. */
export interface PlacementQuestionDeliveryResponse {
  readonly questions: PlacementQuestionSafeResponse[];
}
