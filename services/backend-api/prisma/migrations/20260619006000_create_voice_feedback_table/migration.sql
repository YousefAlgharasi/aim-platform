-- P9-024: Create Voice Feedback Table
-- Branch: phase9/P9-024-voice-feedback-migration
-- Dependency: P9-019 (Create Voice Messages Table — Done)
-- Scope: Lets a student mark a Voice AI Teacher reply as helpful or not helpful.
--        One feedback row per AI Teacher voice message, written by the backend
--        after validating the requesting student owns the message's session.
--        Mirrors the Phase 8 ai_teacher_feedback table (P8-023) but scoped
--        to voice_messages / voice_sessions.
--
-- Authority boundary rules enforced at this migration layer:
--   - message_id is a backend-resolved FK to voice_messages(id); never
--     accepted from the client without session/message ownership validation.
--   - session_id is a backend-resolved FK to voice_sessions(id), denormalised
--     for efficient per-session queries; never accepted from the client.
--   - student_id is backend-resolved from the authenticated JWT, never from
--     a client-supplied field.
--   - rating only records the student's helpful/not-helpful judgment of a
--     voice_teacher message; it carries no mastery, level, weakness, difficulty,
--     recommendation, or review-schedule semantics and never feeds back into
--     AIM Engine decisions.
--   - No STT/TTS/AI provider keys, Supabase service-role keys, or secrets
--     are stored here.
--
-- Scope guard:
--   - No voice message content storage (separate P9-019 migration).
--   - No voice audio asset storage (separate P9-020 migration).
--   - No voice transcript storage (separate P9-021 migration).
--   - No voice provider log storage (separate P9-022 migration).
--   - No safety event storage (separate P9-023 migration).
--   - No payment, parent dashboard, admin dashboard, or Student Web App tables.
--   - No client authority introduced.

-- ============================================================
-- Table: voice_feedback
-- ============================================================

CREATE TABLE voice_feedback (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID        NOT NULL
                                REFERENCES voice_messages (id)
                                ON DELETE CASCADE,
    session_id      UUID        NOT NULL
                                REFERENCES voice_sessions (id)
                                ON DELETE CASCADE,
    student_id      UUID        NOT NULL
                                REFERENCES users (id)
                                ON DELETE CASCADE,

    rating          TEXT        NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT voice_feedback_rating_check
        CHECK (rating IN ('helpful', 'not_helpful')),

    -- One feedback row per voice message (student rates a teacher reply once)
    CONSTRAINT voice_feedback_message_id_unique
        UNIQUE (message_id)
);

COMMENT ON TABLE voice_feedback IS
    'Backend-written student feedback on a single AI Teacher voice message (helpful/not helpful). Advisory only; never feeds back into AIM Engine mastery, level, weakness, difficulty, recommendation, or review-schedule decisions. Flutter never writes directly to this table.';

COMMENT ON COLUMN voice_feedback.id IS
    'Primary key. Backend-issued UUID for this feedback row.';

COMMENT ON COLUMN voice_feedback.message_id IS
    'FK to voice_messages(id). Identifies the AI Teacher voice message being rated. Backend-resolved after session/message ownership validation. Cascades on message deletion. Enforced unique: one feedback row per message.';

COMMENT ON COLUMN voice_feedback.session_id IS
    'FK to voice_sessions(id). Denormalised from the referenced voice_messages row for efficient per-session lookups. Backend-resolved; never accepted from a client-supplied field. Cascades on session deletion.';

COMMENT ON COLUMN voice_feedback.student_id IS
    'FK to users(id). Backend-resolved from the authenticated JWT. Never accepted from a client-supplied field. Cascades on user deletion.';

COMMENT ON COLUMN voice_feedback.rating IS
    'Student judgment of the AI Teacher voice reply. One of: helpful, not_helpful. No mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';

COMMENT ON COLUMN voice_feedback.created_at IS
    'ISO-8601 UTC timestamp when the backend recorded this feedback.';

-- ============================================================
-- Indexes
-- ============================================================

-- Most common query: all feedback for a session ordered by recency
CREATE INDEX voice_feedback_session_id_created_at_idx
    ON voice_feedback (session_id, created_at DESC);

-- Per-student feedback history ordered by recency
CREATE INDEX voice_feedback_student_id_created_at_idx
    ON voice_feedback (student_id, created_at DESC);

-- Filter by rating value (e.g. analytics on helpful vs not_helpful)
CREATE INDEX voice_feedback_rating_idx
    ON voice_feedback (rating);
