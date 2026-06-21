-- P9-018: Create Voice Sessions Table
-- Branch: phase9/P9-018-voice-sessions-migration
-- Dependency: P9-012 (Define Voice Session Contract — Done)
-- Scope: Persists AI Teacher Voice Mode sessions per student, matching the
--        Session Contract shape fixed in docs/phase-9/voice-session-contract.md.
--        A session is created when a student opens AI Teacher Voice Mode. It
--        carries the context reference (lesson/topic identifier) that seeds
--        the Context Builder (Phase 8, reused). The session is backend-owned:
--        student_id is resolved server-side from the authenticated JWT, never
--        accepted from the client payload. Mirrors the Phase 8
--        ai_chat_sessions migration (P8-018), adapted for voice mode.
--
-- Authority boundary rules enforced at this migration layer:
--   - student_id is a backend-resolved FK to users(id); never taken verbatim
--     from a client-supplied field.
--   - context_ref stores the client-supplied lesson/topic identifier only
--     after backend validation; it is consumed read-only by the Context
--     Builder and does not contain AIM Engine mastery, level, weakness,
--     difficulty, recommendation, or review-schedule values.
--   - No mastery, level, weakness, difficulty, recommendation, or
--     review-schedule columns exist in this table; those remain AIM Engine
--     authority (docs/phase-9/no-aim-authority-change-rule.md).
--   - No STT/TTS/AI provider keys, Supabase service-role keys, or secrets are
--     stored here (docs/phase-9/no-client-provider-rule.md).
--   - No raw audio file path or byte payload is stored here; voice turns
--     (separate P9-019/P9-020 migrations) reference audio only via an opaque
--     audioRef.
--
-- Scope guard:
--   - No voice message/turn data (separate P9-019 migration).
--   - No voice audio asset data (separate P9-020 migration).
--   - No voice transcript data (separate P9-021 migration).
--   - No payment, parent dashboard, admin dashboard, or Student Web App
--     tables.
--   - No client authority introduced.

-- ============================================================
-- Table: voice_sessions
-- ============================================================

CREATE TABLE voice_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID        NOT NULL
                                REFERENCES users (id)
                                ON DELETE CASCADE,

    context_ref     TEXT        NOT NULL,

    status          TEXT        NOT NULL DEFAULT 'active',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT voice_sessions_status_check
        CHECK (status IN ('active', 'ended')),

    CONSTRAINT voice_sessions_context_ref_not_empty_check
        CHECK (char_length(trim(context_ref)) > 0)
);

COMMENT ON TABLE voice_sessions IS
    'Backend-owned AI Teacher Voice Mode sessions per student. One session maps to one voice conversation, matching docs/phase-9/voice-session-contract.md. Created by the backend on session start; student_id is always resolved from the authenticated JWT, never from a client-supplied value.';

COMMENT ON COLUMN voice_sessions.id IS
    'Primary key. Backend-issued UUID returned to the client as sessionId.';

COMMENT ON COLUMN voice_sessions.student_id IS
    'FK to users(id). Backend-resolved from authenticated JWT. Never accepted from the client payload. Cascades on user deletion.';

COMMENT ON COLUMN voice_sessions.context_ref IS
    'Lesson or topic identifier supplied by the client on session creation and validated by the backend before storage. Consumed read-only by the Context Builder to seed lesson-aware context. Contains no mastery, level, weakness, difficulty, recommendation, or review-schedule data.';

COMMENT ON COLUMN voice_sessions.status IS
    'Lifecycle status of the session, matching the Session Contract. One of: active (session is open and accepting turns), ended (session closed, no further turns accepted).';

COMMENT ON COLUMN voice_sessions.created_at IS
    'ISO-8601 UTC timestamp when the session was created by the backend.';

COMMENT ON COLUMN voice_sessions.updated_at IS
    'ISO-8601 UTC timestamp of the last backend update to this session row (e.g. status change).';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX voice_sessions_student_id_idx
    ON voice_sessions (student_id);

CREATE INDEX voice_sessions_student_id_status_idx
    ON voice_sessions (student_id, status);

CREATE INDEX voice_sessions_student_id_created_at_idx
    ON voice_sessions (student_id, created_at DESC);

CREATE INDEX voice_sessions_status_idx
    ON voice_sessions (status);
