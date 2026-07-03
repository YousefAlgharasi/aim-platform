-- P20-001: Add CEFR rank + track grouping to courses
-- Scope: courses table only. No gating logic, no application code changes.

ALTER TABLE courses
  ADD COLUMN track_slug TEXT NOT NULL DEFAULT 'english',
  ADD COLUMN cefr_code TEXT NULL,
  ADD COLUMN cefr_rank SMALLINT NULL;

ALTER TABLE courses
  ADD CONSTRAINT courses_cefr_rank_positive
    CHECK (cefr_rank IS NULL OR cefr_rank > 0);

CREATE UNIQUE INDEX courses_track_slug_cefr_rank_key
  ON courses (track_slug, cefr_rank)
  WHERE cefr_rank IS NOT NULL;

COMMENT ON COLUMN courses.track_slug IS
  'Subject/track this course belongs to. Only ''english'' exists today — read this column, do not hardcode it in gating logic.';

COMMENT ON COLUMN courses.cefr_code IS
  'CEFR level code (A1, A2, B1, ...). NULL for non-CEFR/legacy courses excluded from gating.';

COMMENT ON COLUMN courses.cefr_rank IS
  'Numeric rank matching cefr_code (1 = A1, 2 = A2, ...) for comparison against a student''s computed level. NULL when cefr_code is NULL.';

-- ============================================================
-- Data backfill
-- ============================================================
-- Rows whose title unambiguously indicates a CEFR level get cefr_code/cefr_rank set.
-- The "English for Beginners A1" / "English for Beginners (A1)" pair are both
-- unambiguously A1 by title, but the partial unique index only allows one
-- (track_slug, cefr_rank) pair per rank. The archived duplicate is left NULL
-- and flagged below rather than guessing which one should "win" the rank —
-- a human should confirm the archived row is safe to leave unranked/retire.

UPDATE courses SET cefr_code = 'A1', cefr_rank = 1
  WHERE id = 'c0000000-0000-0000-0000-000000000001'; -- English for Beginners (A1), published

UPDATE courses SET cefr_code = 'A2', cefr_rank = 2
  WHERE id = 'c0000000-0000-0000-0000-000000000002'; -- Elementary English (A2), published

UPDATE courses SET cefr_code = 'A3', cefr_rank = 3
  WHERE id = 'c0000000-0000-0000-0000-000000000003'; -- Pre-Intermediate English (A3), published

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, title, status FROM courses
    WHERE id = 'b0000000-0000-0000-0000-000000000001'
  LOOP
    RAISE NOTICE 'courses.% (title: "%", status: %) unambiguously names an A1 course by title but was left with cefr_code/cefr_rank NULL: it duplicates the rank already claimed by courses.c0000000-0000-0000-0000-000000000001 ("English for Beginners (A1)", published), and the partial unique index (track_slug, cefr_rank) forbids two courses claiming rank 1 in the same track. A human needs to decide whether this archived duplicate should be retired/merged or assigned a different track_slug.', r.id, r.title, r.status;
  END LOOP;

  FOR r IN
    SELECT id, title FROM courses
    WHERE id = '348c8557-a149-46f3-bb5b-a95651f489bc'
  LOOP
    RAISE NOTICE 'courses.% (title: "%") does not unambiguously map to a CEFR level from its title/slug and was left with cefr_code/cefr_rank NULL. A human needs to decide how (or whether) this course maps to a CEFR rank.', r.id, r.title;
  END LOOP;
END $$;
