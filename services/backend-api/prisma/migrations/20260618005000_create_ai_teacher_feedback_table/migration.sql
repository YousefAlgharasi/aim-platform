-- P8-023: Create AI Teacher Feedback Migration
-- Branch: phase8/P8-023-ai-teacher-feedback-migration
-- Dependency: P8-019 (Create AI Chat Messages Table)
-- Scope: Lets a student mark an AI Teacher reply as helpful or not helpful.
--        One feedback row per AI Teacher message, written by the backend
--        after validating the requesting student owns the message's session.
--
-- Authority boundary rules enforced at this migration layer:
--   - message_id is a backend-resolved FK to ai_chat_messages(id); never
--     accepted from the client without session/message ownership validation.
--   - student_id is backend-resolved from the authenticated JWT, never from
--     a client-supplied field.
--   - rating only records the student's helpful/not-helpful judgment of an
--     ai_teacher message; it carries no mastery, level, weakness, difficulty,
--     recommendation, or review-schedule semantics and never feeds back into
--     AIM Engine decisions.
--   - No AI provider keys, Supabase service-role keys, or secrets are stored here.
--
-- Scope guard:
--   - No chat message content storage (separate P8-019 migration).
--   - No provider call metadata (separate P8-021 migration).
--   - No safety event storage (separate P8-022 migration).
--   - No payment tables.
--   - No parent dashboard tables.
--   - No admin dashboard tables.
--   - No Student Web App tables.
--   - No client authority introduced.

-- ============================================================
-- Table: ai_teacher_feedback
-- ============================================================

CREATE TABLE ai_teacher_feedback (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID        NOT NULL
                                REFERENCES ai_chat_messages (id)
                                ON DELETE CASCADE,
    student_id      UUID        NOT NULL
                                REFERENCES users (id)
                                ON DELETE CASCADE,

    rating          TEXT        NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_teacher_feedback_rating_check
        CHECK (rating IN ('helpful', 'not_helpful')),

    CONSTRAINT ai_teacher_feedback_message_id_unique
        UNIQUE (message_id)
);

COMMENT ON TABLE ai_teacher_feedback IS
    'Backend-written student feedback on a single AI Teacher chat message (helpful/not helpful). Advisory only; never feeds back into AIM Engine mastery, level, weakness, difficulty, recommendation, or review-schedule decisions.';

COMMENT ON COLUMN ai_teacher_feedback.id IS
    'Primary key. Backend-issued UUID for this feedback row.';

COMMENT ON COLUMN ai_teacher_feedback.message_id IS
    'FK to ai_chat_messages(id). Identifies the ai_teacher message being rated. Backend-resolved after ownership validation. Cascades on message deletion. One feedback row per message.';

COMMENT ON COLUMN ai_teacher_feedback.student_id IS
    'FK to users(id). Backend-resolved from the authenticated JWT. Never accepted from a client-supplied field. Cascades on user deletion.';

COMMENT ON COLUMN ai_teacher_feedback.rating IS
    'Student judgment of the AI Teacher reply. One of: helpful, not_helpful. No mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';

COMMENT ON COLUMN ai_teacher_feedback.created_at IS
    'ISO-8601 UTC timestamp when the backend recorded this feedback.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX ai_teacher_feedback_student_id_created_at_idx
    ON ai_teacher_feedback (student_id, created_at DESC);

CREATE INDEX ai_teacher_feedback_rating_idx
    ON ai_teacher_feedback (rating);
