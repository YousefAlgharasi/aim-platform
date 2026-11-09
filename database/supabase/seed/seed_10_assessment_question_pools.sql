-- Question pools for quizzes and exams.
--
-- Each attempt draws its own random subset from the assessment's pool (see assessment_attempt_questions),
-- so the pools must be much larger than one attempt:
--   chapter quiz  -> the practice questions of every lesson in the chapter (plus its original questions)
--   course exam   -> the practice questions of every lesson in the course  (plus its original questions)
-- Idempotent: questions already in an assessment are skipped.

BEGIN;

WITH targets AS (
  SELECT a.id AS assessment_id, lq.question_id, lq.lesson_id, lq.sort_order
    FROM assessments a
    JOIN lessons l ON l.chapter_id = a.chapter_id
    JOIN lesson_questions lq ON lq.lesson_id = l.id
   WHERE a.status = 'published' AND a.type = 'quiz' AND a.chapter_id IS NOT NULL
  UNION ALL
  SELECT a.id, lq.question_id, lq.lesson_id, lq.sort_order
    FROM assessments a
    JOIN levels lv ON lv.course_id = a.course_id
    JOIN chapters ch ON ch.level_id = lv.id
    JOIN lessons l ON l.chapter_id = ch.id
    JOIN lesson_questions lq ON lq.lesson_id = l.id
   WHERE a.status = 'published' AND a.type = 'exam' AND a.course_id IS NOT NULL
), fresh AS (
  SELECT t.*,
         row_number() OVER (PARTITION BY t.assessment_id ORDER BY t.lesson_id, t.sort_order) AS rn,
         (SELECT s.id FROM assessment_sections s WHERE s.assessment_id = t.assessment_id ORDER BY s."order" LIMIT 1) AS section_id,
         COALESCE((SELECT max(x."order") FROM assessment_questions x WHERE x.assessment_id = t.assessment_id), 0) AS base_order
    FROM targets t
   WHERE NOT EXISTS (SELECT 1 FROM assessment_questions aq
                      WHERE aq.assessment_id = t.assessment_id AND aq.question_id = t.question_id)
)
INSERT INTO assessment_questions (assessment_id, section_id, question_id, "order", points)
SELECT assessment_id, section_id, question_id, base_order + rn, 1
  FROM fresh
ON CONFLICT DO NOTHING;

-- Existing explicit settings rows were seeded with randomisation off; turn it on (questions_per_attempt stays
-- NULL = the per-type default from the backend: 10 for quizzes, 25 for exams).
UPDATE assessment_settings SET randomize_questions = true, randomize_options = true
 WHERE randomize_questions = false OR randomize_options = false;

COMMIT;
