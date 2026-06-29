-- Create Engagement Tables Migration
--
-- Scope: Backend-owned per-student daily learning goal + daily challenge
--        tracking, surfaced on the mobile Home screen ("Goal" and "Daily
--        Challenge" sections).
--
-- Backend authority rules:
--   - student_id is always JWT-resolved server-side, never client-supplied.
--   - Streaks and challenge progress are always derived server-side from
--     lesson_progress; clients never submit progress counts directly.
--   - Daily challenge templates are backend-seeded content; clients cannot
--     create or edit them.
--
-- Scope guard:
--   - No AIM Engine runtime, mastery, or skill-map fields here.
--   - No AI Teacher tables.
--   - No payment tables.

-- ============================================================
-- Table: student_learning_goals
-- ============================================================

CREATE TABLE IF NOT EXISTS student_learning_goals (
    student_id          UUID            PRIMARY KEY,
    daily_goal_lessons  SMALLINT        NOT NULL DEFAULT 1,

    created_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT student_learning_goals_daily_goal_lessons_check
        CHECK (daily_goal_lessons BETWEEN 1 AND 20)
);

COMMENT ON TABLE student_learning_goals IS
    'Backend-owned per-student daily lesson goal. One row per student, defaulted lazily on first read.';

-- ============================================================
-- Table: daily_challenge_templates
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_challenge_templates (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    key             TEXT        NOT NULL UNIQUE,
    title           TEXT        NOT NULL,
    description     TEXT        NOT NULL,
    challenge_type  TEXT        NOT NULL,
    target_count    SMALLINT    NOT NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT true,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT daily_challenge_templates_challenge_type_check
        CHECK (challenge_type IN ('lessons', 'streak')),

    CONSTRAINT daily_challenge_templates_target_count_check
        CHECK (target_count BETWEEN 1 AND 20)
);

CREATE INDEX IF NOT EXISTS daily_challenge_templates_is_active_idx
    ON daily_challenge_templates (is_active);

COMMENT ON TABLE daily_challenge_templates IS
    'Backend-seeded pool of daily challenge templates. One is deterministically selected per student per day by the backend.';

-- Seed a small starter pool of challenge templates.
INSERT INTO daily_challenge_templates (key, title, description, challenge_type, target_count)
VALUES
    ('complete_one_lesson', 'Finish a lesson', 'Complete 1 lesson today.', 'lessons', 1),
    ('complete_two_lessons', 'Lesson double', 'Complete 2 lessons today.', 'lessons', 2),
    ('keep_streak_alive', 'Keep your streak alive', 'Stay active today to extend your learning streak.', 'streak', 1)
ON CONFLICT (key) DO NOTHING;
