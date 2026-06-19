-- P8-022: Create AI Safety Events Migration
-- Branch: phase8/P8-022-ai-teacher-safety-events-migration
-- Dependency: P8-019 (Create AI Chat Messages Table)
-- Scope: Tracks Safety Filtering (input/output) events and policy decisions
--        for AI Teacher chat (per docs/phase-8/ai-teacher-architecture.md
--        and docs/phase-8/ai-teacher-error-policy.md). Each row records
--        that a safety check ran and what it decided, for audit/observability,
--        not the rejected raw content itself.
--
-- Authority boundary rules enforced at this migration layer:
--   - session_id is a backend-resolved FK to ai_chat_sessions(id); never
--     accepted from the client without session ownership validation.
--   - direction distinguishes input (student message) from output
--     (AI provider response) safety checks.
--   - decision records only the filter's outcome (allowed/rejected); it
--     carries no mastery, level, weakness, difficulty, recommendation, or
--     review-schedule semantics.
--   - reason_category is a safe, non-internal category only (e.g.
--     unsafe_content, off_topic); never the raw rejected text, per
--     docs/phase-8/ai-teacher-error-policy.md's "no internals in
--     responses" rule.
--   - No AI provider keys, Supabase service-role keys, or secrets are
--     stored here.
--
-- Scope guard:
--   - No chat message content storage (separate P8-019 migration).
--   - No provider call metadata (separate P8-021 migration).
--   - No payment tables.
--   - No parent dashboard tables.
--   - No admin dashboard tables.
--   - No Student Web App tables.
--   - No client authority introduced.

-- ============================================================
-- Table: ai_safety_events
-- ============================================================

CREATE TABLE ai_safety_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL
                                REFERENCES ai_chat_sessions (id)
                                ON DELETE CASCADE,

    direction       TEXT        NOT NULL,
    decision        TEXT        NOT NULL,
    reason_category TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_safety_events_direction_check
        CHECK (direction IN ('input', 'output')),

    CONSTRAINT ai_safety_events_decision_check
        CHECK (decision IN ('allowed', 'rejected')),

    CONSTRAINT ai_safety_events_reason_requires_rejected_check
        CHECK (reason_category IS NULL OR decision = 'rejected')
);

COMMENT ON TABLE ai_safety_events IS
    'Backend-written audit log of Safety Filtering decisions (input and output) for AI Teacher chat. Records that a safety check ran and its outcome, never the rejected raw message/response content.';

COMMENT ON COLUMN ai_safety_events.id IS
    'Primary key. Backend-issued UUID for this safety event.';

COMMENT ON COLUMN ai_safety_events.session_id IS
    'FK to ai_chat_sessions(id). Backend-resolved after ownership validation. Cascades on session deletion.';

COMMENT ON COLUMN ai_safety_events.direction IS
    'Which safety check this event records. One of: input (student message, before Context Builder), output (AI provider response, before persistence/return).';

COMMENT ON COLUMN ai_safety_events.decision IS
    'Outcome of the safety check. One of: allowed, rejected. No mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';

COMMENT ON COLUMN ai_safety_events.reason_category IS
    'Safe, non-internal rejection category (e.g. unsafe_content, off_topic). Null when decision is allowed. Never the raw rejected text, a stack trace, or provider response body.';

COMMENT ON COLUMN ai_safety_events.created_at IS
    'ISO-8601 UTC timestamp when the backend recorded this safety event.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX ai_safety_events_session_id_created_at_idx
    ON ai_safety_events (session_id, created_at DESC);

CREATE INDEX ai_safety_events_decision_idx
    ON ai_safety_events (decision);

CREATE INDEX ai_safety_events_direction_decision_idx
    ON ai_safety_events (direction, decision);
