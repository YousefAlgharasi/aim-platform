// Phase 5 — P5-054
// LessonAttemptService types.
//
// Scope: Raw attempt and answer persistence for AIM Engine Integration only.
//
// Security rules:
// - studentId is always sourced from the verified JWT — never from a client payload.
// - isCorrect is always backend-evaluated — never trusted from a client field.
// - skillIds are backend-resolved from curriculum skill-mapping data — never
//   accepted verbatim from a client-supplied list.
// - attemptNumberForItem is backend-counted from existing attempt history —
//   never trusted from a client counter.
// - responseTimeMs is backend-computed (submittedAt - startedAt) — never a
//   client-pre-aggregated value.
// - No mastery, level, weakness, difficulty, recommendation, review schedule,
//   retention, or frustration field is represented here; those are exclusively
//   AIM Engine outputs persisted by features/aim.
// - No AIM Engine call is made here; features/sessions never talks to the AIM
//   Engine. Only features/aim does.
// - No AI Teacher, payments, parent dashboard, or Student Web App data here.
// - No secrets, service-role keys, database credentials, or AI provider keys here.

/** Backend-classified item type per P5-010 attempt input contract. */
export type AttemptItemType =
  | 'lesson_question'
  | 'practice_question'
  | 'review_question'
  | 'drill_question';

/** Backend-classified answer format per P5-010. */
export type AttemptAnswerFormat =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'listening_choice'
  | 'free_text';

/** Phase 0/1 locked 1–4 difficulty scale. */
export type AttemptDifficultyLevel = 1 | 2 | 3 | 4;

/** Raw row from lesson_attempts as returned by pg (P5-032). */
export interface LessonAttemptRow {
  readonly id: string;
  readonly learning_session_id: string;
  readonly student_id: string;
  readonly item_id: string;
  readonly item_type: AttemptItemType;
  readonly skill_ids: string[];
  readonly presented_difficulty: number;
  readonly answer_format: AttemptAnswerFormat;
  readonly answer_value: string;
  readonly options_presented_count: number | null;
  readonly is_correct: boolean;
  readonly attempt_number_for_item: number;
  readonly started_at: string;
  readonly submitted_at: string;
  readonly response_time_ms: number;
  readonly answer_change_count: number;
  readonly hesitation_before_submit_ms: number | null;
  readonly used_hint: boolean;
  readonly abandoned_first_then_retried: boolean;
  readonly created_at: string;
}

/** Raw row from answers as returned by pg (P5-033). */
export interface AnswerRow {
  readonly id: string;
  readonly lesson_attempt_id: string;
  readonly student_id: string;
  readonly item_id: string;
  readonly answer_format: AttemptAnswerFormat;
  readonly answer_value: string;
  readonly options_presented_count: number | null;
  readonly is_correct: boolean;
  readonly submitted_at: string;
  readonly created_at: string;
}

/** Minimal attempt count projection used to compute attempt_number_for_item. */
export interface AttemptCountRow {
  readonly count: string;
}

/** Minimal session ownership projection used to validate attempt writes. */
export interface SessionOwnershipRow {
  readonly id: string;
  readonly status: string;
}

/**
 * Input accepted by LessonAttemptService.recordAttempt.
 *
 * All backend-authority fields (isCorrect, skillIds, attemptNumberForItem,
 * responseTimeMs) must be pre-resolved by the caller using backend data —
 * never copied from a raw client payload.
 */
export interface RecordLessonAttemptInput {
  /** Backend-resolved from the authenticated session. */
  readonly studentId: string;
  readonly learningSessionId: string;
  /** Backend-issued item UUID. */
  readonly itemId: string;
  /** Backend-classified item type. */
  readonly itemType: AttemptItemType;
  /**
   * Backend-resolved skill keys from curriculum skill-mapping data.
   * Never accepted verbatim from a client-supplied list.
   */
  readonly skillIds: readonly string[];
  /** Difficulty the backend presented for this attempt (1–4 locked scale). */
  readonly presentedDifficulty: AttemptDifficultyLevel;
  /** Backend-classified answer format. */
  readonly answerFormat: AttemptAnswerFormat;
  /** Backend-normalized answer value submitted by the student. */
  readonly answerValue: string;
  /** Non-null for option-based formats; null for fill_blank / free_text. */
  readonly optionsPresentedCount: number | null;
  /**
   * Backend-evaluated correctness.
   * Never trusted from a client-submitted field.
   */
  readonly isCorrect: boolean;
  /** ISO-8601 UTC — when the item was presented to the student. */
  readonly startedAt: string;
  /** ISO-8601 UTC — when the backend recorded the answer submission. */
  readonly submittedAt: string;
  /** Backend-counted number of answer changes before submission. */
  readonly answerChangeCount?: number;
  /** Raw hesitation time in ms. Null when not separately tracked. */
  readonly hesitationBeforeSubmitMs?: number | null;
  /** Whether a backend-provided hint was shown. */
  readonly usedHint?: boolean;
  /** Whether the student navigated away and returned before submitting. */
  readonly abandonedFirstThenRetried?: boolean;
}

/** Safe response shape returned by recordAttempt. */
export interface RecordLessonAttemptResponse {
  readonly attemptId: string;
  readonly answerId: string;
  readonly attemptNumberForItem: number;
  readonly isCorrect: boolean;
  readonly submittedAt: string;
}
