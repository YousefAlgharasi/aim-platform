-- Per-locale course content (title, description).
--
-- Design rules:
--   - courses.title / courses.description are NOT dropped, renamed or changed. They stay the English
--     source for publish validation, the AI teacher context and any legacy consumer, and the backend
--     keeps them equal to the 'en' translation inside one transaction.
--   - One row per (course, locale). A course may lack a locale; readers fall back to 'en'.
--   - locale is validated by FORMAT only (BCP-47 style tag). The set of languages the product actually
--     serves is backend configuration, so adding a language needs no schema change.
--   - Backend authority: RLS on, no policies, same posture as every other backend-owned table.

CREATE TABLE IF NOT EXISTS course_translations (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID          NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  locale       VARCHAR(10)   NOT NULL,
  title        TEXT          NOT NULL,
  description  TEXT          NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- The unique constraint's index also serves (course_id, locale) lookups and joins.
  CONSTRAINT course_translations_course_locale_key UNIQUE (course_id, locale),
  CONSTRAINT course_translations_locale_format_check
    CHECK (locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$')
);

CREATE OR REPLACE FUNCTION set_course_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS course_translations_set_updated_at ON course_translations;

CREATE TRIGGER course_translations_set_updated_at
BEFORE UPDATE ON course_translations
FOR EACH ROW
EXECUTE FUNCTION set_course_translations_updated_at();

COMMENT ON TABLE course_translations IS
  'Per-locale course title/description. One row per (course_id, locale); the en row mirrors courses.title/description. Backend-owned, never client-writable.';

ALTER TABLE course_translations ENABLE ROW LEVEL SECURITY;

-- Idempotent backfill: one verbatim English row per existing course. Never overwrites an existing row
-- and never invents other languages.
INSERT INTO course_translations (course_id, locale, title, description)
SELECT c.id, 'en', c.title, c.description
FROM courses c
ON CONFLICT (course_id, locale) DO NOTHING;
