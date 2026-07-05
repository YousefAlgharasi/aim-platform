// Phase 5 — P5-052
// Sessions feature types.
//
// Scope: Backend session lifecycle for AIM Engine Integration only.
//
// Security rules:
// - student_id is always resolved from the verified JWT — never from client input.
// - current_level, level_source, level_set_at are backend-resolved snapshots,
//   never accepted from a client payload.
// - session_type is backend-classified from client intent — never trusted verbatim.
// - skill_focus_ids are resolved against the curriculum skills table — never
//   accepted as a raw client-supplied list without validation.
// - No mastery, weakness, difficulty, recommendation, review schedule, or
//   frustration field is represented here; those are exclusively AIM Engine
//   outputs persisted by features/aim.
// - No AI Teacher, payments, parent dashboard, or Student Web App data here.
// - No secrets, service-role keys, database credentials, or AI provider keys here.

/** Backend-classified session type per packages/shared-contracts/api/aim-session-input-contracts.md. */
export type SessionType =
  | 'lesson_practice'
  | 'review_practice'
  | 'placement_followup'
  | 'adaptive_drill';

/** Session lifecycle status per the learning_sessions migration (P5-030). */
export type SessionStatus = 'active' | 'closed' | 'abandoned';

/** Origin of current_level on a session row. */
export type LevelSource = 'placement' | 'aim_engine';

/** Raw row from learning_sessions as returned by pg. */
export interface LearningSessionRow {
  readonly id: string;
  readonly student_id: string;
  readonly session_type: SessionType;
  readonly status: SessionStatus;
  readonly started_at: string;
  readonly last_activity_at: string;
  readonly closed_at: string | null;
  readonly current_level: string;
  readonly level_source: LevelSource;
  readonly level_set_at: string;
  readonly skill_focus_ids: readonly string[];
  readonly placement_result_id: string | null;
  readonly placement_completed_at: string | null;
  readonly contract_version: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/** Minimal placement_results projection used to bootstrap session level context. */
export interface LatestPlacementResultRow {
  readonly id: string;
  readonly estimated_level: string;
  readonly completed_at: string;
}

/** Input accepted by SessionsService.startSession. studentId is never client-supplied. */
export interface StartSessionInput {
  readonly studentId: string;
  /**
   * Internal `users.id` for the same student, resolved separately from
   * `studentId`. Bugfix: `studentId` here is the raw Supabase auth UID
   * (kept as-is since placement_attempts/learning_sessions already store
   * that convention), but analytics_events.actor_id has a real FK to
   * users.id — passing the raw auth UID there violated the FK constraint
   * and crashed every session-start request with a 500.
   */
  readonly internalUserId: string;
  readonly sessionType: SessionType;
  /** Already-validated curriculum skill keys this session focuses on. May be empty. */
  readonly skillFocusIds?: readonly string[];
}

/** The AIM contract version this backend declares when assembling AimSessionInput. */
export const AIM_SESSION_INPUT_CONTRACT_VERSION = '1.0';

/** Student-safe response shape returned by startSession. */
export interface StartSessionResponse {
  readonly id: string;
  readonly sessionType: SessionType;
  readonly status: SessionStatus;
  readonly startedAt: string;
  readonly currentLevel: string;
  readonly skillFocusIds: readonly string[];
}

/** Raw behavioral signal category per the session_events migration (P5-031). */
export type SessionEventType =
  | 'item_presented'
  | 'item_submitted'
  | 'hesitation'
  | 'retry'
  | 'idle_gap';

/** Raw row from session_events as returned by pg. */
export interface SessionEventRow {
  readonly id: string;
  readonly learning_session_id: string;
  readonly student_id: string;
  readonly event_type: SessionEventType;
  readonly item_id: string | null;
  readonly response_time_ms: number | null;
  readonly payload: Record<string, unknown>;
  readonly occurred_at: string;
  readonly recorded_at: string;
}

/** Minimal session ownership/state projection used to validate event writes. */
export interface ActiveSessionOwnershipRow {
  readonly id: string;
}

/** Input accepted by SessionEventService.recordEvent. studentId is never client-supplied. */
export interface RecordSessionEventInput {
  readonly learningSessionId: string;
  readonly studentId: string;
  readonly eventType: SessionEventType;
  readonly itemId?: string;
  readonly responseTimeMs?: number;
  readonly payload?: Record<string, unknown>;
  /** When the underlying client action occurred. Defaults to now() if omitted. */
  readonly occurredAt?: string;
}

/** Safe response shape returned by recordEvent. */
export interface RecordSessionEventResponse {
  readonly id: string;
  readonly eventType: SessionEventType;
  readonly occurredAt: string;
}
