-- MANUAL ROLLBACK for 20261031120000_create_course_translations (not run by Prisma Migrate).
-- Roll back the CODE first (the previous backend image ignores this table and keeps reading
-- courses.title / courses.description, which were never changed), then run this.
-- Dropping the table loses only non-English translations: every English value still lives in courses.
-- Export non-English rows first if they must be kept:
--   COPY (SELECT * FROM course_translations WHERE locale <> 'en') TO STDOUT WITH CSV HEADER;
DROP TABLE IF EXISTS course_translations;
DROP FUNCTION IF EXISTS set_course_translations_updated_at();
