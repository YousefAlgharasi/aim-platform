// Phase 4 — P4-041
// Placement feature types.
//
// Scope: Placement Test system only.
//
// Security rules:
// - student_id is always sourced from the verified JWT — never from client input.
// - Backend is the sole authority for attempt status transitions.
// - Flutter/client must never receive correct_answer, is_correct, or scoring data.
// - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard data here.
// - No secrets, service-role keys, database credentials, or privileged config here.

// ---------------------------------------------------------------------------
// DB row types (internal — never sent directly to clients)
// ---------------------------------------------------------------------------

/** Raw row from placement_tests as returned by pg. */
export interface PlacementTestRow {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly estimated_minutes: number;
  readonly total_sections: number;
  readonly created_at: string;
  readonly updated_at: string;
}

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

// ---------------------------------------------------------------------------
// Student-safe response shapes (sent to Flutter)
// ---------------------------------------------------------------------------

/**
 * Response for POST /placement/attempts (start attempt).
 * Defined by P4-013 §3.1 student-safe fields.
 * student_id and created_at are intentionally excluded (internal fields).
 */
export interface PlacementAttemptStartResponse {
  readonly id: string;
  readonly placementTestId: string;
  readonly status: 'active';
  readonly startedAt: string;
}
