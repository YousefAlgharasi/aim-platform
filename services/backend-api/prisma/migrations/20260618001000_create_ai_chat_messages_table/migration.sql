-- P8-019: Create AI Chat Messages Migration
-- Branch: phase8/P8-019-ai-chat-messages-migration
-- Dependency: P8-018 (AI Chat Sessions Migration — Done)
-- Scope: Persists student and AI Teacher messages per chat session.
--        Each row is one message in an AI Teacher conversation.
--        All rows are backend-written: student messages are written after
--        safety filtering; AI Teacher replies are written after provider
--        response and output safety filtering. Flutter never writes
--        directly to this table.
--
-- Authority boundary rules enforced at this migration layer:
--   - session_id is a backend-resolved FK to ai_chat_sessions(id); never
--     accepted from the client without session ownership validation.
--   - student_id is denormalized from the owning session for fast per-student
--     queries; the backend always resolves it from the authenticated JWT,
--     never from a client-supplied field.
--   - role is restricted to 'student' and 'ai_teacher'. It does not represent
--     any mastery, level, weakness, difficulty, recommendation, or review-schedule
--     decision.
--   - text stores display-safe message content only. Provider raw responses,
--     internal prompt content, context snapshots, and AIM Engine raw fields
--     are never stored in this column.
--   - No AI provider keys, Supabase service-role keys, or secrets are stored here.
--
-- Scope guard:
--   - No provider metadata or logs (separate P8-021 migration).
--   - No context snapshot storage (separate migration).
--   - No payment tables.
--   - No parent dashboard tables.
--   - No admin dashboard tables.
--   - No Student Web App tables.
--   - No client authority introduced.

-- ============================================================
-- Table: ai_chat_messages
-- ============================================================

CREATE TABLE ai_chat_messages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL
                                REFERENCES ai_chat_sessions (id)
                                ON DELETE CASCADE,
    student_id      UUID        NOT NULL,

    role            TEXT        NOT NULL,
    text            TEXT        NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_chat_messages_role_check
        CHECK (role IN ('student', 'ai_teacher')),

    CONSTRAINT ai_chat_messages_text_not_empty_check
        CHECK (char_length(trim(text)) > 0)
);

COMMENT ON TABLE ai_chat_messages IS
    'Backend-written AI Teacher chat messages per session. Stores display-safe student messages (after input safety filtering) and AI Teacher replies (after output safety filtering). Provider raw responses, prompt internals, and AIM Engine data are never stored here.';

COMMENT ON COLUMN ai_chat_messages.id IS
    'Primary key. Backend-issued UUID.';

COMMENT ON COLUMN ai_chat_messages.session_id IS
    'FK to ai_chat_sessions(id). Backend-resolved after ownership validation. Cascades on session deletion.';

COMMENT ON COLUMN ai_chat_messages.student_id IS
    'Denormalized student FK for fast per-student message queries. Backend-resolved from the owning session; never taken from client payload.';

COMMENT ON COLUMN ai_chat_messages.role IS
    'Message author role. One of: student (input after safety filter), ai_teacher (output after safety filter). No mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';

COMMENT ON COLUMN ai_chat_messages.text IS
    'Display-safe message text. For student role: content after input safety filtering. For ai_teacher role: content after output safety filtering. Never contains provider raw response, internal prompt text, context snapshot data, or AIM Engine internals.';

COMMENT ON COLUMN ai_chat_messages.created_at IS
    'ISO-8601 UTC timestamp when the backend persisted this message row.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX ai_chat_messages_session_id_created_at_idx
    ON ai_chat_messages (session_id, created_at ASC);

CREATE INDEX ai_chat_messages_student_id_created_at_idx
    ON ai_chat_messages (student_id, created_at DESC);

CREATE INDEX ai_chat_messages_session_id_role_idx
    ON ai_chat_messages (session_id, role);
