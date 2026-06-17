-- P5-042: Add AIM Integration Indexes
-- Branch: phase5/P5-042-aim-integration-indexes
-- Dependencies: P5-029 through P5-041 (all Phase 5 AIM state/output tables)
-- Scope: Cross-table composite indexes for the AIM pipeline's Stage 3 state
--        assembly service and Stage 6 persistence services.
--
-- Purpose:
--   Each Phase 5 table migration (P5-029 through P5-041) added indexes for
--   single-table access patterns. This migration adds the remaining indexes
--   that optimize multi-table access patterns unique to the AIM integration
--   pipeline:
--
--   1. State assembly (Stage 3): reads student_skill_states, weakness_records,
--      difficulty_decisions, recommendations, review_schedules, mistakes, and
--      error_patterns in a single pipeline pass to build the AIM request
--      context. Needs fast per-student, per-skill lookups with recency ordering.
--
--   2. Persistence (Stage 6): writes AIM outputs back to the same tables.
--      Needs fast existence checks (upsert paths) on (student_id, skill_id).
--
--   3. AIM result read APIs (Stage 9): serve client-facing snapshots of
--      AIM state. Needs covered indexes for common projections.
--
--   4. Audit trail queries: correlate audit log entries with the pipeline
--      execution they belong to across multiple tables.
--
-- Index naming convention:
--   aim_idx_<table_abbreviation>_<columns>_<purpose_suffix>
--   Table abbreviations:
--     sss  = student_skill_states
--     wr   = weakness_records
--     dd   = difficulty_decisions
--     rec  = recommendations
--     rs   = review_schedules
--     ss   = session_summaries
--     la   = lesson_attempts
--     se   = session_events
--     mis  = mistakes
--     ep   = error_patterns
--     aal  = aim_audit_log
--     ans  = answers
--
-- All indexes use CONCURRENTLY-compatible syntax (standard CREATE INDEX).
-- No table schema changes — additive only.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Group 1: student_skill_states — state assembly + persistence upsert
-- ============================================================

-- State assembly reads the most recently evaluated skill state per student.
-- Ordered by last_evaluated_at DESC for recency-priority assembly.
CREATE INDEX aim_idx_sss_student_last_evaluated
    ON student_skill_states (student_id, last_evaluated_at DESC);

-- Persistence upsert path: existence check on (student_id, skill_id).
-- Complements the existing unique constraint to speed the upsert guard.
CREATE INDEX aim_idx_sss_student_skill_upsert
    ON student_skill_states (student_id, skill_id)
    WHERE skill_id IS NOT NULL;

-- ============================================================
-- Group 2: weakness_records — state assembly + result API
-- ============================================================

-- State assembly reads open weaknesses per student ordered by severity then
-- detected_at — most severe and most recent weaknesses prioritized for the
-- AIM Engine context (P5-013).
CREATE INDEX aim_idx_wr_student_open_severity
    ON weakness_records (student_id, severity, detected_at DESC)
    WHERE status IN ('open', 'improving');

-- Result API: fetch all weakness records for a student with their current
-- status, ordered by recency, for client-facing weakness snapshots.
CREATE INDEX aim_idx_wr_student_updated_at
    ON weakness_records (student_id, updated_at DESC);

-- ============================================================
-- Group 3: difficulty_decisions — state assembly (latest per skill)
-- ============================================================

-- State assembly needs the most recent difficulty decision per (student, skill)
-- to populate the AIM request's presentedDifficulty context (P5-014).
CREATE INDEX aim_idx_dd_student_skill_decided_at
    ON difficulty_decisions (student_id, skill_id, decided_at DESC);

-- ============================================================
-- Group 4: recommendations — state assembly + result API
-- ============================================================

-- State assembly reads active recommendations per student ordered by rank
-- ascending (rank 1 = highest priority, per P5-015).
CREATE INDEX aim_idx_rec_student_active_rank
    ON recommendations (student_id, rank ASC)
    WHERE status = 'active';

-- Result API: per-student recommendations filtered by reason for targeted
-- recommendation type queries (e.g. addresses_weakness, review_due).
CREATE INDEX aim_idx_rec_student_reason_active
    ON recommendations (student_id, reason)
    WHERE status = 'active';

-- ============================================================
-- Group 5: review_schedules — state assembly (due items)
-- ============================================================

-- State assembly reads pending/due review schedule entries per student
-- ordered by due_at ASC — soonest due first (P5-016).
CREATE INDEX aim_idx_rs_student_due_at
    ON review_schedules (student_id, due_at ASC)
    WHERE status IN ('pending', 'due');

-- ============================================================
-- Group 6: session_summaries — result API + AIM context
-- ============================================================

-- Session summaries are read per student ordered by closed_out_at DESC to
-- surface the most recent session summary for AIM context assembly (P5-017).
CREATE INDEX aim_idx_ss_student_closed_out_at
    ON session_summaries (student_id, closed_out_at DESC);

-- ============================================================
-- Group 7: lesson_attempts — state assembly behavioral context
-- ============================================================

-- State assembly assembles the AimSessionBehavioralContext (consecutive
-- streaks, response time average) from recent attempts in a session.
-- Ordered by submitted_at DESC — most recent attempt first.
CREATE INDEX aim_idx_la_session_submitted_at
    ON lesson_attempts (learning_session_id, submitted_at DESC);

-- State assembly resolves skill context for attempts per item within a
-- session. Composite (session, item) already exists; add submitted_at
-- ordering for the AIM attempt list assembly (submitted_at ASC per contract).
CREATE INDEX aim_idx_la_session_item_submitted_at
    ON lesson_attempts (learning_session_id, item_id, submitted_at ASC);

-- ============================================================
-- Group 8: session_events — behavioral context assembly
-- ============================================================

-- State assembly aggregates hesitation, retry, and idle_gap events per
-- session. Ordered by occurred_at ASC for sequential aggregation.
CREATE INDEX aim_idx_se_session_type_occurred_at
    ON session_events (learning_session_id, event_type, occurred_at ASC);

-- ============================================================
-- Group 9: mistakes — state assembly (recent unresolved per student/skill)
-- ============================================================

-- State assembly reads recent unresolved mistakes per (student, skill)
-- ordered by last_seen_at DESC for most-recent-first context assembly.
CREATE INDEX aim_idx_mis_student_skill_unresolved_recent
    ON mistakes (student_id, skill_id, last_seen_at DESC)
    WHERE is_resolved = FALSE;

-- ============================================================
-- Group 10: error_patterns — state assembly (active per student/skill)
-- ============================================================

-- State assembly reads active error patterns per (student, skill) ordered
-- by confidence DESC — highest-confidence patterns prioritized in context.
CREATE INDEX aim_idx_ep_student_skill_active_confidence
    ON error_patterns (student_id, skill_id, confidence DESC)
    WHERE is_active = TRUE;

-- ============================================================
-- Group 11: aim_audit_log — pipeline correlation queries
-- ============================================================

-- Audit trail queries correlate log entries for a given backend_request_id
-- across pipeline stages, ordered by occurred_at ASC for stage sequencing.
CREATE INDEX aim_idx_aal_request_stage_occurred_at
    ON aim_audit_log (backend_request_id, pipeline_stage, occurred_at ASC);

-- Admin / monitoring: fetch all failed pipeline executions for a student
-- ordered by recency for debugging and re-trigger decisions.
CREATE INDEX aim_idx_aal_student_outcome_occurred_at
    ON aim_audit_log (student_id, outcome, occurred_at DESC)
    WHERE outcome != 'success';

-- ============================================================
-- Group 12: answers — error-pattern classification input
-- ============================================================

-- Error pattern classification reads incorrect answers per (student, item)
-- ordered by submitted_at ASC to reconstruct the sequence of wrong answers.
CREATE INDEX aim_idx_ans_student_item_incorrect_submitted_at
    ON answers (student_id, item_id, submitted_at ASC)
    WHERE is_correct = FALSE;
