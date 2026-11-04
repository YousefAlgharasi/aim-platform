-- Per-locale lesson and chapter text (title, description).
--
-- Mirrors course_translations (20261031120000_create_course_translations):
--   - lessons/chapters title+description stay as the English source and are NOT changed, dropped or
--     renamed; the backend keeps them equal to the 'en' translation inside one transaction.
--   - One row per (parent, locale). A parent may lack a locale; readers fall back to 'en'.
--   - locale is validated by FORMAT only; the languages the product serves are backend configuration.
--   - Backend authority: RLS on, no policies.

CREATE TABLE IF NOT EXISTS lesson_translations (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    UUID          NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  locale       VARCHAR(10)   NOT NULL,
  title        TEXT          NOT NULL,
  description  TEXT          NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT lesson_translations_lesson_locale_key UNIQUE (lesson_id, locale),
  CONSTRAINT lesson_translations_locale_format_check
    CHECK (locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$')
);

CREATE TABLE IF NOT EXISTS chapter_translations (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id   UUID          NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  locale       VARCHAR(10)   NOT NULL,
  title        TEXT          NOT NULL,
  description  TEXT          NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT chapter_translations_chapter_locale_key UNIQUE (chapter_id, locale),
  CONSTRAINT chapter_translations_locale_format_check
    CHECK (locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$')
);

CREATE OR REPLACE FUNCTION set_lesson_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_chapter_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lesson_translations_set_updated_at ON lesson_translations;
CREATE TRIGGER lesson_translations_set_updated_at
BEFORE UPDATE ON lesson_translations
FOR EACH ROW
EXECUTE FUNCTION set_lesson_translations_updated_at();

DROP TRIGGER IF EXISTS chapter_translations_set_updated_at ON chapter_translations;
CREATE TRIGGER chapter_translations_set_updated_at
BEFORE UPDATE ON chapter_translations
FOR EACH ROW
EXECUTE FUNCTION set_chapter_translations_updated_at();

COMMENT ON TABLE lesson_translations IS
  'Per-locale lesson title/description. One row per (lesson_id, locale); the en row mirrors lessons.title/description. Backend-owned, never client-writable.';
COMMENT ON TABLE chapter_translations IS
  'Per-locale chapter title/description. One row per (chapter_id, locale); the en row mirrors chapters.title/description. Backend-owned, never client-writable.';

ALTER TABLE lesson_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_translations ENABLE ROW LEVEL SECURITY;

INSERT INTO lesson_translations (lesson_id, locale, title, description)
SELECT l.id, 'en', l.title, l.description
FROM lessons l
ON CONFLICT (lesson_id, locale) DO NOTHING;

INSERT INTO chapter_translations (chapter_id, locale, title, description)
SELECT c.id, 'en', c.title, c.description
FROM chapters c
ON CONFLICT (chapter_id, locale) DO NOTHING;
