-- =============================================================================
-- AIM Platform — Full Placement Test Content Seed
-- =============================================================================
-- Scope: Placement Test system (Phase 4)
-- Levels: A1 (Beginner) → A2 (Elementary) → B1 (Intermediate) → B2 (Upper-Int)
-- Sections: Grammar (15), Vocabulary (15), Listening (15) = 45 questions
-- All questions: multiple_choice, 4 options (A/B/C/D), progressive difficulty
--
-- Security: correct_answer values are backend-only; never exposed to students.
-- Safe to run multiple times — cleans old data first, then inserts fresh content.
-- =============================================================================

-- -----------------------------------------------------------------------
-- 0. Clean existing placeholder data (cascade deletes questions & skills map)
-- -----------------------------------------------------------------------

DELETE FROM placement_question_skills
WHERE placement_question_id IN (
  SELECT id FROM placement_questions
  WHERE placement_section_id IN (
    SELECT id FROM placement_sections
    WHERE placement_test_id = 'f4000000-0000-0000-0000-000000000001'
  )
);

DELETE FROM placement_questions
WHERE placement_section_id IN (
  SELECT id FROM placement_sections
  WHERE placement_test_id = 'f4000000-0000-0000-0000-000000000001'
);

DELETE FROM placement_sections
WHERE placement_test_id = 'f4000000-0000-0000-0000-000000000001';

-- -----------------------------------------------------------------------
-- 1. Placement Test (upsert — keep existing row)
-- -----------------------------------------------------------------------

UPDATE placement_tests
SET title = 'AIM English Placement Test',
    description = 'Comprehensive placement test covering Grammar, Vocabulary, and Listening from A1 to B2 level. Approximately 25 minutes.',
    estimated_minutes = 25,
    total_sections = 3,
    updated_at = now()
WHERE id = 'f4000000-0000-0000-0000-000000000001';

-- -----------------------------------------------------------------------
-- 2. Sections (3 sections, fixed order)
-- -----------------------------------------------------------------------

INSERT INTO placement_sections (id, placement_test_id, title, skill_code, order_index, total_questions)
VALUES
  ('f4000000-0000-0000-0001-000000000001', 'f4000000-0000-0000-0000-000000000001', 'Grammar',    'grammar',    1, 15),
  ('f4000000-0000-0000-0001-000000000002', 'f4000000-0000-0000-0000-000000000001', 'Vocabulary',  'vocabulary', 2, 15),
  ('f4000000-0000-0000-0001-000000000003', 'f4000000-0000-0000-0000-000000000001', 'Listening',   'listening',  3, 15)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 3. Placement Skills (for question-skill mapping)
-- -----------------------------------------------------------------------

INSERT INTO skills (id, key, title, description, domain, status)
VALUES
  -- Grammar skills
  ('d4000000-0000-0000-0001-000000000001', 'placement.grammar.verb_tenses',       'Verb Tenses',                'Correct use of present, past, future, and perfect tenses.',                  'grammar', 'published'),
  ('d4000000-0000-0000-0001-000000000002', 'placement.grammar.subject_verb',      'Subject-Verb Agreement',     'Matching subjects with correct verb forms.',                                 'grammar', 'published'),
  ('d4000000-0000-0000-0001-000000000003', 'placement.grammar.articles_preps',    'Articles & Prepositions',    'Correct use of a/an/the and common prepositions.',                           'grammar', 'published'),
  ('d4000000-0000-0000-0001-000000000004', 'placement.grammar.sentence_structure','Sentence Structure',         'Word order, negation, question formation, and clause construction.',         'grammar', 'published'),
  ('d4000000-0000-0000-0001-000000000005', 'placement.grammar.modals_conditionals','Modals & Conditionals',     'Use of can/could/should/would/must and conditional structures.',             'grammar', 'published'),

  -- Vocabulary skills
  ('d4000000-0000-0000-0002-000000000001', 'placement.vocabulary.word_meaning',   'Word Meaning & Synonyms',    'Understanding definitions, synonyms, and antonyms.',                         'vocabulary', 'published'),
  ('d4000000-0000-0000-0002-000000000002', 'placement.vocabulary.word_in_context','Word in Context',            'Choosing the correct word to complete a sentence meaningfully.',              'vocabulary', 'published'),
  ('d4000000-0000-0000-0002-000000000003', 'placement.vocabulary.collocations',   'Collocations & Phrases',     'Common word partnerships and fixed expressions.',                            'vocabulary', 'published'),
  ('d4000000-0000-0000-0002-000000000004', 'placement.vocabulary.reading_comp',   'Reading Comprehension',      'Understanding main ideas, details, and inferences from short passages.',     'vocabulary', 'published'),

  -- Listening skills
  ('d4000000-0000-0000-0003-000000000001', 'placement.listening.instructions',    'Spoken Instructions',        'Understanding simple to complex spoken instructions and requests.',          'listening', 'published'),
  ('d4000000-0000-0000-0003-000000000002', 'placement.listening.dialogue',        'Dialogue Comprehension',     'Understanding conversations between two or more speakers.',                  'listening', 'published'),
  ('d4000000-0000-0000-0003-000000000003', 'placement.listening.numbers_time',    'Numbers, Time & Data',       'Recognising numbers, times, prices, and factual data from spoken input.',    'listening', 'published'),
  ('d4000000-0000-0000-0003-000000000004', 'placement.listening.main_idea',       'Main Idea & Inference',      'Identifying the main point, purpose, or implied meaning of spoken passages.','listening', 'published')
ON CONFLICT (key) DO NOTHING;


-- =======================================================================
-- SECTION 1: GRAMMAR — 15 Questions (A1 → B2)
-- =======================================================================

INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, media_url, order_index, correct_answer)
VALUES

-- ── A1 Level (Q1–Q3): Basic verb forms, pronouns, simple present ──

('e4000000-0000-0001-0001-000000000001',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'She ___ a student at this school. (A) am (B) is (C) are (D) be',
 NULL, 1, 'B'),

('e4000000-0000-0001-0001-000000000002',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'They ___ breakfast every morning at seven o''clock. (A) has (B) having (C) have (D) is having',
 NULL, 2, 'C'),

('e4000000-0000-0001-0001-000000000003',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'I ___ from Egypt. Where are you from? (A) is (B) am (C) are (D) be',
 NULL, 3, 'B'),

-- ── A2 Level (Q4–Q6): Past simple, present continuous, comparatives ──

('e4000000-0000-0001-0001-000000000004',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'We ___ to the cinema last Friday, but the film was not very good. (A) go (B) goes (C) went (D) going',
 NULL, 4, 'C'),

('e4000000-0000-0001-0001-000000000005',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'Look! The children ___ in the garden right now. (A) play (B) plays (C) played (D) are playing',
 NULL, 5, 'D'),

('e4000000-0000-0001-0001-000000000006',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'This exercise is ___ than the last one. (A) more difficult (B) difficulter (C) most difficult (D) the difficult',
 NULL, 6, 'A'),

-- ── A2+ Level (Q7–Q9): Present perfect, prepositions, articles ──

('e4000000-0000-0001-0001-000000000007',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'I have never ___ to London, but I would love to visit. (A) be (B) been (C) being (D) was',
 NULL, 7, 'B'),

('e4000000-0000-0001-0001-000000000008',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'She is interested ___ learning new languages. (A) on (B) for (C) in (D) at',
 NULL, 8, 'C'),

('e4000000-0000-0001-0001-000000000009',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'My brother is ___ engineer. He works at ___ airport. (A) a / an (B) an / the (C) the / a (D) an / an',
 NULL, 9, 'B'),

-- ── B1 Level (Q10–Q12): Modals, passive voice, reported speech ──

('e4000000-0000-0001-0001-000000000010',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'You ___ wear a uniform at this school. It is the rule. (A) must (B) might (C) could (D) would',
 NULL, 10, 'A'),

('e4000000-0000-0001-0001-000000000011',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'This bridge ___ in 1889 and it is still used today. (A) built (B) was built (C) has built (D) is building',
 NULL, 11, 'B'),

('e4000000-0000-0001-0001-000000000012',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'She told me that she ___ the exam the day before. (A) passes (B) has passed (C) had passed (D) will pass',
 NULL, 12, 'C'),

-- ── B2 Level (Q13–Q15): Conditionals, relative clauses, advanced tenses ──

('e4000000-0000-0001-0001-000000000013',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'If I ___ about the meeting, I would have attended it. (A) know (B) knew (C) had known (D) have known',
 NULL, 13, 'C'),

('e4000000-0000-0001-0001-000000000014',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'The author, ___ latest novel became a bestseller, will give a talk tomorrow. (A) who (B) which (C) whose (D) whom',
 NULL, 14, 'C'),

('e4000000-0000-0001-0001-000000000015',
 'f4000000-0000-0000-0001-000000000001', 'multiple_choice',
 'By the time we arrive at the station, the train ___. (A) left (B) has left (C) will have left (D) leaves',
 NULL, 15, 'C')

ON CONFLICT (id) DO NOTHING;


-- =======================================================================
-- SECTION 2: VOCABULARY — 15 Questions (A1 → B2)
-- =======================================================================

INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, media_url, order_index, correct_answer)
VALUES

-- ── A1 Level (Q1–Q3): Basic everyday words ──

('e4000000-0000-0002-0001-000000000001',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'What is the opposite of "hot"? (A) warm (B) cold (C) fast (D) heavy',
 NULL, 1, 'B'),

('e4000000-0000-0002-0001-000000000002',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'A person who teaches students at school is called a ___. (A) doctor (B) driver (C) teacher (D) farmer',
 NULL, 2, 'C'),

('e4000000-0000-0002-0001-000000000003',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'You sleep in a ___. (A) kitchen (B) bathroom (C) bedroom (D) garden',
 NULL, 3, 'C'),

-- ── A2 Level (Q4–Q6): Word in context, common verbs ──

('e4000000-0000-0002-0001-000000000004',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'Can you ___ me your pen? I forgot mine at home. (A) borrow (B) lend (C) give back (D) take',
 NULL, 4, 'B'),

('e4000000-0000-0002-0001-000000000005',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'The weather is terrible — it has been ___ all day. (A) shining (B) snowing (C) raining (D) blowing',
 NULL, 5, 'C'),

('e4000000-0000-0002-0001-000000000006',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'I need to ___ an appointment with the dentist. (A) do (B) make (C) take (D) get',
 NULL, 6, 'B'),

-- ── A2+ Level (Q7–Q9): Collocations, phrasal meaning ──

('e4000000-0000-0002-0001-000000000007',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'Which word means "to arrive at a place"? (A) reach (B) leave (C) pass (D) miss',
 NULL, 7, 'A'),

('e4000000-0000-0002-0001-000000000008',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'She decided to ___ up a new hobby during the summer holidays. (A) give (B) take (C) put (D) set',
 NULL, 8, 'B'),

('e4000000-0000-0002-0001-000000000009',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'We ran out ___ milk, so I went to the shop to buy some. (A) from (B) with (C) of (D) for',
 NULL, 9, 'C'),

-- ── B1 Level (Q10–Q12): Reading passage comprehension ──

('e4000000-0000-0002-0001-000000000010',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'Passage: "Sara works as a journalist for a daily newspaper. Every morning she checks her emails, attends an editorial meeting, and then spends the rest of the day interviewing people or writing articles. She enjoys her job because no two days are the same." — What does Sara do for a living? (A) She is a teacher. (B) She is a journalist. (C) She is a secretary. (D) She is an editor.',
 NULL, 10, 'B'),

('e4000000-0000-0002-0001-000000000011',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'Passage (same as above) — Why does Sara enjoy her job? (A) She earns a lot of money. (B) She works short hours. (C) Every day is different. (D) She works from home.',
 NULL, 11, 'C'),

('e4000000-0000-0002-0001-000000000012',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'The word "reluctant" means ___. (A) eager and excited (B) unwilling or hesitant (C) confused and lost (D) loud and angry',
 NULL, 12, 'B'),

-- ── B2 Level (Q13–Q15): Advanced vocabulary, nuance, inference ──

('e4000000-0000-0002-0001-000000000013',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'The project was delayed due to ___ circumstances beyond our control. (A) unforeseen (B) unrelated (C) uncertain (D) uncomfortable',
 NULL, 13, 'A'),

('e4000000-0000-0002-0001-000000000014',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'Passage: "Despite receiving numerous complaints, the council decided to go ahead with the construction of the new car park. Residents argued that the noise would be unbearable and that the area already had sufficient parking. The council, however, maintained that the development was essential for the town''s growth." — What is the main point of this passage? (A) Residents support the new car park. (B) The council cancelled the project. (C) There is a disagreement between residents and the council. (D) The town does not need more parking.',
 NULL, 14, 'C'),

('e4000000-0000-0002-0001-000000000015',
 'f4000000-0000-0000-0001-000000000002', 'multiple_choice',
 'She has a ___ for remembering names — she never forgets anyone she has met. (A) talent (B) knack (C) skill (D) habit',
 NULL, 15, 'B')

ON CONFLICT (id) DO NOTHING;


-- =======================================================================
-- SECTION 3: LISTENING — 15 Questions (A1 → B2)
-- Audio references are placeholders — replace with real CDN URLs before production
-- =======================================================================

INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, media_url, order_index, correct_answer)
VALUES

-- ── A1 Level (Q1–Q3): Simple instructions and greetings ──

('e4000000-0000-0003-0001-000000000001',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] You hear: "Please open your book to page twelve." What should you do? (A) Close your book (B) Open your book to page 12 (C) Write on page 20 (D) Put your book away',
 'audio/placement/a1-listen-01-instruction.mp3', 1, 'B'),

('e4000000-0000-0003-0001-000000000002',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] You hear a woman say: "Hello, my name is Fatima. I come from Morocco and I am twenty-three years old." How old is Fatima? (A) 13 (B) 20 (C) 23 (D) 30',
 'audio/placement/a1-listen-02-intro.mp3', 2, 'C'),

('e4000000-0000-0003-0001-000000000003',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] You hear: "The train to London leaves at half past nine from platform four." What platform does the train leave from? (A) Platform 2 (B) Platform 3 (C) Platform 4 (D) Platform 9',
 'audio/placement/a1-listen-03-announcement.mp3', 3, 'C'),

-- ── A2 Level (Q4–Q6): Short dialogues, everyday situations ──

('e4000000-0000-0003-0001-000000000004',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Dialogue — Man: "Excuse me, how much is this shirt?" Woman: "It''s fifteen pounds, but we have a sale today — everything is half price." How much will the man pay? (A) £5.00 (B) £7.50 (C) £10.00 (D) £15.00',
 'audio/placement/a2-listen-04-shopping.mp3', 4, 'B'),

('e4000000-0000-0003-0001-000000000005',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Dialogue — Woman: "Would you like tea or coffee?" Man: "Coffee, please, with milk but no sugar." What does the man want? (A) Tea with sugar (B) Coffee with sugar (C) Coffee with milk, no sugar (D) Tea with milk',
 'audio/placement/a2-listen-05-cafe.mp3', 5, 'C'),

('e4000000-0000-0003-0001-000000000006',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] You hear a voicemail: "Hi, this is Dr. Rahman''s office. Your appointment has been moved from Tuesday to Thursday at 3 p.m. Please call us to confirm." When is the new appointment? (A) Tuesday at 3 p.m. (B) Thursday at 3 p.m. (C) Tuesday at 4 p.m. (D) Thursday at 4 p.m.',
 'audio/placement/a2-listen-06-voicemail.mp3', 6, 'B'),

-- ── A2+ Level (Q7–Q9): Longer dialogues, understanding purpose ──

('e4000000-0000-0003-0001-000000000007',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Dialogue — Student: "I''d like to join the library. What do I need?" Librarian: "You need a photo ID and proof of your address. The membership is free for students." What does the student need to join? (A) A library card and money (B) A photo ID and proof of address (C) A student card only (D) A letter from their teacher',
 'audio/placement/a2p-listen-07-library.mp3', 7, 'B'),

('e4000000-0000-0003-0001-000000000008',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Dialogue — Woman: "I booked a table for two at eight, but could we change it to four people at half past seven?" Man: "Let me check… Yes, that''s fine." What changed? (A) The time only (B) The number of people only (C) Both the time and the number of people (D) The restaurant location',
 'audio/placement/a2p-listen-08-restaurant.mp3', 8, 'C'),

('e4000000-0000-0003-0001-000000000009',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Announcement: "Attention passengers: Flight AIM-204 to Istanbul has been delayed by approximately 45 minutes. The new departure time is 14:15. We apologise for the inconvenience." What was the original departure time? (A) 13:15 (B) 13:30 (C) 14:00 (D) 14:15',
 'audio/placement/a2p-listen-09-airport.mp3', 9, 'B'),

-- ── B1 Level (Q10–Q12): Understanding opinions, longer speech ──

('e4000000-0000-0003-0001-000000000010',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] You hear a teacher talking to a class: "I know many of you find grammar boring, but understanding the rules will help you write more clearly and confidently. Today, we will look at how to use relative clauses." What is the teacher''s main point? (A) Grammar is not important. (B) Students should stop studying grammar. (C) Learning grammar rules improves writing. (D) Relative clauses are too difficult.',
 'audio/placement/b1-listen-10-classroom.mp3', 10, 'C'),

('e4000000-0000-0003-0001-000000000011',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Dialogue — Man: "I think we should take the train instead of driving. It''s cheaper and better for the environment." Woman: "I agree, but the train takes an hour longer." What disadvantage does the woman mention? (A) It is more expensive. (B) It is not comfortable. (C) It takes more time. (D) It is bad for the environment.',
 'audio/placement/b1-listen-11-travel.mp3', 11, 'C'),

('e4000000-0000-0003-0001-000000000012',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Radio report: "A new study shows that people who read for at least thirty minutes a day have lower stress levels and better concentration. Researchers suggest that reading fiction, in particular, helps the brain relax." According to the report, what type of reading is especially helpful? (A) News articles (B) Academic papers (C) Fiction (D) Social media posts',
 'audio/placement/b1-listen-12-radio.mp3', 12, 'C'),

-- ── B2 Level (Q13–Q15): Inference, attitude, complex information ──

('e4000000-0000-0003-0001-000000000013',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Lecture excerpt: "While many people assume that multitasking increases productivity, research consistently shows the opposite. Switching between tasks actually reduces efficiency by up to forty percent because the brain needs time to refocus each time." What does the speaker imply? (A) Multitasking is an effective strategy. (B) People should focus on one task at a time. (C) Forty percent of workers multitask. (D) The brain can handle many tasks at once.',
 'audio/placement/b2-listen-13-lecture.mp3', 13, 'B'),

('e4000000-0000-0003-0001-000000000014',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Interview — Journalist: "Your company recently decided to let all employees work from home permanently. Has that been successful?" Manager: "Mostly, yes. Productivity has gone up, and staff satisfaction is much higher. The only challenge has been maintaining team cohesion — some people feel disconnected from their colleagues." What is the main challenge the manager mentions? (A) Lower productivity (B) Higher costs (C) Employees feeling disconnected (D) Difficulty hiring new staff',
 'audio/placement/b2-listen-14-interview.mp3', 14, 'C'),

('e4000000-0000-0003-0001-000000000015',
 'f4000000-0000-0000-0001-000000000003', 'multiple_choice',
 '[Audio] Panel discussion: "The issue isn''t whether technology in classrooms is good or bad — it''s about how we use it. A tablet in the hands of a well-trained teacher is a powerful tool; the same tablet without guidance can be a distraction." What is the speaker''s view? (A) Technology should be removed from classrooms. (B) Tablets are always a distraction. (C) The effectiveness of technology depends on how it is used. (D) Teachers do not need training on technology.',
 'audio/placement/b2-listen-15-panel.mp3', 15, 'C')

ON CONFLICT (id) DO NOTHING;


-- =======================================================================
-- 4. PLACEMENT QUESTION-SKILL MAPPINGS
-- Every question gets exactly one primary skill link.
-- =======================================================================

INSERT INTO placement_question_skills (placement_question_id, skill_id, is_primary)
VALUES
  -- Grammar Q1–Q3 (A1): Verb Tenses / Subject-Verb
  ('e4000000-0000-0001-0001-000000000001', 'd4000000-0000-0000-0001-000000000002', true),  -- subject-verb (be)
  ('e4000000-0000-0001-0001-000000000002', 'd4000000-0000-0000-0001-000000000001', true),  -- verb tenses (simple present)
  ('e4000000-0000-0001-0001-000000000003', 'd4000000-0000-0000-0001-000000000002', true),  -- subject-verb (be)

  -- Grammar Q4–Q6 (A2): Verb Tenses / Sentence Structure
  ('e4000000-0000-0001-0001-000000000004', 'd4000000-0000-0000-0001-000000000001', true),  -- verb tenses (past simple)
  ('e4000000-0000-0001-0001-000000000005', 'd4000000-0000-0000-0001-000000000001', true),  -- verb tenses (present continuous)
  ('e4000000-0000-0001-0001-000000000006', 'd4000000-0000-0000-0001-000000000004', true),  -- sentence structure (comparatives)

  -- Grammar Q7–Q9 (A2+): Verb Tenses / Articles & Prepositions
  ('e4000000-0000-0001-0001-000000000007', 'd4000000-0000-0000-0001-000000000001', true),  -- verb tenses (present perfect)
  ('e4000000-0000-0001-0001-000000000008', 'd4000000-0000-0000-0001-000000000003', true),  -- articles & prepositions
  ('e4000000-0000-0001-0001-000000000009', 'd4000000-0000-0000-0001-000000000003', true),  -- articles & prepositions

  -- Grammar Q10–Q12 (B1): Modals / Sentence Structure
  ('e4000000-0000-0001-0001-000000000010', 'd4000000-0000-0000-0001-000000000005', true),  -- modals & conditionals
  ('e4000000-0000-0001-0001-000000000011', 'd4000000-0000-0000-0001-000000000004', true),  -- sentence structure (passive)
  ('e4000000-0000-0001-0001-000000000012', 'd4000000-0000-0000-0001-000000000004', true),  -- sentence structure (reported speech)

  -- Grammar Q13–Q15 (B2): Conditionals / Sentence Structure / Verb Tenses
  ('e4000000-0000-0001-0001-000000000013', 'd4000000-0000-0000-0001-000000000005', true),  -- modals & conditionals (3rd conditional)
  ('e4000000-0000-0001-0001-000000000014', 'd4000000-0000-0000-0001-000000000004', true),  -- sentence structure (relative clauses)
  ('e4000000-0000-0001-0001-000000000015', 'd4000000-0000-0000-0001-000000000001', true),  -- verb tenses (future perfect)

  -- Vocabulary Q1–Q3 (A1): Word Meaning
  ('e4000000-0000-0002-0001-000000000001', 'd4000000-0000-0000-0002-000000000001', true),  -- word meaning (antonyms)
  ('e4000000-0000-0002-0001-000000000002', 'd4000000-0000-0000-0002-000000000001', true),  -- word meaning (definitions)
  ('e4000000-0000-0002-0001-000000000003', 'd4000000-0000-0000-0002-000000000001', true),  -- word meaning (rooms)

  -- Vocabulary Q4–Q6 (A2): Word in Context / Collocations
  ('e4000000-0000-0002-0001-000000000004', 'd4000000-0000-0000-0002-000000000002', true),  -- word in context (lend/borrow)
  ('e4000000-0000-0002-0001-000000000005', 'd4000000-0000-0000-0002-000000000002', true),  -- word in context (weather)
  ('e4000000-0000-0002-0001-000000000006', 'd4000000-0000-0000-0002-000000000003', true),  -- collocations (make an appointment)

  -- Vocabulary Q7–Q9 (A2+): Word Meaning / Collocations
  ('e4000000-0000-0002-0001-000000000007', 'd4000000-0000-0000-0002-000000000001', true),  -- word meaning (reach)
  ('e4000000-0000-0002-0001-000000000008', 'd4000000-0000-0000-0002-000000000003', true),  -- collocations (take up)
  ('e4000000-0000-0002-0001-000000000009', 'd4000000-0000-0000-0002-000000000003', true),  -- collocations (run out of)

  -- Vocabulary Q10–Q12 (B1): Reading Comprehension / Word Meaning
  ('e4000000-0000-0002-0001-000000000010', 'd4000000-0000-0000-0002-000000000004', true),  -- reading comprehension
  ('e4000000-0000-0002-0001-000000000011', 'd4000000-0000-0000-0002-000000000004', true),  -- reading comprehension
  ('e4000000-0000-0002-0001-000000000012', 'd4000000-0000-0000-0002-000000000001', true),  -- word meaning (reluctant)

  -- Vocabulary Q13–Q15 (B2): Word in Context / Reading Comprehension / Collocations
  ('e4000000-0000-0002-0001-000000000013', 'd4000000-0000-0000-0002-000000000002', true),  -- word in context (unforeseen)
  ('e4000000-0000-0002-0001-000000000014', 'd4000000-0000-0000-0002-000000000004', true),  -- reading comprehension
  ('e4000000-0000-0002-0001-000000000015', 'd4000000-0000-0000-0002-000000000003', true),  -- collocations (have a knack)

  -- Listening Q1–Q3 (A1): Instructions / Numbers & Time
  ('e4000000-0000-0003-0001-000000000001', 'd4000000-0000-0000-0003-000000000001', true),  -- spoken instructions
  ('e4000000-0000-0003-0001-000000000002', 'd4000000-0000-0000-0003-000000000003', true),  -- numbers & time (age)
  ('e4000000-0000-0003-0001-000000000003', 'd4000000-0000-0000-0003-000000000003', true),  -- numbers & time (platform/time)

  -- Listening Q4–Q6 (A2): Dialogue / Numbers & Time
  ('e4000000-0000-0003-0001-000000000004', 'd4000000-0000-0000-0003-000000000003', true),  -- numbers & time (price)
  ('e4000000-0000-0003-0001-000000000005', 'd4000000-0000-0000-0003-000000000002', true),  -- dialogue comprehension
  ('e4000000-0000-0003-0001-000000000006', 'd4000000-0000-0000-0003-000000000003', true),  -- numbers & time (appointment)

  -- Listening Q7–Q9 (A2+): Dialogue / Numbers & Time
  ('e4000000-0000-0003-0001-000000000007', 'd4000000-0000-0000-0003-000000000002', true),  -- dialogue comprehension
  ('e4000000-0000-0003-0001-000000000008', 'd4000000-0000-0000-0003-000000000002', true),  -- dialogue comprehension
  ('e4000000-0000-0003-0001-000000000009', 'd4000000-0000-0000-0003-000000000003', true),  -- numbers & time (flight time)

  -- Listening Q10–Q12 (B1): Main Idea / Dialogue
  ('e4000000-0000-0003-0001-000000000010', 'd4000000-0000-0000-0003-000000000004', true),  -- main idea & inference
  ('e4000000-0000-0003-0001-000000000011', 'd4000000-0000-0000-0003-000000000002', true),  -- dialogue comprehension
  ('e4000000-0000-0003-0001-000000000012', 'd4000000-0000-0000-0003-000000000004', true),  -- main idea & inference

  -- Listening Q13–Q15 (B2): Main Idea & Inference
  ('e4000000-0000-0003-0001-000000000013', 'd4000000-0000-0000-0003-000000000004', true),  -- main idea & inference
  ('e4000000-0000-0003-0001-000000000014', 'd4000000-0000-0000-0003-000000000002', true),  -- dialogue comprehension
  ('e4000000-0000-0003-0001-000000000015', 'd4000000-0000-0000-0003-000000000004', true)   -- main idea & inference

ON CONFLICT (placement_question_id, skill_id) DO NOTHING;
