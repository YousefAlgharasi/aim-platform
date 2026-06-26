-- =============================================================================
-- AIM Platform Seed — Part 5: Question Bank (A2 & A3 Questions)
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- A2 QUESTIONS (20 questions)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, status, created_by) VALUES
  -- Past Simple
  ('q0000000-0000-0000-0002-000000000001', 'fill_in_the_blank', 'Yesterday I ___ to school. (walk)', 'elementary', 'To make the past simple of regular verbs, add -ed: walk → walked.', 'Add -ed to the verb.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000002', 'multiple_choice', 'She ___ breakfast at 7 o''clock yesterday.', 'elementary', 'The past simple of "have" is "had". She had breakfast.', '"Have" is an irregular verb.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000003', 'multiple_choice', 'They ___ to the park last Sunday.', 'elementary', 'The past simple of "go" is "went". They went to the park.', '"Go" is an irregular verb — the past is not "goed".', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000004', 'fill_in_the_blank', 'He ___ not go to school yesterday. (did / was)', 'elementary', 'For past simple negatives, we use "did not" (didn''t) + base verb: He did not go.', 'The helper verb for past negative is "did".', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000005', 'multiple_choice', '___ you see the film last night?', 'elementary', 'For past simple questions: Did + subject + base verb: Did you see?', 'Start with the past tense helper verb.', 'published', '00000000-0000-0000-0000-000000000001'),
  -- Future
  ('q0000000-0000-0000-0002-000000000006', 'fill_in_the_blank', 'I am ___ to visit my grandmother next week. (go / going)', 'elementary', 'For planned future: am/is/are + going to + verb: I am going to visit.', 'Use the -ing form with "am".', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000007', 'multiple_choice', 'I think it ___ rain tomorrow.', 'elementary', 'For predictions and spontaneous decisions, use "will" + base verb: It will rain.', 'For predictions about the future, use "will".', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000008', 'true_false', '"I am going to study medicine next year" talks about a future plan.', 'elementary', '"Going to" is used for planned future actions. This sentence describes a plan.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  -- Comparatives & Superlatives
  ('q0000000-0000-0000-0002-000000000009', 'multiple_choice', 'A car is ___ than a bicycle.', 'elementary', 'For short adjectives, add -er: fast → faster. A car is faster than a bicycle.', 'Add -er to make a comparison.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000010', 'fill_in_the_blank', 'Mount Everest is the ___ mountain in the world. (tall)', 'elementary', 'For superlatives of short adjectives, use "the" + adjective + -est: the tallest.', 'Use "the" and add -est.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000011', 'multiple_choice', 'This book is ___ interesting than that one.', 'elementary', 'For long adjectives (3+ syllables), use "more" + adjective: more interesting.', '"Interesting" is a long word — use "more" instead of -er.', 'published', '00000000-0000-0000-0000-000000000001'),
  -- Present Continuous
  ('q0000000-0000-0000-0002-000000000012', 'fill_in_the_blank', 'She is ___ a book right now. (read)', 'elementary', 'For present continuous: am/is/are + verb-ing: She is reading.', 'Add -ing to the verb.', 'published', '00000000-0000-0000-0000-000000000001'),
  -- Daily Life Vocabulary
  ('q0000000-0000-0000-0002-000000000013', 'multiple_choice', 'What do you wear when it is cold outside?', 'elementary', 'When it is cold, we wear a jacket, a scarf, or a coat to keep warm.', 'Think about winter clothes.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000014', 'multiple_choice', 'A person who helps sick people in a hospital is a ___.', 'elementary', 'A doctor works in a hospital and helps sick people get better.', 'This person works in a hospital.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000015', 'fill_in_the_blank', 'I go to school by ___. It stops at the bus stop. (bus / car)', 'elementary', 'A bus is a large vehicle that carries many people and stops at bus stops.', 'Which vehicle has "stops"?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000016', 'true_false', '"It is sunny" means the weather is good and the sun is shining.', 'elementary', 'Sunny means the sun is visible in the sky with few or no clouds.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  -- Countable/Uncountable
  ('q0000000-0000-0000-0002-000000000017', 'multiple_choice', 'How ___ water do you drink every day?', 'elementary', 'Water is uncountable, so we use "much" not "many": How much water?', 'Water cannot be counted — use "much".', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000018', 'multiple_choice', 'There are ___ apples in the basket.', 'elementary', 'Apples are countable, and "some" is used in affirmative sentences for plural countable nouns.', 'Apples can be counted.', 'published', '00000000-0000-0000-0000-000000000001'),
  -- Reading
  ('q0000000-0000-0000-0002-000000000019', 'multiple_choice', 'Read: "Ali woke up at 7. He had breakfast. Then he went to school." What did Ali do first?', 'elementary', 'According to the text, Ali woke up at 7 first, then had breakfast, then went to school.', 'Read the sentences in order.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0002-000000000020', 'true_false', 'Read: "Dear Sara, I am fine. I went to the beach yesterday. It was fun. See you soon, Nora." Nora went to the beach today.', 'elementary', 'The email says "yesterday", not today. Nora went to the beach yesterday.', NULL, 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- A2 Question Choices
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0002-0002-0000-000000000001', 'q0000000-0000-0000-0002-000000000002', 'had', true, 0),
  ('qc000000-0002-0002-0000-000000000002', 'q0000000-0000-0000-0002-000000000002', 'has', false, 1),
  ('qc000000-0002-0002-0000-000000000003', 'q0000000-0000-0000-0002-000000000002', 'have', false, 2),
  ('qc000000-0002-0002-0000-000000000004', 'q0000000-0000-0000-0002-000000000002', 'having', false, 3),
  ('qc000000-0002-0003-0000-000000000001', 'q0000000-0000-0000-0002-000000000003', 'went', true, 0),
  ('qc000000-0002-0003-0000-000000000002', 'q0000000-0000-0000-0002-000000000003', 'goed', false, 1),
  ('qc000000-0002-0003-0000-000000000003', 'q0000000-0000-0000-0002-000000000003', 'go', false, 2),
  ('qc000000-0002-0003-0000-000000000004', 'q0000000-0000-0000-0002-000000000003', 'gone', false, 3),
  ('qc000000-0002-0005-0000-000000000001', 'q0000000-0000-0000-0002-000000000005', 'Did', true, 0),
  ('qc000000-0002-0005-0000-000000000002', 'q0000000-0000-0000-0002-000000000005', 'Do', false, 1),
  ('qc000000-0002-0005-0000-000000000003', 'q0000000-0000-0000-0002-000000000005', 'Does', false, 2),
  ('qc000000-0002-0005-0000-000000000004', 'q0000000-0000-0000-0002-000000000005', 'Were', false, 3),
  ('qc000000-0002-0007-0000-000000000001', 'q0000000-0000-0000-0002-000000000007', 'will', true, 0),
  ('qc000000-0002-0007-0000-000000000002', 'q0000000-0000-0000-0002-000000000007', 'going to', false, 1),
  ('qc000000-0002-0007-0000-000000000003', 'q0000000-0000-0000-0002-000000000007', 'is', false, 2),
  ('qc000000-0002-0007-0000-000000000004', 'q0000000-0000-0000-0002-000000000007', 'does', false, 3),
  ('qc000000-0002-0008-0000-000000000001', 'q0000000-0000-0000-0002-000000000008', 'True', true, 0),
  ('qc000000-0002-0008-0000-000000000002', 'q0000000-0000-0000-0002-000000000008', 'False', false, 1),
  ('qc000000-0002-0009-0000-000000000001', 'q0000000-0000-0000-0002-000000000009', 'faster', true, 0),
  ('qc000000-0002-0009-0000-000000000002', 'q0000000-0000-0000-0002-000000000009', 'more fast', false, 1),
  ('qc000000-0002-0009-0000-000000000003', 'q0000000-0000-0000-0002-000000000009', 'fastest', false, 2),
  ('qc000000-0002-0009-0000-000000000004', 'q0000000-0000-0000-0002-000000000009', 'fast', false, 3),
  ('qc000000-0002-0011-0000-000000000001', 'q0000000-0000-0000-0002-000000000011', 'more', true, 0),
  ('qc000000-0002-0011-0000-000000000002', 'q0000000-0000-0000-0002-000000000011', 'most', false, 1),
  ('qc000000-0002-0011-0000-000000000003', 'q0000000-0000-0000-0002-000000000011', 'interestinger', false, 2),
  ('qc000000-0002-0011-0000-000000000004', 'q0000000-0000-0000-0002-000000000011', 'very', false, 3),
  ('qc000000-0002-0013-0000-000000000001', 'q0000000-0000-0000-0002-000000000013', 'A jacket', true, 0),
  ('qc000000-0002-0013-0000-000000000002', 'q0000000-0000-0000-0002-000000000013', 'Sunglasses', false, 1),
  ('qc000000-0002-0013-0000-000000000003', 'q0000000-0000-0000-0002-000000000013', 'Shorts', false, 2),
  ('qc000000-0002-0013-0000-000000000004', 'q0000000-0000-0000-0002-000000000013', 'A swimsuit', false, 3),
  ('qc000000-0002-0014-0000-000000000001', 'q0000000-0000-0000-0002-000000000014', 'doctor', true, 0),
  ('qc000000-0002-0014-0000-000000000002', 'q0000000-0000-0000-0002-000000000014', 'teacher', false, 1),
  ('qc000000-0002-0014-0000-000000000003', 'q0000000-0000-0000-0002-000000000014', 'driver', false, 2),
  ('qc000000-0002-0014-0000-000000000004', 'q0000000-0000-0000-0002-000000000014', 'engineer', false, 3),
  ('qc000000-0002-0016-0000-000000000001', 'q0000000-0000-0000-0002-000000000016', 'True', true, 0),
  ('qc000000-0002-0016-0000-000000000002', 'q0000000-0000-0000-0002-000000000016', 'False', false, 1),
  ('qc000000-0002-0017-0000-000000000001', 'q0000000-0000-0000-0002-000000000017', 'much', true, 0),
  ('qc000000-0002-0017-0000-000000000002', 'q0000000-0000-0000-0002-000000000017', 'many', false, 1),
  ('qc000000-0002-0017-0000-000000000003', 'q0000000-0000-0000-0002-000000000017', 'a few', false, 2),
  ('qc000000-0002-0017-0000-000000000004', 'q0000000-0000-0000-0002-000000000017', 'any', false, 3),
  ('qc000000-0002-0018-0000-000000000001', 'q0000000-0000-0000-0002-000000000018', 'some', true, 0),
  ('qc000000-0002-0018-0000-000000000002', 'q0000000-0000-0000-0002-000000000018', 'much', false, 1),
  ('qc000000-0002-0018-0000-000000000003', 'q0000000-0000-0000-0002-000000000018', 'a', false, 2),
  ('qc000000-0002-0018-0000-000000000004', 'q0000000-0000-0000-0002-000000000018', 'any', false, 3),
  ('qc000000-0002-0019-0000-000000000001', 'q0000000-0000-0000-0002-000000000019', 'He woke up', true, 0),
  ('qc000000-0002-0019-0000-000000000002', 'q0000000-0000-0000-0002-000000000019', 'He had breakfast', false, 1),
  ('qc000000-0002-0019-0000-000000000003', 'q0000000-0000-0000-0002-000000000019', 'He went to school', false, 2),
  ('qc000000-0002-0019-0000-000000000004', 'q0000000-0000-0000-0002-000000000019', 'He ate lunch', false, 3),
  ('qc000000-0002-0020-0000-000000000001', 'q0000000-0000-0000-0002-000000000020', 'True', false, 0),
  ('qc000000-0002-0020-0000-000000000002', 'q0000000-0000-0000-0002-000000000020', 'False', true, 1)
ON CONFLICT (id) DO NOTHING;

-- A2 Fill-in-the-blank answers
INSERT INTO question_answers (id, question_id, answer_type, value) VALUES
  ('qa000000-0002-0001-0000-000000000001', 'q0000000-0000-0000-0002-000000000001', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["walked", "Walked"]}], "case_sensitive": false}'),
  ('qa000000-0002-0004-0000-000000000001', 'q0000000-0000-0000-0002-000000000004', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["did", "Did"]}], "case_sensitive": false}'),
  ('qa000000-0002-0006-0000-000000000001', 'q0000000-0000-0000-0002-000000000006', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["going", "Going"]}], "case_sensitive": false}'),
  ('qa000000-0002-0010-0000-000000000001', 'q0000000-0000-0000-0002-000000000010', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["tallest", "Tallest"]}], "case_sensitive": false}'),
  ('qa000000-0002-0012-0000-000000000001', 'q0000000-0000-0000-0002-000000000012', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["reading", "Reading"]}], "case_sensitive": false}'),
  ('qa000000-0002-0015-0000-000000000001', 'q0000000-0000-0000-0002-000000000015', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["bus", "Bus"]}], "case_sensitive": false}')
ON CONFLICT (question_id) DO NOTHING;

-- A2 Question Skills
INSERT INTO question_skills (question_id, skill_id, is_primary) VALUES
  ('q0000000-0000-0000-0002-000000000001', 's0000000-0000-0000-0002-000000000001', true),
  ('q0000000-0000-0000-0002-000000000002', 's0000000-0000-0000-0002-000000000002', true),
  ('q0000000-0000-0000-0002-000000000003', 's0000000-0000-0000-0002-000000000002', true),
  ('q0000000-0000-0000-0002-000000000004', 's0000000-0000-0000-0002-000000000003', true),
  ('q0000000-0000-0000-0002-000000000005', 's0000000-0000-0000-0002-000000000004', true),
  ('q0000000-0000-0000-0002-000000000006', 's0000000-0000-0000-0002-000000000005', true),
  ('q0000000-0000-0000-0002-000000000007', 's0000000-0000-0000-0002-000000000006', true),
  ('q0000000-0000-0000-0002-000000000008', 's0000000-0000-0000-0002-000000000005', true),
  ('q0000000-0000-0000-0002-000000000009', 's0000000-0000-0000-0002-000000000007', true),
  ('q0000000-0000-0000-0002-000000000010', 's0000000-0000-0000-0002-000000000008', true),
  ('q0000000-0000-0000-0002-000000000011', 's0000000-0000-0000-0002-000000000007', true),
  ('q0000000-0000-0000-0002-000000000012', 's0000000-0000-0000-0002-000000000009', true),
  ('q0000000-0000-0000-0002-000000000013', 's0000000-0000-0000-0002-000000000012', true),
  ('q0000000-0000-0000-0002-000000000014', 's0000000-0000-0000-0002-000000000017', true),
  ('q0000000-0000-0000-0002-000000000015', 's0000000-0000-0000-0002-000000000013', true),
  ('q0000000-0000-0000-0002-000000000016', 's0000000-0000-0000-0002-000000000011', true),
  ('q0000000-0000-0000-0002-000000000017', 's0000000-0000-0000-0002-000000000010', true),
  ('q0000000-0000-0000-0002-000000000018', 's0000000-0000-0000-0002-000000000010', true),
  ('q0000000-0000-0000-0002-000000000019', 's0000000-0000-0000-0002-000000000021', true),
  ('q0000000-0000-0000-0002-000000000020', 's0000000-0000-0000-0002-000000000022', true)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A3 QUESTIONS (20 questions)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, status, created_by) VALUES
  -- Present Perfect
  ('q0000000-0000-0000-0003-000000000001', 'fill_in_the_blank', 'I ___ visited London three times. (have / has)', 'intermediate', 'With I/you/we/they, use "have" + past participle: I have visited.', 'What helper verb goes with "I"?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000002', 'multiple_choice', 'She ___ never eaten sushi.', 'intermediate', 'With she/he/it, use "has" + past participle: She has never eaten.', '"She" uses has, not have.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000003', 'multiple_choice', 'I have lived here ___ five years.', 'intermediate', 'Use "for" with a period of time (five years, two months). Use "since" with a point in time (2019, Monday).', '"Five years" is a period of time.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000004', 'true_false', '"I have gone to Paris last summer" is correct English.', 'intermediate', 'This is incorrect. "Last summer" is a finished time, so we use past simple: I went to Paris last summer.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  -- Conditionals
  ('q0000000-0000-0000-0003-000000000005', 'fill_in_the_blank', 'If it rains, I ___ stay home. (will / would)', 'intermediate', 'First conditional uses if + present, will + base verb: If it rains, I will stay home. This is a real possibility.', 'This is a real possibility — use "will".', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000006', 'multiple_choice', 'If I ___ rich, I would travel the world.', 'intermediate', 'Second conditional uses if + past simple, would + base verb: If I were rich, I would travel. This is imaginary.', 'This is an imaginary situation — use past tense.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000007', 'multiple_choice', 'You ___ see a doctor. You look very sick.', 'intermediate', 'We use "should" to give advice: You should see a doctor.', 'What modal verb gives advice?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000008', 'true_false', '"You must wear a seatbelt" means it is your choice.', 'intermediate', '"Must" expresses obligation, not choice. It means you have no choice — it is required.', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  -- Passive Voice
  ('q0000000-0000-0000-0003-000000000009', 'multiple_choice', 'English ___ spoken in many countries.', 'intermediate', 'Present passive: is/are + past participle. English is spoken (by people) in many countries.', 'The subject receives the action.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000010', 'fill_in_the_blank', 'The Pyramids ___ built thousands of years ago. (was / were)', 'intermediate', 'The Pyramids is plural, so we use "were": The Pyramids were built.', '"Pyramids" is plural — which form of "be" is plural past?', 'published', '00000000-0000-0000-0000-000000000001'),
  -- Relative Clauses
  ('q0000000-0000-0000-0003-000000000011', 'multiple_choice', 'The man ___ lives next door is a doctor.', 'intermediate', 'Use "who" for people in relative clauses: The man who lives next door.', 'We are talking about a person.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000012', 'multiple_choice', 'The book ___ I read was very interesting.', 'intermediate', 'Use "that" or "which" for things: The book that/which I read.', 'We are talking about a thing, not a person.', 'published', '00000000-0000-0000-0000-000000000001'),
  -- Gerunds & Infinitives
  ('q0000000-0000-0000-0003-000000000013', 'multiple_choice', 'I enjoy ___ books in the evening.', 'intermediate', 'After "enjoy", we use the -ing form (gerund): I enjoy reading.', '"Enjoy" is always followed by -ing.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000014', 'fill_in_the_blank', 'She wants ___ learn English. (to / for)', 'intermediate', 'After "want", we use "to" + base verb (infinitive): She wants to learn.', '"Want" is followed by "to" + verb.', 'published', '00000000-0000-0000-0000-000000000001'),
  -- Vocabulary
  ('q0000000-0000-0000-0003-000000000015', 'multiple_choice', 'You need a ___ to access the internet.', 'intermediate', 'A password is a secret word or code that lets you access accounts and the internet.', 'It is something you type to log in.', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000016', 'fill_in_the_blank', 'We should ___ plastic to help the environment. (recycle / pollute)', 'intermediate', 'To recycle means to process waste materials so they can be used again. This helps the environment.', 'Which action helps the environment?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000017', 'multiple_choice', '"Turn off" the light means:', 'intermediate', '"Turn off" means to stop a device or light from working. It is the opposite of "turn on".', NULL, 'published', '00000000-0000-0000-0000-000000000001'),
  -- Opinions
  ('q0000000-0000-0000-0003-000000000018', 'multiple_choice', 'Which phrase is used to disagree politely?', 'intermediate', '"I see your point, but..." is a polite way to disagree. It shows you listened before disagreeing.', 'Look for the phrase that is respectful.', 'published', '00000000-0000-0000-0000-000000000001'),
  -- Reading
  ('q0000000-0000-0000-0003-000000000019', 'multiple_choice', 'Read: "Studies show that exercise reduces stress. Experts recommend 30 minutes of activity per day." What is the main idea?', 'intermediate', 'The main idea is that exercise helps reduce stress, supported by expert recommendations.', 'What do both sentences talk about?', 'published', '00000000-0000-0000-0000-000000000001'),
  ('q0000000-0000-0000-0003-000000000020', 'true_false', 'Read: "Dear Mr. Smith, I am writing to apply for the position of English teacher. I have five years of experience. Yours sincerely, Nada." This is an informal email.', 'intermediate', 'This email uses "Dear Mr. Smith" and "Yours sincerely" — these are formal greetings and sign-offs.', NULL, 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- A3 Question Choices
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  ('qc000000-0003-0002-0000-000000000001', 'q0000000-0000-0000-0003-000000000002', 'has', true, 0),
  ('qc000000-0003-0002-0000-000000000002', 'q0000000-0000-0000-0003-000000000002', 'have', false, 1),
  ('qc000000-0003-0002-0000-000000000003', 'q0000000-0000-0000-0003-000000000002', 'had', false, 2),
  ('qc000000-0003-0002-0000-000000000004', 'q0000000-0000-0000-0003-000000000002', 'is', false, 3),
  ('qc000000-0003-0003-0000-000000000001', 'q0000000-0000-0000-0003-000000000003', 'for', true, 0),
  ('qc000000-0003-0003-0000-000000000002', 'q0000000-0000-0000-0003-000000000003', 'since', false, 1),
  ('qc000000-0003-0003-0000-000000000003', 'q0000000-0000-0000-0003-000000000003', 'from', false, 2),
  ('qc000000-0003-0003-0000-000000000004', 'q0000000-0000-0000-0003-000000000003', 'during', false, 3),
  ('qc000000-0003-0004-0000-000000000001', 'q0000000-0000-0000-0003-000000000004', 'True', false, 0),
  ('qc000000-0003-0004-0000-000000000002', 'q0000000-0000-0000-0003-000000000004', 'False', true, 1),
  ('qc000000-0003-0006-0000-000000000001', 'q0000000-0000-0000-0003-000000000006', 'were', true, 0),
  ('qc000000-0003-0006-0000-000000000002', 'q0000000-0000-0000-0003-000000000006', 'am', false, 1),
  ('qc000000-0003-0006-0000-000000000003', 'q0000000-0000-0000-0003-000000000006', 'will be', false, 2),
  ('qc000000-0003-0006-0000-000000000004', 'q0000000-0000-0000-0003-000000000006', 'have been', false, 3),
  ('qc000000-0003-0007-0000-000000000001', 'q0000000-0000-0000-0003-000000000007', 'should', true, 0),
  ('qc000000-0003-0007-0000-000000000002', 'q0000000-0000-0000-0003-000000000007', 'can', false, 1),
  ('qc000000-0003-0007-0000-000000000003', 'q0000000-0000-0000-0003-000000000007', 'will', false, 2),
  ('qc000000-0003-0007-0000-000000000004', 'q0000000-0000-0000-0003-000000000007', 'may', false, 3),
  ('qc000000-0003-0008-0000-000000000001', 'q0000000-0000-0000-0003-000000000008', 'True', false, 0),
  ('qc000000-0003-0008-0000-000000000002', 'q0000000-0000-0000-0003-000000000008', 'False', true, 1),
  ('qc000000-0003-0009-0000-000000000001', 'q0000000-0000-0000-0003-000000000009', 'is', true, 0),
  ('qc000000-0003-0009-0000-000000000002', 'q0000000-0000-0000-0003-000000000009', 'are', false, 1),
  ('qc000000-0003-0009-0000-000000000003', 'q0000000-0000-0000-0003-000000000009', 'was', false, 2),
  ('qc000000-0003-0009-0000-000000000004', 'q0000000-0000-0000-0003-000000000009', 'has', false, 3),
  ('qc000000-0003-0011-0000-000000000001', 'q0000000-0000-0000-0003-000000000011', 'who', true, 0),
  ('qc000000-0003-0011-0000-000000000002', 'q0000000-0000-0000-0003-000000000011', 'which', false, 1),
  ('qc000000-0003-0011-0000-000000000003', 'q0000000-0000-0000-0003-000000000011', 'where', false, 2),
  ('qc000000-0003-0011-0000-000000000004', 'q0000000-0000-0000-0003-000000000011', 'what', false, 3),
  ('qc000000-0003-0012-0000-000000000001', 'q0000000-0000-0000-0003-000000000012', 'that', true, 0),
  ('qc000000-0003-0012-0000-000000000002', 'q0000000-0000-0000-0003-000000000012', 'who', false, 1),
  ('qc000000-0003-0012-0000-000000000003', 'q0000000-0000-0000-0003-000000000012', 'where', false, 2),
  ('qc000000-0003-0012-0000-000000000004', 'q0000000-0000-0000-0003-000000000012', 'when', false, 3),
  ('qc000000-0003-0013-0000-000000000001', 'q0000000-0000-0000-0003-000000000013', 'reading', true, 0),
  ('qc000000-0003-0013-0000-000000000002', 'q0000000-0000-0000-0003-000000000013', 'to read', false, 1),
  ('qc000000-0003-0013-0000-000000000003', 'q0000000-0000-0000-0003-000000000013', 'read', false, 2),
  ('qc000000-0003-0013-0000-000000000004', 'q0000000-0000-0000-0003-000000000013', 'reads', false, 3),
  ('qc000000-0003-0015-0000-000000000001', 'q0000000-0000-0000-0003-000000000015', 'password', true, 0),
  ('qc000000-0003-0015-0000-000000000002', 'q0000000-0000-0000-0003-000000000015', 'keyboard', false, 1),
  ('qc000000-0003-0015-0000-000000000003', 'q0000000-0000-0000-0003-000000000015', 'website', false, 2),
  ('qc000000-0003-0015-0000-000000000004', 'q0000000-0000-0000-0003-000000000015', 'download', false, 3),
  ('qc000000-0003-0017-0000-000000000001', 'q0000000-0000-0000-0003-000000000017', 'Stop the light from working', true, 0),
  ('qc000000-0003-0017-0000-000000000002', 'q0000000-0000-0000-0003-000000000017', 'Make the light brighter', false, 1),
  ('qc000000-0003-0017-0000-000000000003', 'q0000000-0000-0000-0003-000000000017', 'Move the light', false, 2),
  ('qc000000-0003-0017-0000-000000000004', 'q0000000-0000-0000-0003-000000000017', 'Break the light', false, 3),
  ('qc000000-0003-0018-0000-000000000001', 'q0000000-0000-0000-0003-000000000018', 'I see your point, but...', true, 0),
  ('qc000000-0003-0018-0000-000000000002', 'q0000000-0000-0000-0003-000000000018', 'You are wrong.', false, 1),
  ('qc000000-0003-0018-0000-000000000003', 'q0000000-0000-0000-0003-000000000018', 'That is stupid.', false, 2),
  ('qc000000-0003-0018-0000-000000000004', 'q0000000-0000-0000-0003-000000000018', 'No way!', false, 3),
  ('qc000000-0003-0019-0000-000000000001', 'q0000000-0000-0000-0003-000000000019', 'Exercise helps reduce stress', true, 0),
  ('qc000000-0003-0019-0000-000000000002', 'q0000000-0000-0000-0003-000000000019', 'Experts are always right', false, 1),
  ('qc000000-0003-0019-0000-000000000003', 'q0000000-0000-0000-0003-000000000019', 'You must exercise for 30 minutes', false, 2),
  ('qc000000-0003-0019-0000-000000000004', 'q0000000-0000-0000-0003-000000000019', 'Stress is bad for you', false, 3),
  ('qc000000-0003-0020-0000-000000000001', 'q0000000-0000-0000-0003-000000000020', 'True', false, 0),
  ('qc000000-0003-0020-0000-000000000002', 'q0000000-0000-0000-0003-000000000020', 'False', true, 1)
ON CONFLICT (id) DO NOTHING;

-- A3 Fill-in-the-blank answers
INSERT INTO question_answers (id, question_id, answer_type, value) VALUES
  ('qa000000-0003-0001-0000-000000000001', 'q0000000-0000-0000-0003-000000000001', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["have", "Have"]}], "case_sensitive": false}'),
  ('qa000000-0003-0005-0000-000000000001', 'q0000000-0000-0000-0003-000000000005', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["will", "Will"]}], "case_sensitive": false}'),
  ('qa000000-0003-0010-0000-000000000001', 'q0000000-0000-0000-0003-000000000010', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["were", "Were"]}], "case_sensitive": false}'),
  ('qa000000-0003-0014-0000-000000000001', 'q0000000-0000-0000-0003-000000000014', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["to", "To"]}], "case_sensitive": false}'),
  ('qa000000-0003-0016-0000-000000000001', 'q0000000-0000-0000-0003-000000000016', 'fill_blank', '{"blanks": [{"position": 1, "accepted_values": ["recycle", "Recycle"]}], "case_sensitive": false}')
ON CONFLICT (question_id) DO NOTHING;

-- A3 Question Skills
INSERT INTO question_skills (question_id, skill_id, is_primary) VALUES
  ('q0000000-0000-0000-0003-000000000001', 's0000000-0000-0000-0003-000000000001', true),
  ('q0000000-0000-0000-0003-000000000002', 's0000000-0000-0000-0003-000000000001', true),
  ('q0000000-0000-0000-0003-000000000003', 's0000000-0000-0000-0003-000000000002', true),
  ('q0000000-0000-0000-0003-000000000004', 's0000000-0000-0000-0003-000000000002', true),
  ('q0000000-0000-0000-0003-000000000005', 's0000000-0000-0000-0003-000000000003', true),
  ('q0000000-0000-0000-0003-000000000006', 's0000000-0000-0000-0003-000000000004', true),
  ('q0000000-0000-0000-0003-000000000007', 's0000000-0000-0000-0003-000000000008', true),
  ('q0000000-0000-0000-0003-000000000008', 's0000000-0000-0000-0003-000000000008', true),
  ('q0000000-0000-0000-0003-000000000009', 's0000000-0000-0000-0003-000000000005', true),
  ('q0000000-0000-0000-0003-000000000010', 's0000000-0000-0000-0003-000000000006', true),
  ('q0000000-0000-0000-0003-000000000011', 's0000000-0000-0000-0003-000000000007', true),
  ('q0000000-0000-0000-0003-000000000012', 's0000000-0000-0000-0003-000000000007', true),
  ('q0000000-0000-0000-0003-000000000013', 's0000000-0000-0000-0003-000000000010', true),
  ('q0000000-0000-0000-0003-000000000014', 's0000000-0000-0000-0003-000000000010', true),
  ('q0000000-0000-0000-0003-000000000015', 's0000000-0000-0000-0003-000000000011', true),
  ('q0000000-0000-0000-0003-000000000016', 's0000000-0000-0000-0003-000000000012', true),
  ('q0000000-0000-0000-0003-000000000017', 's0000000-0000-0000-0003-000000000017', true),
  ('q0000000-0000-0000-0003-000000000018', 's0000000-0000-0000-0003-000000000018', true),
  ('q0000000-0000-0000-0003-000000000019', 's0000000-0000-0000-0003-000000000019', true),
  ('q0000000-0000-0000-0003-000000000020', 's0000000-0000-0000-0003-000000000022', true)
ON CONFLICT DO NOTHING;

COMMIT;
