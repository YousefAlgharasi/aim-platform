-- Create Lesson Progress Migration
--
-- Scope: Backend-owned per-student lesson completion tracking. Source of
--        truth for completedLessons / totalLessons / completionPct /
--        lastActiveAt surfaced on the admin "Progress" view and the
--        student-facing lesson progress endpoints.
--
-- Backend authority rules:
--   - percent and completed are always backend-computed/validated; clients
--     submit a raw progress percent which the backend clamps and persists,
--     but completion itself is only ever set via the dedicated complete
--     endpoint, never inferred from percent alone.
--   - student_id is always JWT-resolved server-side, never client-supplied.
--   - No AIM Engine runtime, mastery, difficulty, or skill-map fields here.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: lesson_progress
-- ============================================================

CREATE TABLE lesson_progress (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID            NOT NULL,
    lesson_id       UUID            NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,

    percent         SMALLINT        NOT NULL DEFAULT 0,
    completed       BOOLEAN         NOT NULL DEFAULT FALSE,

    started_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ     NULL,
    last_active_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT lesson_progress_student_lesson_unique
        UNIQUE (student_id, lesson_id),

    CONSTRAINT lesson_progress_percent_range_check
        CHECK (percent BETWEEN 0 AND 100),

    CONSTRAINT lesson_progress_completed_consistency_check
        CHECK (
            (completed = TRUE AND completed_at IS NOT NULL)
            OR (completed = FALSE AND completed_at IS NULL)
        )
);

COMMENT ON TABLE lesson_progress IS
    'Backend-owned per-student lesson completion tracking. One row per (student_id, lesson_id) pair.';

COMMENT ON COLUMN lesson_progress.student_id IS
    'JWT-resolved Supabase auth uid of the student (matches users.supabase_auth_uid, the same convention used by learning_sessions.student_id and lesson_attempts.student_id). Never accepted from client input.';

COMMENT ON COLUMN lesson_progress.lesson_id IS
    'References the lesson being tracked.';

COMMENT ON COLUMN lesson_progress.percent IS
    'Backend-clamped progress percent (0-100) within the lesson. Informational only — completion is set exclusively via the complete endpoint.';

COMMENT ON COLUMN lesson_progress.completed IS
    'Whether the student has completed this lesson. Only ever set TRUE by the backend complete endpoint.';

COMMENT ON COLUMN lesson_progress.started_at IS
    'Backend-set on first progress event for this (student, lesson) pair.';

COMMENT ON COLUMN lesson_progress.completed_at IS
    'Backend-set timestamp of completion. NULL while completed = FALSE.';

COMMENT ON COLUMN lesson_progress.last_active_at IS
    'Backend-updated on every progress or completion event. Used to compute the student lastActiveAt summary.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX lesson_progress_student_id_idx
    ON lesson_progress (student_id);

CREATE INDEX lesson_progress_lesson_id_idx
    ON lesson_progress (lesson_id);

CREATE INDEX lesson_progress_student_id_last_active_at_idx
    ON lesson_progress (student_id, last_active_at DESC);
