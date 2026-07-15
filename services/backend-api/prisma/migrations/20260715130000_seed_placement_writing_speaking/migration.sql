-- Seed writing/speaking sections + questions for the published placement
-- test, and widen placement_sections.skill_code to allow them.
--
-- Scope: Placement Test system only. No AIM Engine runtime changes.

-- Answers already allow skill_code = writing/speaking (see the previous
-- migration), but sections did not -- and placement-answer-submit.service.ts
-- inherits skill_code from the parent section, so writing/speaking questions
-- cannot function without this.
ALTER TABLE placement_sections
  DROP CONSTRAINT placement_sections_skill_code_check;

ALTER TABLE placement_sections
  ADD CONSTRAINT placement_sections_skill_code_check
    CHECK (skill_code IN ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'));

-- Seed dedicated skills for AI-graded placement writing/speaking (distinct
-- from level-specific curriculum skills used elsewhere in the app).
INSERT INTO skills (id, key, title, description, domain, status)
VALUES
  ('9d100000-0000-0000-0000-000000000001', 'en.placement.writing', 'Placement Writing',
   'General writing proficiency assessed during the placement test and graded by AI.', 'writing', 'published'),
  ('9d100000-0000-0000-0000-000000000002', 'en.placement.speaking', 'Placement Speaking',
   'General spoken proficiency assessed during the placement test via recorded response, transcribed and graded by AI.', 'speaking', 'published')
ON CONFLICT (id) DO NOTHING;

-- New placement sections for the currently published test.
INSERT INTO placement_sections (id, placement_test_id, title, skill_code, order_index, total_questions)
VALUES
  ('9c000000-0000-0000-0000-000000000005', '9d000000-0000-0000-0000-000000000001', 'Writing', 'writing', 5, 1),
  ('9c000000-0000-0000-0000-000000000006', '9d000000-0000-0000-0000-000000000001', 'Speaking', 'speaking', 6, 1)
ON CONFLICT (id) DO NOTHING;

UPDATE placement_tests
SET total_sections = 6
WHERE id = '9d000000-0000-0000-0000-000000000001';

-- One writing prompt and one speaking prompt question. correct_answer holds
-- a non-scoring placeholder (see column comment in the previous migration)
-- since these are AI-graded, not key-matched.
INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, order_index, correct_answer)
VALUES
  ('9b000000-0000-0000-0000-000000000101', '9c000000-0000-0000-0000-000000000005', 'writing',
   'Write a short paragraph (80-150 words) about a memorable trip or experience you have had. Describe what happened, how you felt, and why it was memorable.',
   1, 'ai_graded'),
  ('9b000000-0000-0000-0000-000000000102', '9c000000-0000-0000-0000-000000000006', 'speaking',
   'Talk about yourself for up to 3 minutes: your background, interests, daily routine, and future goals.',
   1, 'ai_graded')
ON CONFLICT (id) DO NOTHING;

INSERT INTO placement_question_skills (placement_question_id, skill_id, is_primary)
VALUES
  ('9b000000-0000-0000-0000-000000000101', '9d100000-0000-0000-0000-000000000001', true),
  ('9b000000-0000-0000-0000-000000000102', '9d100000-0000-0000-0000-000000000002', true)
ON CONFLICT DO NOTHING;
