-- P8-018: Create AI Chat Sessions Migration
-- Branch: phase8/P8-018-ai-chat-sessions-migration
-- Dependency: P8-010 (Backend AI Teacher Feature Skeleton — Done)
-- Scope: Persists AI Teacher chat sessions per student.
--        A session is created when a student opens the AI Teacher chat.
--        It carries the context reference (lesson/topic identifier) that
--        seeds the Context Builder (Group D). The session is backend-owned:
--        student_id is resolved server-side from the authenticated JWT,
--        never accepted from the client payload.
--
-- Authority boundary rules enforced at this migration layer:
--   - student_id is a backend-resolved FK to users(id); never taken verbatim
--     from a client-supplied field.
--   - context_ref stores the client-supplied lesson/topic identifier only
--     after backend validation; it is consumed read-only by the Context Builder
--     and does not contain AIM Engine mastery, level, weakness, difficulty,
--     recommendation, or review-schedule values.
--   - No mastery, level, weakness, difficulty, recommendation, or review-schedule
--     columns exist in this table; those remain AIM Engine authority.
--   - No AI provider keys, Supabase service-role keys, or secrets are stored here.
--
-- Scope guard:
--   - No AI Teacher message data (separate P8-019 migration).
--   - No payment tables.
--   - No parent dashboard tables.
--   - No admin dashboard tables.
--   - No Student Web App tables.
--   - No client authority introduced.

-- ============================================================
-- Table: ai_chat_sessions
-- ============================================================

CREATE TABLE ai_chat_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID        NOT NULL
                                REFERENCES users (id)
                                ON DELETE CASCADE,

    context_ref     TEXT        NOT NULL,

    status          TEXT        NOT NULL DEFAULT 'active',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_chat_sessions_status_check
        CHECK (status IN ('active', 'closed')),

    CONSTRAINT ai_chat_sessions_context_ref_not_empty_check
        CHECK (char_length(trim(context_ref)) > 0)
);

COMMENT ON TABLE ai_chat_sessions IS
    'Backend-owned AI Teacher chat sessions per student. One session maps to one AI Teacher conversation. Created by the backend on POST /ai-teacher/sessions; student_id is always resolved from the authenticated JWT, never from a client-supplied value.';

COMMENT ON COLUMN ai_chat_sessions.id IS
    'Primary key. Backend-issued UUID returned to the client as the session identifier.';

COMMENT ON COLUMN ai_chat_sessions.student_id IS
    'FK to users(id). Backend-resolved from authenticated JWT. Never accepted from the client payload. Cascades on user deletion.';

COMMENT ON COLUMN ai_chat_sessions.context_ref IS
    'Lesson or topic identifier supplied by the client on session creation and validated by the backend before storage. Consumed read-only by the Context Builder (Group D) to seed lesson-aware context. Contains no mastery, level, weakness, difficulty, recommendation, or review-schedule data.';

COMMENT ON COLUMN ai_chat_sessions.status IS
    'Lifecycle status of the session. One of: active (session is open and accepting messages), closed (session ended, no further messages accepted).';

COMMENT ON COLUMN ai_chat_sessions.created_at IS
    'ISO-8601 UTC timestamp when the session was created by the backend.';

COMMENT ON COLUMN ai_chat_sessions.updated_at IS
    'ISO-8601 UTC timestamp of the last backend update to this session row (e.g. status change).';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX ai_chat_sessions_student_id_idx
    ON ai_chat_sessions (student_id);

CREATE INDEX ai_chat_sessions_student_id_status_idx
    ON ai_chat_sessions (student_id, status);

CREATE INDEX ai_chat_sessions_student_id_created_at_idx
    ON ai_chat_sessions (student_id, created_at DESC);

CREATE INDEX ai_chat_sessions_status_idx
    ON ai_chat_sessions (status);
