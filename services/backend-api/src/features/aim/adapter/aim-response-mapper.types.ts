/**
 * Validated backend DTOs for AIM Engine response categories — P5-048.
 *
 * These types represent the result of Stage 5 (response validation + mapping).
 * They are what the persistence layer (Stage 6) receives — fully validated,
 * typed, and safe to write to the database.
 *
 * Key invariants enforced by the mapper before producing these DTOs:
 * - Envelope correlation (backendRequestId, studentId, sessionId) verified.
 * - contractVersion checked against supported versions.
 * - Every category field range/enum is validated.
 * - Invalid category entries are dropped; valid ones proceed.
 * - No unvalidated data reaches the persistence layer.
 *
 * Sources:
 *   packages/shared-contracts/api/aim-engine-response-contracts.md  (P5-011)
 *   packages/shared-contracts/api/student-skill-state-contracts.md  (P5-012)
 *   packages/shared-contracts/api/weakness-record-contracts.md      (P5-013)
 *   packages/shared-contracts/api/difficulty-decision-contracts.md  (P5-014)
 *   packages/shared-contracts/api/aim-recommendation-contracts.md   (P5-015)
 *   packages/shared-contracts/api/review-schedule-contracts.md      (P5-016)
 *   packages/shared-contracts/api/aim-session-summary-contracts.md  (P5-017)
 */

// ---------------------------------------------------------------------------
// Skill state (P5-012)
// ---------------------------------------------------------------------------

export type AimMasteryTrend = 'improving' | 'stable' | 'declining' | 'insufficient_data';

export interface AimValidatedSkillState {
  readonly skillId: string;
  readonly masteryScore: number;         // 0.00–1.00
  readonly masteryConfidence: number;    // 0.00–1.00
  readonly masteryTrend: AimMasteryTrend;
  readonly attemptsConsideredCount: number;
  readonly lastAttemptId: string;
  readonly evaluatedAt: string;          // ISO-8601 UTC
}

// ---------------------------------------------------------------------------
// Weakness records (P5-013)
// ---------------------------------------------------------------------------

export type AimWeaknessSeverity = 'emerging' | 'developing' | 'critical';
export type AimWeaknessStatus = 'open' | 'improving' | 'resolved';

export interface AimValidatedWeaknessRecord {
  readonly weaknessId: string;
  readonly skillId: string;
  readonly severity: AimWeaknessSeverity;
  readonly status: AimWeaknessStatus;
  readonly triggerAttemptIds: string[];
  readonly detectedAt: string;          // ISO-8601 UTC
  readonly resolvedAt: string | null;   // ISO-8601 UTC or null
}

// ---------------------------------------------------------------------------
// Difficulty decision (P5-014)
// ---------------------------------------------------------------------------

export type AimDifficultyLevel = 1 | 2 | 3 | 4;
export type AimDifficultyRationale =
  | 'mastery_increase'
  | 'mastery_decrease'
  | 'consistent_performance'
  | 'insufficient_data_hold';

export interface AimValidatedDifficultyDecision {
  readonly decisionId: string;
  readonly skillId: string;
  readonly nextDifficulty: AimDifficultyLevel;
  readonly previousDifficulty: AimDifficultyLevel;
  readonly rationale: AimDifficultyRationale;
  readonly basedOnAttemptIds: string[];
  readonly decidedAt: string;           // ISO-8601 UTC
}

// ---------------------------------------------------------------------------
// Recommendations (P5-015)
// ---------------------------------------------------------------------------

export type AimRecommendationKind =
  | 'lesson'
  | 'targeted_practice'
  | 'review_session';

export type AimRecommendationReason =
  | 'addresses_weakness'
  | 'reinforces_recent_skill'
  | 'next_in_sequence'
  | 'review_due';

export interface AimValidatedRecommendation {
  readonly recommendationId: string;
  readonly kind: AimRecommendationKind;
  readonly targetSkillId: string;
  readonly targetLessonId: string | null;
  readonly rank: number;
  readonly reason: AimRecommendationReason;
  readonly basedOnWeaknessId: string | null;
  readonly generatedAt: string;         // ISO-8601 UTC
  readonly expiresAt: string | null;    // ISO-8601 UTC or null
}

// ---------------------------------------------------------------------------
// Review schedule (P5-016)
// ---------------------------------------------------------------------------

export interface AimValidatedReviewSchedule {
  readonly scheduleId: string;
  readonly skillId: string;
  readonly dueAt: string;               // ISO-8601 UTC
  readonly intervalDays: number;
  readonly repetitionCount: number;
  readonly basedOnAttemptId: string;
  readonly scheduledAt: string;         // ISO-8601 UTC
}

// ---------------------------------------------------------------------------
// Session summary (P5-017)
// ---------------------------------------------------------------------------

export type AimMasteryShiftDirection = 'positive' | 'neutral' | 'negative' | 'mixed';
export type AimFrustrationLevel = 'none' | 'low' | 'moderate' | 'elevated';
export type AimEngagementLevel = 'low' | 'typical' | 'high';
export type AimSignalBasis =
  | 'repeated_incorrect_streak'
  | 'increased_hesitation'
  | 'increased_retry_rate'
  | 'session_abandonment_pattern'
  | 'sustained_correct_streak';

export interface AimValidatedSessionSummary {
  readonly sessionId: string;
  readonly itemsAttempted: number;
  readonly itemsCorrect: number;
  readonly skillsTouched: string[];
  readonly overallMasteryShift: AimMasteryShiftDirection;
  readonly frustrationLevel: AimFrustrationLevel;
  readonly engagementLevel: AimEngagementLevel;
  readonly signalBasis: AimSignalBasis[];
  readonly closedOutAt: string;         // ISO-8601 UTC
}

// ---------------------------------------------------------------------------
// Complete validated response (output of Stage 5)
// ---------------------------------------------------------------------------

export interface AimValidatedCategories {
  readonly skillState: AimValidatedSkillState[];
  readonly weaknessRecords: AimValidatedWeaknessRecord[];
  readonly difficultyDecision: AimValidatedDifficultyDecision | null;
  readonly recommendations: AimValidatedRecommendation[];
  readonly reviewSchedule: AimValidatedReviewSchedule[];
  readonly sessionSummary: AimValidatedSessionSummary | null;
}

export interface AimValidatedResponse {
  /** Echoes the originating backend_request_id for correlation. */
  readonly backendRequestId: string;
  readonly contractVersion: string;
  readonly studentId: string;
  readonly sessionId: string;
  readonly generatedAt: string;
  readonly categories: AimValidatedCategories;
  /** Codes of any category entries that were dropped during validation. */
  readonly droppedValidationCodes: string[];
}

// ---------------------------------------------------------------------------
// Mapping failure — returned when the envelope itself is malformed
// ---------------------------------------------------------------------------

export interface AimResponseMappingFailure {
  readonly ok: false;
  readonly failureCode: string;
  readonly reason: string;
}

export type AimResponseMappingResult =
  | { readonly ok: true; readonly response: AimValidatedResponse }
  | AimResponseMappingFailure;
