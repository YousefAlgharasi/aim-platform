-- Adds the missing source text for placement listening_choice questions'
-- audio. placement_questions.prompt only ever held the instructions and
-- answer options shown on screen (e.g. "Listen to the conversation and
-- choose the correct answer: What does the man say? A) ... B) ..."); the
-- actual line(s) a student is meant to listen to were never captured
-- anywhere, so there was no source text TTS (or a human narrator) could
-- read to produce correct listening-comprehension audio.
--
-- listening_script is optional and only meaningful for
-- question_type = 'listening_choice' — the backend synthesizes audio from
-- this field (never from prompt) when present.

ALTER TABLE placement_questions
  ADD COLUMN listening_script TEXT NULL;

COMMENT ON COLUMN placement_questions.listening_script IS
  'The actual line(s) to be read aloud for a listening_choice question -- distinct from prompt (which holds only the on-screen instructions and answer options). TTS synthesizes audio from this field. NULL for non-listening question types, and for listening_choice rows that have not been scripted yet (audio is unavailable until this is set).';

-- Backfill real scripts for the 6 listening_choice questions seeded in
-- 04_placement_seed.sql, each written to be consistent with that question's
-- existing correct_answer so the audio genuinely supports the intended
-- answer rather than being a placeholder.
UPDATE placement_questions
SET listening_script = 'Man: Good morning! How are you today?\nWoman: I''m fine, thank you. And you?'
WHERE id = '9a000000-0000-0000-0004-000000000001';

UPDATE placement_questions
SET listening_script = 'Attention students: please remember that today''s class will start at nine A M, not eight, because of the schedule change.'
WHERE id = '9a000000-0000-0000-0004-000000000002';

UPDATE placement_questions
SET listening_script = 'Excuse me, could you tell me where the pharmacy is?\nYes, it''s easy to find: it''s right next to the bank, just past the traffic light.'
WHERE id = '9a000000-0000-0000-0004-000000000003';

UPDATE placement_questions
SET listening_script = 'Customer: How much is this shirt?\nShop assistant: That one is thirty-five dollars. It''s on sale today.'
WHERE id = '9a000000-0000-0000-0004-000000000004';

UPDATE placement_questions
SET listening_script = 'In local news today, the city council announced changes to public transport schedules starting next Monday, with several bus routes adjusting their departure times.'
WHERE id = '9a000000-0000-0000-0004-000000000005';

UPDATE placement_questions
SET listening_script = 'According to language experts, while age and environment matter, the most important factor in successfully learning a new language is regular practice combined with strong personal motivation.'
WHERE id = '9a000000-0000-0000-0004-000000000006';
