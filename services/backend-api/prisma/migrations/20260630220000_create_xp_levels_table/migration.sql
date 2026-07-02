-- Create XP Levels Table Migration
--
-- Scope: Backend-seeded XP level curve, used to compute a student's level
--        and XP-to-next-level from their real total XP (sum of xp_value
--        across completed lesson_progress rows). Surfaced on the mobile
--        Home screen's level/XP hero card.
--
-- Backend authority rules:
--   - min_xp is backend-seeded content; clients cannot create or edit rows.
--   - A student's level/XP-progress is always computed server-side from
--     this table plus lesson_progress + lessons.xp_value; clients never
--     submit or compute level/XP directly.
--
-- Scope guard:
--   - No AIM Engine runtime, mastery, or skill-map fields here — this is a
--     gamification XP curve, unrelated to AIM mastery/level computation.
--   - No AI Teacher tables.
--   - No payment tables.

CREATE TABLE IF NOT EXISTS xp_levels (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    level       SMALLINT    NOT NULL UNIQUE,
    min_xp      INTEGER     NOT NULL,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT xp_levels_level_check CHECK (level >= 1),
    CONSTRAINT xp_levels_min_xp_check CHECK (min_xp >= 0)
);

CREATE INDEX IF NOT EXISTS xp_levels_min_xp_idx
    ON xp_levels (min_xp);

COMMENT ON TABLE xp_levels IS
    'Backend-seeded XP level curve. min_xp is the total XP required to reach that level. Clients cannot create or edit rows here.';

COMMENT ON COLUMN xp_levels.min_xp IS
    'Total lifetime XP (sum of completed lesson xp_value) required to reach this level.';

-- Seed a 30-level quadratic XP curve: min_xp(level) = 50 * (level - 1) * level.
INSERT INTO xp_levels (level, min_xp)
SELECT lvl, (50 * (lvl - 1) * lvl)::int
FROM generate_series(1, 30) AS lvl
ON CONFLICT (level) DO NOTHING;
