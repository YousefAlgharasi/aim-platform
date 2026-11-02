-- MANUAL ROLLBACK for 20261102230000_create_practice_topics (not run by Prisma Migrate).
-- Roll back the CODE first (the previous backend image never touches these tables), then run this.
-- This deletes every topic, translation and student attempt. Practice XP already awarded is lost
-- from students' totals (it is derived from practice_attempts). Export first if needed:
--   COPY (SELECT * FROM practice_attempts) TO STDOUT WITH CSV HEADER;
DROP TABLE IF EXISTS practice_attempts;
DROP TABLE IF EXISTS practice_topic_translations;
DROP TABLE IF EXISTS practice_topics;
DROP FUNCTION IF EXISTS set_practice_updated_at();
