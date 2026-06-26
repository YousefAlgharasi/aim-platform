-- =============================================================================
-- AIM Platform Seed — Part 4: Question Bank (A1 Questions)
-- Real English teaching questions for Arabic-speaking A1 learners
-- =============================================================================

BEGIN;

-- Admin user ID for created_by
-- '00000000-0000-0000-0000-000000000001'

-- ─────────────────────────────────────────────────────────────────────────────
-- A1 QUESTIONS — Phonics & Letters
-- ─────────────────────────────────────────────────────────────────────────────

-- Q1: Uppercase letter recognition (MCQ)
INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, status, created_by) VALUES
  ('q0000000-0000-0000-0001-000000000001', 'multiple_choice', 'Which letter is this? B', 'beginner', 'The letter B is the second letter of the English alphabet.', 'Look at the shape carefully. It has two bumps on the right side.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000002', 'multiple_choice', 'Which letter comes after G in the alphabet?', 'beginner', 'The English alphabet order: ...F, G, H, I...', 'Think of the alphabet song: A, B, C, D, E, F, G, H...', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000003', 'true_false', 'The letter "d" and the letter "b" look the same.', 'beginner', 'The letters b and d are mirror images. The bump on b faces right; the bump on d faces left.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000004', 'multiple_choice', 'Which word starts with the letter "C"?', 'beginner', 'Cat starts with the letter C. The /k/ sound at the beginning is the sound of the letter C.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000005', 'multiple_choice', 'What is the vowel sound in the word "cat"?', 'beginner', 'The short "a" sound /æ/ is the vowel in "cat". It sounds different from the Arabic ا.', 'A vowel is one of these letters: a, e, i, o, u.', 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Choices for Q1
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0001-0000-000000000001', 'q0000000-0000-0000-0001-000000000001', 'B', true, 0),
  ('qc000000-0001-0001-0000-000000000002', 'q0000000-0000-0000-0001-000000000001', 'D', false, 1),
  ('qc000000-0001-0001-0000-000000000003', 'q0000000-0000-0000-0001-000000000001', 'P', false, 2),
  ('qc000000-0001-0001-0000-000000000004', 'q0000000-0000-0000-0001-000000000001', 'R', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Choices for Q2
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0002-0000-000000000001', 'q0000000-0000-0000-0001-000000000002', 'H', true, 0),
  ('qc000000-0001-0002-0000-000000000002', 'q0000000-0000-0000-0001-000000000002', 'F', false, 1),
  ('qc000000-0001-0002-0000-000000000003', 'q0000000-0000-0000-0001-000000000002', 'I', false, 2),
  ('qc000000-0001-0002-0000-000000000004', 'q0000000-0000-0000-0001-000000000002', 'E', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Choices for Q3 (true/false)
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0003-0000-000000000001', 'q0000000-0000-0000-0001-000000000003', 'True', false, 0),
  ('qc000000-0001-0003-0000-000000000002', 'q0000000-0000-0000-0001-000000000003', 'False', true, 1)
ON CONFLICT (id) DO NOTHING;

-- Choices for Q4
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0004-0000-000000000001', 'q0000000-0000-0000-0001-000000000004', 'cat', true, 0),
  ('qc000000-0001-0004-0000-000000000002', 'q0000000-0000-0000-0001-000000000004', 'dog', false, 1),
  ('qc000000-0001-0004-0000-000000000003', 'q0000000-0000-0000-0001-000000000004', 'bed', false, 2),
  ('qc000000-0001-0004-0000-000000000004', 'q0000000-0000-0000-0001-000000000004', 'pen', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Choices for Q5
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0005-0000-000000000001', 'q0000000-0000-0000-0001-000000000005', '/æ/ (short a)', true, 0),
  ('qc000000-0001-0005-0000-000000000002', 'q0000000-0000-0000-0001-000000000005', '/e/ (short e)', false, 1),
  ('qc000000-0001-0005-0000-000000000003', 'q0000000-0000-0000-0001-000000000005', '/ɪ/ (short i)', false, 2),
  ('qc000000-0001-0005-0000-000000000004', 'q0000000-0000-0000-0001-000000000005', '/ɒ/ (short o)', false, 3)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A1 QUESTIONS — Greetings & Vocabulary
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, status, created_by) VALUES
  ('q0000000-0000-0000-0001-000000000006', 'multiple_choice', 'What do you say when you meet someone in the morning?', 'beginner', 'In English, we say "Good morning" when we meet someone before noon.', 'Think about the time of day: morning.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000007', 'multiple_choice', 'Someone gives you a gift. What do you say?', 'beginner', 'We say "Thank you" when someone gives us something or helps us.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000008', 'fill_in_the_blank', 'My ___ is Ahmed. I am from Saudi Arabia.', 'beginner', 'We use "name" to tell people what we are called: My name is Ahmed.', 'What word tells people what you are called?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000009', 'multiple_choice', 'How do you say "مع السلامة" in English?', 'beginner', '"Goodbye" is the English word for "مع السلامة". We say it when we leave.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000010', 'true_false', '"Please" is a polite word in English.', 'beginner', '"Please" is used to make requests more polite. For example: Can I have water, please?', NULL, 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Choices for Q6
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0006-0000-000000000001', 'q0000000-0000-0000-0001-000000000006', 'Good morning', true, 0),
  ('qc000000-0001-0006-0000-000000000002', 'q0000000-0000-0000-0001-000000000006', 'Good night', false, 1),
  ('qc000000-0001-0006-0000-000000000003', 'q0000000-0000-0000-0001-000000000006', 'Goodbye', false, 2),
  ('qc000000-0001-0006-0000-000000000004', 'q0000000-0000-0000-0001-000000000006', 'Sorry', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Choices for Q7
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0007-0000-000000000001', 'q0000000-0000-0000-0001-000000000007', 'Thank you', true, 0),
  ('qc000000-0001-0007-0000-000000000002', 'q0000000-0000-0000-0001-000000000007', 'Sorry', false, 1),
  ('qc000000-0001-0007-0000-000000000003', 'q0000000-0000-0000-0001-000000000007', 'Goodbye', false, 2),
  ('qc000000-0001-0007-0000-000000000004', 'q0000000-0000-0000-0001-000000000007', 'Hello', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Answer for Q8 (fill_in_the_blank)
INSERT INTO question_answers (id, question_id, answer_type, value) VALUES
  ('qa000000-0001-0008-0000-000000000001', 'q0000000-0000-0000-0001-000000000008', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["name", "Name", "NAME"]}], "case_sensitive": false}')
ON CONFLICT (question_id) DO NOTHING;

-- Choices for Q9
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0009-0000-000000000001', 'q0000000-0000-0000-0001-000000000009', 'Goodbye', true, 0),
  ('qc000000-0001-0009-0000-000000000002', 'q0000000-0000-0000-0001-000000000009', 'Hello', false, 1),
  ('qc000000-0001-0009-0000-000000000003', 'q0000000-0000-0000-0001-000000000009', 'Thank you', false, 2),
  ('qc000000-0001-0009-0000-000000000004', 'q0000000-0000-0000-0001-000000000009', 'Please', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Choices for Q10 (true/false)
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0010-0000-000000000001', 'q0000000-0000-0000-0001-000000000010', 'True', true, 0),
  ('qc000000-0001-0010-0000-000000000002', 'q0000000-0000-0000-0001-000000000010', 'False', false, 1)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A1 QUESTIONS — Numbers & Days
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, status, created_by) VALUES
  ('q0000000-0000-0000-0001-000000000011', 'multiple_choice', 'What number is "twelve"?', 'beginner', 'Twelve is the English word for the number 12.', 'It comes after eleven.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000012', 'fill_in_the_blank', 'Monday, Tuesday, ___, Thursday, Friday', 'beginner', 'Wednesday is the third day of the week.', 'It starts with W.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000013', 'multiple_choice', 'It is 3:00. How do you say this in English?', 'beginner', 'When the minute hand is on 12, we say "o''clock". 3:00 = three o''clock.', 'The minute hand is on 12.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000014', 'true_false', 'Saturday and Sunday are the weekend.', 'beginner', 'In English, the weekend means Saturday and Sunday — the days when most people don''t work.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000015', 'multiple_choice', 'What number comes after fifteen?', 'beginner', 'After fifteen (15) comes sixteen (16).', 'Count: thirteen, fourteen, fifteen...', 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0011-0000-000000000001', 'q0000000-0000-0000-0001-000000000011', '12', true, 0),
  ('qc000000-0001-0011-0000-000000000002', 'q0000000-0000-0000-0001-000000000011', '20', false, 1),
  ('qc000000-0001-0011-0000-000000000003', 'q0000000-0000-0000-0001-000000000011', '11', false, 2),
  ('qc000000-0001-0011-0000-000000000004', 'q0000000-0000-0000-0001-000000000011', '2', false, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_answers (id, question_id, answer_type, value) VALUES
  ('qa000000-0001-0012-0000-000000000001', 'q0000000-0000-0000-0001-000000000012', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["Wednesday", "wednesday"]}], "case_sensitive": false}')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0013-0000-000000000001', 'q0000000-0000-0000-0001-000000000013', 'Three o''clock', true, 0),
  ('qc000000-0001-0013-0000-000000000002', 'q0000000-0000-0000-0001-000000000013', 'Half past three', false, 1),
  ('qc000000-0001-0013-0000-000000000003', 'q0000000-0000-0000-0001-000000000013', 'Three thirty', false, 2),
  ('qc000000-0001-0013-0000-000000000004', 'q0000000-0000-0000-0001-000000000013', 'Thirteen o''clock', false, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0014-0000-000000000001', 'q0000000-0000-0000-0001-000000000014', 'True', true, 0),
  ('qc000000-0001-0014-0000-000000000002', 'q0000000-0000-0000-0001-000000000014', 'False', false, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0015-0000-000000000001', 'q0000000-0000-0000-0001-000000000015', 'Sixteen', true, 0),
  ('qc000000-0001-0015-0000-000000000002', 'q0000000-0000-0000-0001-000000000015', 'Fourteen', false, 1),
  ('qc000000-0001-0015-0000-000000000003', 'q0000000-0000-0000-0001-000000000015', 'Fifty', false, 2),
  ('qc000000-0001-0015-0000-000000000004', 'q0000000-0000-0000-0001-000000000015', 'Seventeen', false, 3)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A1 QUESTIONS — Family & Describing People
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, status, created_by) VALUES
  ('q0000000-0000-0000-0001-000000000016', 'multiple_choice', 'My mother''s husband is my ___.', 'beginner', 'Your mother''s husband is your father.', 'It is a male family member.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000017', 'multiple_choice', 'What is the opposite of "tall"?', 'beginner', 'The opposite of tall is short. A tall person is high; a short person is not high.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000018', 'fill_in_the_blank', 'She is ___. She always smiles. (happy / sad)', 'beginner', 'A person who always smiles is happy. Happy means you feel good.', 'Smiling = feeling good.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000019', 'multiple_choice', 'What color is the sky on a sunny day?', 'beginner', 'The sky is blue on a clear, sunny day.', 'Look up! What color do you see?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000020', 'true_false', 'Your sister is female.', 'beginner', 'A sister is a female family member who has the same parents as you.', NULL, 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0016-0000-000000000001', 'q0000000-0000-0000-0001-000000000016', 'father', true, 0),
  ('qc000000-0001-0016-0000-000000000002', 'q0000000-0000-0000-0001-000000000016', 'brother', false, 1),
  ('qc000000-0001-0016-0000-000000000003', 'q0000000-0000-0000-0001-000000000016', 'son', false, 2),
  ('qc000000-0001-0016-0000-000000000004', 'q0000000-0000-0000-0001-000000000016', 'uncle', false, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0017-0000-000000000001', 'q0000000-0000-0000-0001-000000000017', 'short', true, 0),
  ('qc000000-0001-0017-0000-000000000002', 'q0000000-0000-0000-0001-000000000017', 'big', false, 1),
  ('qc000000-0001-0017-0000-000000000003', 'q0000000-0000-0000-0001-000000000017', 'young', false, 2),
  ('qc000000-0001-0017-0000-000000000004', 'q0000000-0000-0000-0001-000000000017', 'happy', false, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_answers (id, question_id, answer_type, value) VALUES
  ('qa000000-0001-0018-0000-000000000001', 'q0000000-0000-0000-0001-000000000018', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["happy", "Happy"]}], "case_sensitive": false}')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0019-0000-000000000001', 'q0000000-0000-0000-0001-000000000019', 'blue', true, 0),
  ('qc000000-0001-0019-0000-000000000002', 'q0000000-0000-0000-0001-000000000019', 'red', false, 1),
  ('qc000000-0001-0019-0000-000000000003', 'q0000000-0000-0000-0001-000000000019', 'green', false, 2),
  ('qc000000-0001-0019-0000-000000000004', 'q0000000-0000-0000-0001-000000000019', 'black', false, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0020-0000-000000000001', 'q0000000-0000-0000-0001-000000000020', 'True', true, 0),
  ('qc000000-0001-0020-0000-000000000002', 'q0000000-0000-0000-0001-000000000020', 'False', false, 1)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A1 QUESTIONS — To Be (Grammar)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, status, created_by) VALUES
  ('q0000000-0000-0000-0001-000000000021', 'fill_in_the_blank', 'I ___ a student. (am / is / are)', 'beginner', 'With "I", we always use "am". I am = I''m.', 'What form of "to be" goes with "I"?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000022', 'multiple_choice', 'She ___ happy.', 'beginner', 'With she/he/it, we use "is". She is happy.', '"She" is one person (not I, not you).', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000023', 'multiple_choice', 'They ___ from Egypt.', 'beginner', 'With they/we/you (plural), we use "are". They are from Egypt.', '"They" is more than one person.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000024', 'fill_in_the_blank', 'He ___ not a teacher. He is a doctor.', 'beginner', 'The negative of "He is" is "He is not" or "He isn''t".', 'Make the sentence negative: He is → He is not.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000025', 'multiple_choice', '___ you a student? Yes, I am.', 'beginner', 'To make a yes/no question with "to be", put am/is/are before the subject: Are you...?', 'For questions, the verb comes first.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000026', 'multiple_choice', 'What ___ your name?', 'beginner', 'With "your name" (it), we use "is": What is your name?', '"Your name" is like "it".', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000027', 'true_false', '"I are a student" is correct English.', 'beginner', 'This is incorrect. With "I", we use "am": I am a student.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000028', 'multiple_choice', 'We ___ in the classroom.', 'beginner', 'With "we", we use "are". We are in the classroom.', '"We" means I + other people.', 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_answers (id, question_id, answer_type, value) VALUES
  ('qa000000-0001-0021-0000-000000000001', 'q0000000-0000-0000-0001-000000000021', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["am", "Am"]}], "case_sensitive": false}'),
  ('qa000000-0001-0024-0000-000000000001', 'q0000000-0000-0000-0001-000000000024', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["is", "Is", "is not", "isn''t"]}], "case_sensitive": false}')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0022-0000-000000000001', 'q0000000-0000-0000-0001-000000000022', 'is', true, 0),
  ('qc000000-0001-0022-0000-000000000002', 'q0000000-0000-0000-0001-000000000022', 'am', false, 1),
  ('qc000000-0001-0022-0000-000000000003', 'q0000000-0000-0000-0001-000000000022', 'are', false, 2),
  ('qc000000-0001-0022-0000-000000000004', 'q0000000-0000-0000-0001-000000000022', 'be', false, 3),
  ('qc000000-0001-0023-0000-000000000001', 'q0000000-0000-0000-0001-000000000023', 'are', true, 0),
  ('qc000000-0001-0023-0000-000000000002', 'q0000000-0000-0000-0001-000000000023', 'is', false, 1),
  ('qc000000-0001-0023-0000-000000000003', 'q0000000-0000-0000-0001-000000000023', 'am', false, 2),
  ('qc000000-0001-0023-0000-000000000004', 'q0000000-0000-0000-0001-000000000023', 'be', false, 3),
  ('qc000000-0001-0025-0000-000000000001', 'q0000000-0000-0000-0001-000000000025', 'Are', true, 0),
  ('qc000000-0001-0025-0000-000000000002', 'q0000000-0000-0000-0001-000000000025', 'Is', false, 1),
  ('qc000000-0001-0025-0000-000000000003', 'q0000000-0000-0000-0001-000000000025', 'Am', false, 2),
  ('qc000000-0001-0025-0000-000000000004', 'q0000000-0000-0000-0001-000000000025', 'Do', false, 3),
  ('qc000000-0001-0026-0000-000000000001', 'q0000000-0000-0000-0001-000000000026', 'is', true, 0),
  ('qc000000-0001-0026-0000-000000000002', 'q0000000-0000-0000-0001-000000000026', 'are', false, 1),
  ('qc000000-0001-0026-0000-000000000003', 'q0000000-0000-0000-0001-000000000026', 'am', false, 2),
  ('qc000000-0001-0026-0000-000000000004', 'q0000000-0000-0000-0001-000000000026', 'do', false, 3),
  ('qc000000-0001-0027-0000-000000000001', 'q0000000-0000-0000-0001-000000000027', 'True', false, 0),
  ('qc000000-0001-0027-0000-000000000002', 'q0000000-0000-0000-0001-000000000027', 'False', true, 1),
  ('qc000000-0001-0028-0000-000000000001', 'q0000000-0000-0000-0001-000000000028', 'are', true, 0),
  ('qc000000-0001-0028-0000-000000000002', 'q0000000-0000-0000-0001-000000000028', 'is', false, 1),
  ('qc000000-0001-0028-0000-000000000003', 'q0000000-0000-0000-0001-000000000028', 'am', false, 2),
  ('qc000000-0001-0028-0000-000000000004', 'q0000000-0000-0000-0001-000000000028', 'be', false, 3)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A1 QUESTIONS — Present Simple & Objects
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, status, created_by) VALUES
  ('q0000000-0000-0000-0001-000000000029', 'multiple_choice', 'She ___ English every day.', 'beginner', 'With he/she/it in present simple, we add -s to the verb: reads, eats, speaks.', 'She is one person — add -s to the verb.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000030', 'fill_in_the_blank', 'I ___ not like coffee. (do / does)', 'beginner', 'With I/you/we/they, we use "do not" (don''t): I do not like coffee.', 'What helper verb goes with "I"?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000031', 'multiple_choice', '___ you speak Arabic?', 'beginner', 'For yes/no questions in present simple with I/you/we/they, start with "Do".', 'For questions with "you", start with Do or Does?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000032', 'multiple_choice', 'This is ___ pen. (a / an)', 'beginner', 'We use "a" before consonant sounds: a pen, a book. We use "an" before vowel sounds: an apple.', '"Pen" starts with P — a consonant sound.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000033', 'multiple_choice', 'I want ___ apple, please.', 'beginner', 'We use "an" before words that start with a vowel sound: an apple, an orange, an egg.', '"Apple" starts with A — a vowel sound.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000034', 'fill_in_the_blank', 'The book is ___ the table. (on / in / under)', 'beginner', '"On" means on top of a surface. The book is on the table.', 'The book is sitting on top of the table surface.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0001-000000000035', 'true_false', '"She read books every day" is correct English.', 'beginner', 'This is incorrect. With "she" in present simple, we add -s: She reads books every day.', NULL, 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0029-0000-000000000001', 'q0000000-0000-0000-0001-000000000029', 'reads', true, 0),
  ('qc000000-0001-0029-0000-000000000002', 'q0000000-0000-0000-0001-000000000029', 'read', false, 1),
  ('qc000000-0001-0029-0000-000000000003', 'q0000000-0000-0000-0001-000000000029', 'reading', false, 2),
  ('qc000000-0001-0029-0000-000000000004', 'q0000000-0000-0000-0001-000000000029', 'readed', false, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_answers (id, question_id, answer_type, value) VALUES
  ('qa000000-0001-0030-0000-000000000001', 'q0000000-0000-0000-0001-000000000030', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["do", "Do"]}], "case_sensitive": false}'),
  ('qa000000-0001-0034-0000-000000000001', 'q0000000-0000-0000-0001-000000000034', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["on", "On"]}], "case_sensitive": false}')
ON CONFLICT (question_id) DO NOTHING;

INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0001-0031-0000-000000000001', 'q0000000-0000-0000-0001-000000000031', 'Do', true, 0),
  ('qc000000-0001-0031-0000-000000000002', 'q0000000-0000-0000-0001-000000000031', 'Does', false, 1),
  ('qc000000-0001-0031-0000-000000000003', 'q0000000-0000-0000-0001-000000000031', 'Are', false, 2),
  ('qc000000-0001-0031-0000-000000000004', 'q0000000-0000-0000-0001-000000000031', 'Is', false, 3),
  ('qc000000-0001-0032-0000-000000000001', 'q0000000-0000-0000-0001-000000000032', 'a', true, 0),
  ('qc000000-0001-0032-0000-000000000002', 'q0000000-0000-0000-0001-000000000032', 'an', false, 1),
  ('qc000000-0001-0032-0000-000000000003', 'q0000000-0000-0000-0001-000000000032', 'the', false, 2),
  ('qc000000-0001-0032-0000-000000000004', 'q0000000-0000-0000-0001-000000000032', 'some', false, 3),
  ('qc000000-0001-0033-0000-000000000001', 'q0000000-0000-0000-0001-000000000033', 'an', true, 0),
  ('qc000000-0001-0033-0000-000000000002', 'q0000000-0000-0000-0001-000000000033', 'a', false, 1),
  ('qc000000-0001-0033-0000-000000000003', 'q0000000-0000-0000-0001-000000000033', 'the', false, 2),
  ('qc000000-0001-0033-0000-000000000004', 'q0000000-0000-0000-0001-000000000033', 'some', false, 3),
  ('qc000000-0001-0035-0000-000000000001', 'q0000000-0000-0000-0001-000000000035', 'True', false, 0),
  ('qc000000-0001-0035-0000-000000000002', 'q0000000-0000-0000-0001-000000000035', 'False', true, 1)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- QUESTION SKILLS — link A1 questions to their primary skills
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO question_skills (question_id, skill_id, is_primary) VALUES
  -- Phonics questions
  ('q0000000-0000-0000-0001-000000000001', 's0000000-0000-0000-0001-000000000001', true),  -- uppercase recognition
  ('q0000000-0000-0000-0001-000000000002', 's0000000-0000-0000-0001-000000000001', true),
  ('q0000000-0000-0000-0001-000000000003', 's0000000-0000-0000-0001-000000000002', true),  -- lowercase recognition
  ('q0000000-0000-0000-0001-000000000004', 's0000000-0000-0000-0001-000000000004', true),  -- consonant sounds
  ('q0000000-0000-0000-0001-000000000005', 's0000000-0000-0000-0001-000000000003', true),  -- short vowels
  -- Greetings & identity questions
  ('q0000000-0000-0000-0001-000000000006', 's0000000-0000-0000-0001-000000000011', true),  -- greetings
  ('q0000000-0000-0000-0001-000000000007', 's0000000-0000-0000-0001-000000000011', true),
  ('q0000000-0000-0000-0001-000000000008', 's0000000-0000-0000-0001-000000000012', true),  -- personal identity
  ('q0000000-0000-0000-0001-000000000009', 's0000000-0000-0000-0001-000000000011', true),
  ('q0000000-0000-0000-0001-000000000010', 's0000000-0000-0000-0001-000000000011', true),
  -- Numbers & days questions
  ('q0000000-0000-0000-0001-000000000011', 's0000000-0000-0000-0001-000000000013', true),  -- numbers 0-20
  ('q0000000-0000-0000-0001-000000000012', 's0000000-0000-0000-0001-000000000015', true),  -- days of week
  ('q0000000-0000-0000-0001-000000000013', 's0000000-0000-0000-0001-000000000017', true),  -- telling time
  ('q0000000-0000-0000-0001-000000000014', 's0000000-0000-0000-0001-000000000015', true),
  ('q0000000-0000-0000-0001-000000000015', 's0000000-0000-0000-0001-000000000013', true),
  -- Family & describing people questions
  ('q0000000-0000-0000-0001-000000000016', 's0000000-0000-0000-0001-000000000018', true),  -- family members
  ('q0000000-0000-0000-0001-000000000017', 's0000000-0000-0000-0001-000000000019', true),  -- describing people
  ('q0000000-0000-0000-0001-000000000018', 's0000000-0000-0000-0001-000000000019', true),
  ('q0000000-0000-0000-0001-000000000019', 's0000000-0000-0000-0001-000000000021', true),  -- colors
  ('q0000000-0000-0000-0001-000000000020', 's0000000-0000-0000-0001-000000000018', true),
  -- To be questions
  ('q0000000-0000-0000-0001-000000000021', 's0000000-0000-0000-0001-000000000036', true),  -- to be affirmative
  ('q0000000-0000-0000-0001-000000000022', 's0000000-0000-0000-0001-000000000036', true),
  ('q0000000-0000-0000-0001-000000000023', 's0000000-0000-0000-0001-000000000036', true),
  ('q0000000-0000-0000-0001-000000000024', 's0000000-0000-0000-0001-000000000037', true),  -- to be negative
  ('q0000000-0000-0000-0001-000000000025', 's0000000-0000-0000-0001-000000000038', true),  -- to be questions
  ('q0000000-0000-0000-0001-000000000026', 's0000000-0000-0000-0001-000000000039', true),  -- to be wh-questions
  ('q0000000-0000-0000-0001-000000000027', 's0000000-0000-0000-0001-000000000036', true),
  ('q0000000-0000-0000-0001-000000000028', 's0000000-0000-0000-0001-000000000036', true),
  -- Present simple & vocabulary questions
  ('q0000000-0000-0000-0001-000000000029', 's0000000-0000-0000-0001-000000000042', true),  -- present simple aff
  ('q0000000-0000-0000-0001-000000000030', 's0000000-0000-0000-0001-000000000043', true),  -- present simple neg
  ('q0000000-0000-0000-0001-000000000031', 's0000000-0000-0000-0001-000000000044', true),  -- present simple yn q
  ('q0000000-0000-0000-0001-000000000032', 's0000000-0000-0000-0001-000000000032', true),  -- indefinite articles
  ('q0000000-0000-0000-0001-000000000033', 's0000000-0000-0000-0001-000000000032', true),
  ('q0000000-0000-0000-0001-000000000034', 's0000000-0000-0000-0001-000000000029', true),  -- prepositions of place
  ('q0000000-0000-0000-0001-000000000035', 's0000000-0000-0000-0001-000000000042', true)   -- present simple aff
ON CONFLICT DO NOTHING;

COMMIT;
