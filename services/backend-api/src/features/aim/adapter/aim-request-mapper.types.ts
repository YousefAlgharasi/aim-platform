/**
 * Input DTOs for the AIM Request Mapper — P5-047.
 *
 * These types represent the backend-assembled context the mapper receives
 * and converts into the AimAnalysisRawRequest sent to the AIM Engine.
 *
 * All fields are backend-resolved. No field originates from an unvalidated
 * client payload. The mapper enforces these backend-authority rules:
 *
 * - studentId is resolved from the authenticated session, never from client data.
 * - isCorrect is evaluated by the backend, never trusted from a client field.
 * - skillIds are resolved from curriculum data, not from a client-supplied value.
 * - Speed/timing fields are raw behavioral context only — never mastery inputs.
 * - No mastery, level, weakness, difficulty, recommendation, review schedule,
 *   retention, or frustration values are accepted as mapper inputs.
 *
 * Sources:
 *   packages/shared-contracts/api/aim-session-input-contracts.md  (P5-009)
 *   packages/shared-contracts/api/aim-attempt-input-contracts.md  (P5-010)
 */

// ---------------------------------------------------------------------------
// Enumerations — mirrored from the contract docs for TypeScript use
// ---------------------------------------------------------------------------

export type AimSessionType =
  | 'lesson_practice'
  | 'review_practice'
  | 'placement_followup'
  | 'adaptive_drill';

export type AimLevelSource = 'placement' | 'aim_engine';

export type AimItemType =
  | 'lesson_question'
  | 'practice_question'
  | 'review_question'
  | 'drill_question';

/** Phase 0/1 locked 1–4 difficulty scale. */
export type AimDifficultyLevel = 1 | 2 | 3 | 4;

export type AimAnswerFormat =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'listening_choice'
  | 'free_text';

// ---------------------------------------------------------------------------
// Session-level mapper input (P5-009)
// ---------------------------------------------------------------------------

export interface AimLevelContextInput {
  /** Backend-persisted level identifier. */
  readonly currentLevel: string;
  /** Whether the level came from placement or a prior AIM Engine decision. */
  readonly levelSource: AimLevelSource;
  /** ISO-8601 UTC — when this level was last set. */
  readonly levelSetAt: string;
}

export interface AimInitialSkillSignalInput {
  /** Stable skill key (backend curriculum taxonomy). */
  readonly skillId: string;
  /**
   * Backend-computed placement signal (0–1 inclusive).
   * This is NOT a mastery value; it is a placement-derived bootstrap input.
   */
  readonly signalStrength: number;
}

export interface AimPlacementContextInput {
  /** UUID reference to the Phase 4 placement result record. */
  readonly placementResultId: string;
  /** ISO-8601 UTC — when placement completed. */
  readonly placementCompletedAt: string;
  /** Backend-derived per-skill signals from placement. */
  readonly initialSkillSignals: AimInitialSkillSignalInput[];
}

export interface AimSessionBehavioralContextInput {
  /** Backend-counted items attempted in session so far. */
  readonly itemsAttemptedInSession: number;
  /** Backend-counted consecutive incorrect streak. */
  readonly consecutiveIncorrect: number;
  /** Backend-counted consecutive correct streak. */
  readonly consecutiveCorrect: number;
  /**
   * Raw average response time (ms). Behavioral context only.
   * Must never be used to compute mastery, level, or difficulty.
   */
  readonly averageResponseTimeMs: number | null;
  /** Backend-counted hesitation events. */
  readonly hesitationEventCount: number;
  /** Backend-counted retry events. */
  readonly retryEventCount: number;
  /** Backend-counted idle gaps exceeding configured threshold. */
  readonly idleGapCount: number;
}

/** Complete session-level context assembled by the backend for the AIM Engine. */
export interface AimSessionContextInput {
  /** Backend-issued session UUID. */
  readonly sessionId: string;
  /**
   * Backend-resolved student UUID — from authenticated identity, never from
   * a raw client field.
   */
  readonly studentId: string;
  /** Backend-classified session type. */
  readonly sessionType: AimSessionType;
  /** ISO-8601 UTC — when the session began. */
  readonly startedAt: string;
  /** ISO-8601 UTC — most recent backend-recorded activity. */
  readonly lastActivityAt: string;
  /** Backend-resolved skill keys from curriculum data. */
  readonly skillFocusIds: string[];
  readonly levelContext: AimLevelContextInput;
  /** Present only for the first post-placement sessions; null thereafter. */
  readonly placementContext: AimPlacementContextInput | null;
  readonly behavioralContext: AimSessionBehavioralContextInput;
  /** Contract version the backend is sending. */
  readonly contractVersion: string;
}

// ---------------------------------------------------------------------------
// Attempt-level mapper input (P5-010)
// ---------------------------------------------------------------------------

export interface AimStudentAnswerInput {
  /** Backend-classified answer format. */
  readonly format: AimAnswerFormat;
  /** Student's normalized answer value. */
  readonly value: string;
  /** Number of options presented (option-based formats only; null otherwise). */
  readonly optionsPresentedCount: number | null;
}

export interface AimAttemptBehavioralContextInput {
  /** Backend-counted answer changes before submission. */
  readonly answerChangeCount: number;
  /**
   * Raw time between first interaction and submission (ms).
   * Behavioral context only — never a mastery input.
   */
  readonly hesitationBeforeSubmitMs: number | null;
  /** Whether a backend-provided hint was shown. */
  readonly usedHint: boolean;
  /** Whether the student navigated away and returned. */
  readonly abandonedFirstThenRetried: boolean;
}

/** A single attempt's backend-assembled context for the AIM Engine. */
export interface AimAttemptContextInput {
  /** Backend-issued attempt UUID. */
  readonly attemptId: string;
  /** Session UUID — must match the accompanying session context. */
  readonly sessionId: string;
  /** Backend-issued item UUID. */
  readonly itemId: string;
  /** Backend-classified item type. */
  readonly itemType: AimItemType;
  /** Backend-resolved skill keys from curriculum data. */
  readonly skillIds: string[];
  /**
   * Difficulty at which this item was presented.
   * Informational context only — next difficulty is an AIM Engine output.
   */
  readonly presentedDifficulty: AimDifficultyLevel;
  readonly studentAnswer: AimStudentAnswerInput;
  /**
   * Backend-evaluated correctness.
   * Never trusted from a client-submitted field.
   */
  readonly isCorrect: boolean;
  /** Backend-counted ordinal (1 = first try). */
  readonly attemptNumberForItem: number;
  /** ISO-8601 UTC — when the item was presented. */
  readonly startedAt: string;
  /** ISO-8601 UTC — when the backend recorded the submission. */
  readonly submittedAt: string;
  /** Backend-computed response time (ms). Behavioral context only. */
  readonly responseTimeMs: number;
  readonly behavioralContext: AimAttemptBehavioralContextInput;
}

// ---------------------------------------------------------------------------
// Skill mastery context — prior history per skill (P20-007)
// ---------------------------------------------------------------------------
//
// Feeds the AIM Engine's ported MasteryCalculator, which needs prior mastery
// and a window of prior attempts per skill — not just the new attempt(s) in
// this call. Sourced by the backend from student_skill_states/lesson_attempts.

export interface AimRecentAttemptSnapshotInput {
  readonly isCorrect: boolean;
  readonly attemptNumberForItem: number;
  readonly presentedDifficulty: AimDifficultyLevel;
  readonly usedHint: boolean;
  /** Always false today — lesson_attempts has no skip-tracking column yet. */
  readonly skip: boolean;
}

/** One timestamped mastery/retention reading for a skill (P20-008). */
export interface AimRetentionHistoryPointInput {
  readonly recordedAt: string;
  readonly masteryScore: number;
}

export interface AimSkillMasteryContextInput {
  /** student_skill_states.mastery_score (0-100). Null if no prior state yet. */
  readonly previousMasteryScore: number | null;
  /** Most recent prior attempts for this skill, oldest first. */
  readonly recentAttempts: AimRecentAttemptSnapshotInput[];
  /** skills.domain (P20-008) — e.g. 'grammar', 'vocabulary'. Null if unresolved. */
  readonly category: string | null;
  /** student_skill_states.last_evaluated_at (P20-008). Null if no prior state yet. */
  readonly lastEvaluatedAt: string | null;
  /**
   * Timestamped mastery/retention readings (P20-008), oldest first. Always
   * empty today — the backend does not persist a rolling per-skill
   * retention history yet (a known data gap, not a fabricated value).
   */
  readonly retentionHistory: AimRetentionHistoryPointInput[];
}

// ---------------------------------------------------------------------------
// Complete pipeline context passed to the mapper (Stage 3)
// ---------------------------------------------------------------------------

export interface AimMappingContext {
  /**
   * Backend-issued UUID for this analysis request.
   * Stable across retries (idempotency key).
   */
  readonly backendRequestId: string;
  /** Correlation id for this HTTP call (X-Request-Id). */
  readonly xRequestId: string;
  readonly session: AimSessionContextInput;
  /** One or more attempts for this analysis call. */
  readonly attempts: AimAttemptContextInput[];
  /** Prior mastery/attempt-history context per skill_id (P20-007). */
  readonly skillMasteryContext: Record<string, AimSkillMasteryContextInput>;
}
