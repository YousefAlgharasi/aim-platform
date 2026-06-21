-- P9-023: Create Voice Safety Events Table
-- Branch: phase9/P9-023-voice-safety-events-migration
-- Dependency: P9-019 (Create Voice Messages Table — Done)
-- Scope: Tracks Safety Filtering (input/output) events and policy decisions
--        for AI Teacher Voice Mode sessions, mirroring the Phase 8
--        ai_safety_events table (P8-022) but scoped to voice_sessions.
--        Each row records that a safety check ran and what it decided,
--        for audit/observability — never the rejected raw content itself.
--        Follows the error policy in docs/phase-9/voice-error-policy.md
--        and the architecture in docs/phase-9/voice-architecture.md.
--
-- Authority boundary rules enforced at this migration layer:
--   - session_id is a backend-resolved FK to voice_sessions(id); never
--     accepted from the client without session ownership validation.
--   - message_id is an optional FK to voice_messages(id) linking the
--     safety event to a specific voice turn; backend-resolved only.
--   - direction distinguishes input (student audio/transcript) from
--     output (AI provider response / TTS output) safety checks.
--   - decision records only the filter's outcome (allowed/rejected); it
--     carries no mastery, level, weakness, difficulty, recommendation, or
--     review-schedule semantics.
--   - reason_category is a safe, non-internal category only (e.g.
--     unsafe_content, off_topic); never the raw rejected text, a stack
--     trace, or provider response body, per
--     docs/phase-9/voice-error-policy.md.
--   - No STT/TTS/AI provider keys, Supabase service-role keys, or secrets
--     are stored here.
--
-- Scope guard:
--   - No voice message content storage (separate P9-019 migration).
--   - No voice audio asset storage (separate P9-020 migration).
--   - No voice transcript storage (separate P9-021 migration).
--   - No voice provider log storage (separate P9-022 migration).
--   - No voice feedback storage (separate P9-024 migration).
--   - No payment, parent dashboard, admin dashboard, or Student Web App
--     tables.
--   - No client authority introduced.

-- ============================================================
-- Table: voice_safety_events
-- ============================================================

CREATE TABLE voice_safety_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL
                                REFERENCES voice_sessions (id)
                                ON DELETE CASCADE,
    message_id      UUID        REFERENCES voice_messages (id)
                                ON DELETE SET NULL,

    direction       TEXT        NOT NULL,
    decision        TEXT        NOT NULL,
    reason_category TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT voice_safety_events_direction_check
        CHECK (direction IN ('input', 'output')),

    CONSTRAINT voice_safety_events_decision_check
        CHECK (decision IN ('allowed', 'rejected')),

    CONSTRAINT voice_safety_events_reason_requires_rejected_check
        CHECK (reason_category IS NULL OR decision = 'rejected')
);

COMMENT ON TABLE voice_safety_events IS
    'Backend-written audit log of Safety Filtering decisions (input and output) for AI Teacher Voice Mode. Records that a safety check ran and its outcome, never the rejected raw audio/transcript/response content. Flutter never writes directly to this table.';

COMMENT ON COLUMN voice_safety_events.id IS
    'Primary key. Backend-issued UUID for this safety event.';

COMMENT ON COLUMN voice_safety_events.session_id IS
    'FK to voice_sessions(id). Backend-resolved after session ownership validation. Cascades on session deletion.';

COMMENT ON COLUMN voice_safety_events.message_id IS
    'Optional FK to voice_messages(id) linking this safety event to a specific voice turn. Backend-resolved only. Set to NULL if the referenced message is deleted.';

COMMENT ON COLUMN voice_safety_events.direction IS
    'Which safety check this event records. One of: input (student audio/transcript, before AI processing), output (AI provider response / TTS output, before persistence/return).';

COMMENT ON COLUMN voice_safety_events.decision IS
    'Outcome of the safety check. One of: allowed, rejected. A filter outcome only; carries no mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';

COMMENT ON COLUMN voice_safety_events.reason_category IS
    'Safe, non-internal rejection category (e.g. unsafe_content, off_topic). Null when decision is allowed. Never the raw rejected text, a stack trace, or provider response body.';

COMMENT ON COLUMN voice_safety_events.created_at IS
    'ISO-8601 UTC timestamp when the backend recorded this safety event.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX voice_safety_events_session_id_created_at_idx
    ON voice_safety_events (session_id, created_at DESC);

CREATE INDEX voice_safety_events_decision_idx
    ON voice_safety_events (decision);

CREATE INDEX voice_safety_events_direction_decision_idx
    ON voice_safety_events (direction, decision);

CREATE INDEX voice_safety_events_message_id_idx
    ON voice_safety_events (message_id)
    WHERE message_id IS NOT NULL;
