-- P8-020: Create AI Context Snapshots Migration
-- Branch: phase8/P8-020-ai-teacher-context-snapshots-migration
-- Dependency: P8-019 (AI Chat Messages Migration — Done)
-- Scope: Persists auditable context snapshots taken by the Context Builder
--        (Group D) at the time each AI Teacher response is generated.
--        Snapshots are backend-assembled from AIM Engine outputs and curriculum
--        data; they are never sourced from client-submitted learning state.
--        Stored for observability and audit only; never returned to Flutter.
--
-- Authority boundary rules enforced at this migration layer:
--   - session_id and message_id are backend-resolved FKs; never accepted
--     verbatim from client payload.
--   - student_id is denormalized from the owning session for fast per-student
--     queries; backend-resolved from the authenticated JWT only.
--   - context_data is a JSONB blob assembled by the backend Context Builder
--     (Group D) from AIM Engine read-only outputs and curriculum data.
--     It must never contain AI provider keys, Supabase service-role keys,
--     database credentials, or raw AIM Engine internal computation state
--     beyond what Context Builder is permitted to read.
--   - No mastery, level, weakness, difficulty, recommendation, or review-schedule
--     values are computed or adjusted here; they are only referenced as
--     read-only fields within context_data if already produced by AIM Engine.
--   - context_data is never returned to Flutter; it is backend-internal only.
--
-- Scope guard:
--   - No provider logs (separate P8-021 migration).
--   - No payment tables.
--   - No parent dashboard tables.
--   - No admin dashboard tables.
--   - No Student Web App tables.
--   - No client authority introduced.
--   - No secrets or credentials stored.

-- ============================================================
-- Table: ai_context_snapshots
-- ============================================================

CREATE TABLE ai_context_snapshots (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL
                                REFERENCES ai_chat_sessions (id)
                                ON DELETE CASCADE,
    message_id      UUID        NOT NULL
                                REFERENCES ai_chat_messages (id)
                                ON DELETE CASCADE,
    student_id      UUID        NOT NULL,

    context_data    JSONB       NOT NULL DEFAULT '{}'::jsonb,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_context_snapshots_context_data_is_object_check
        CHECK (jsonb_typeof(context_data) = 'object')
);

COMMENT ON TABLE ai_context_snapshots IS
    'Backend-internal audit log of Context Builder snapshots taken at AI Teacher response time. Each row records the backend-assembled context (AIM Engine read-only outputs + curriculum data) that was fed into the Prompt Builder for a given message. Never returned to Flutter. No learning decisions are computed here.';

COMMENT ON COLUMN ai_context_snapshots.id IS
    'Primary key. Backend-issued UUID.';

COMMENT ON COLUMN ai_context_snapshots.session_id IS
    'FK to ai_chat_sessions(id). Backend-resolved. Cascades on session deletion.';

COMMENT ON COLUMN ai_context_snapshots.message_id IS
    'FK to ai_chat_messages(id) for the ai_teacher reply this snapshot was built for. Backend-resolved. Cascades on message deletion.';

COMMENT ON COLUMN ai_context_snapshots.student_id IS
    'Denormalized student FK for fast per-student audit queries. Backend-resolved from the owning session; never taken from client payload.';

COMMENT ON COLUMN ai_context_snapshots.context_data IS
    'JSONB object assembled by the Context Builder from backend-approved, read-only AIM Engine outputs and curriculum data. Must not contain AI provider keys, database credentials, service-role keys, or raw AIM Engine internal computation state. Never returned to Flutter.';

COMMENT ON COLUMN ai_context_snapshots.created_at IS
    'ISO-8601 UTC timestamp when the backend persisted this snapshot row.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE UNIQUE INDEX ai_context_snapshots_message_id_idx
    ON ai_context_snapshots (message_id);

CREATE INDEX ai_context_snapshots_session_id_idx
    ON ai_context_snapshots (session_id);

CREATE INDEX ai_context_snapshots_student_id_created_at_idx
    ON ai_context_snapshots (student_id, created_at DESC);
