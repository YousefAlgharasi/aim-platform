-- MANUAL ROLLBACK for 20261101090000_create_lesson_chapter_translations (not run by Prisma Migrate).
-- Roll back the CODE first (the previous backend ignores these tables and keeps reading
-- lessons/chapters title+description, which were never changed), then run this.
-- Dropping the tables loses only non-English translations. Export them first if they must be kept:
--   COPY (SELECT * FROM lesson_translations WHERE locale <> 'en') TO STDOUT WITH CSV HEADER;
--   COPY (SELECT * FROM chapter_translations WHERE locale <> 'en') TO STDOUT WITH CSV HEADER;
DROP TABLE IF EXISTS lesson_translations;
DROP TABLE IF EXISTS chapter_translations;
DROP FUNCTION IF EXISTS set_lesson_translations_updated_at();
DROP FUNCTION IF EXISTS set_chapter_translations_updated_at();
