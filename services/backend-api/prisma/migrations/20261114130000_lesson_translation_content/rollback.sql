-- MANUAL ROLLBACK for 20261114130000_lesson_translation_content (not run by Prisma Migrate).
-- Roll back the CODE first (the previous backend never selects these columns), then run this.
-- Dropping the columns loses only translated teaching content / question text. Export first if needed:
--   COPY (SELECT lesson_id, locale, content FROM lesson_translations WHERE content IS NOT NULL) TO STDOUT WITH CSV HEADER;
--   COPY (SELECT id, translations FROM question_bank WHERE translations IS NOT NULL) TO STDOUT WITH CSV HEADER;
--   COPY (SELECT id, translations FROM question_choices WHERE translations IS NOT NULL) TO STDOUT WITH CSV HEADER;
ALTER TABLE lesson_translations DROP COLUMN IF EXISTS content;
ALTER TABLE question_bank DROP COLUMN IF EXISTS translations;
ALTER TABLE question_choices DROP COLUMN IF EXISTS translations;
