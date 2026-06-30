-- Create Achievements Tables Migration
--
-- Scope: Backend-seeded achievement/badge catalog + per-student unlock state,
--        surfaced on the mobile Achievements screen (full badge gallery,
--        screen #59) as locked/unlocked tiles.
--
-- Backend authority rules:
--   - student_id is always JWT-resolved server-side, never client-supplied.
--   - achievement_definitions is backend-seeded content; clients cannot
--     create or edit achievement definitions.
--   - unlocked_at is only ever set by the backend (triggered from wherever
--     the relevant lesson/streak/assessment event is processed), never
--     submitted directly by a client request.
--
-- Scope guard:
--   - No AIM Engine runtime, mastery, or skill-map fields here.
--   - No AI Teacher tables.
--   - No payment tables.
--   - No partial-progress columns: the Achievements screen renders a
--     locked/unlocked badge gallery only, no progress bars.

-- ============================================================
-- Table: achievement_definitions
-- ============================================================

CREATE TABLE IF NOT EXISTS achievement_definitions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    key             TEXT        NOT NULL UNIQUE,
    title           TEXT        NOT NULL,
    description     TEXT        NOT NULL,
    icon            TEXT        NOT NULL,
    category        TEXT        NOT NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT true,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT achievement_definitions_category_check
        CHECK (category IN ('lessons', 'streak', 'assessment', 'milestone'))
);

CREATE INDEX IF NOT EXISTS achievement_definitions_is_active_idx
    ON achievement_definitions (is_active);

COMMENT ON TABLE achievement_definitions IS
    'Backend-seeded catalog of achievements/badges. Clients cannot create or edit rows here.';

COMMENT ON COLUMN achievement_definitions.key IS
    'Stable slug used to reference an achievement from backend unlock-trigger logic.';

COMMENT ON COLUMN achievement_definitions.icon IS
    'Icon reference rendered by the mobile badge gallery (e.g. an icon name/key, not a binary asset).';

-- ============================================================
-- Table: student_achievements
-- ============================================================

CREATE TABLE IF NOT EXISTS student_achievements (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID        NOT NULL,
    achievement_id  UUID        NOT NULL REFERENCES achievement_definitions (id) ON DELETE CASCADE,
    unlocked_at     TIMESTAMPTZ NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT student_achievements_student_achievement_unique
        UNIQUE (student_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS student_achievements_student_id_idx
    ON student_achievements (student_id);

COMMENT ON TABLE student_achievements IS
    'Backend-owned per-student achievement unlock state. One row per (student_id, achievement_id) pair once first referenced; unlocked_at NULL means locked.';

COMMENT ON COLUMN student_achievements.student_id IS
    'JWT-resolved Supabase auth uid of the student (same convention as lesson_progress.student_id). Never accepted from client input.';

COMMENT ON COLUMN student_achievements.unlocked_at IS
    'Backend-set timestamp of when the achievement was unlocked. NULL while locked. Only ever written by backend unlock-trigger logic, never by client requests.';

-- Seed a small starter catalog of achievements.
INSERT INTO achievement_definitions (key, title, description, icon, category)
VALUES
    ('first_lesson_complete', 'First Steps', 'Complete your first lesson.', 'emoji_events', 'lessons'),
    ('five_lessons_complete', 'Getting Started', 'Complete 5 lessons.', 'emoji_events', 'lessons'),
    ('three_day_streak', 'On a Roll', 'Keep a 3-day learning streak.', 'local_fire_department', 'streak'),
    ('seven_day_streak', 'Week Warrior', 'Keep a 7-day learning streak.', 'local_fire_department', 'streak'),
    ('first_assessment_passed', 'Quiz Whiz', 'Pass your first assessment.', 'workspace_premium', 'assessment')
ON CONFLICT (key) DO NOTHING;
