-- 04_placement_seed.sql
-- Placement test seed data: 1 published test, 4 sections, 24+ questions
-- Real English content for Arabic speakers, progressive difficulty A1→A2→A3
-- Depends on: 03_curriculum_content.sql (skills)

-- -----------------------------------------------------------------------
-- 0. Clean existing placeholder data (cascade deletes questions & skills map)
-- -----------------------------------------------------------------------

INSERT INTO placement_tests (id, title, description, status, estimated_minutes, total_sections, version, published_at)
VALUES (
  'pt000000-0000-0000-0000-000000000001',
  'English Placement Test',
  'Assess your current English level across grammar, vocabulary, reading, and listening. This test helps us place you in the right course so you can learn at the perfect pace.',
  'published',
  25,
  4,
  1,
  now()
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 2. Sections
-- -----------------------------------------------------------------------

INSERT INTO placement_sections (id, placement_test_id, title, skill_code, order_index, total_questions)
VALUES
  ('ps000000-0000-0000-0000-000000000001', 'pt000000-0000-0000-0000-000000000001', 'Grammar', 'grammar', 0, 6),
  ('ps000000-0000-0000-0000-000000000002', 'pt000000-0000-0000-0000-000000000001', 'Vocabulary', 'vocabulary', 1, 6),
  ('ps000000-0000-0000-0000-000000000003', 'pt000000-0000-0000-0000-000000000001', 'Reading', 'reading', 2, 6),
  ('ps000000-0000-0000-0000-000000000004', 'pt000000-0000-0000-0000-000000000001', 'Listening', 'listening', 3, 6)
ON CONFLICT (placement_test_id, order_index) DO NOTHING;

-- -----------------------------------------------------------------------
-- 3. Grammar Questions (Section 1, order_index 0-5)
--    A1→A2→A3 progressive difficulty
-- -----------------------------------------------------------------------

INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, order_index, correct_answer)
VALUES
  -- A1: Basic verb "to be"
  (
    'pq000000-0000-0000-0001-000000000001',
    'ps000000-0000-0000-0000-000000000001',
    'multiple_choice',
    'Choose the correct word to complete the sentence:\n\nShe ___ a teacher.\n\nA) am\nB) is\nC) are\nD) be',
    0,
    'B'
  ),
  -- A1: Simple past
  (
    'pq000000-0000-0000-0001-000000000002',
    'ps000000-0000-0000-0000-000000000001',
    'true_false',
    'Is this sentence correct?\n\n"I goed to the shop yesterday."\n\nA) True\nB) False',
    1,
    'false'
  ),
  -- A1-A2: Past simple negative
  (
    'pq000000-0000-0000-0001-000000000003',
    'ps000000-0000-0000-0000-000000000001',
    'multiple_choice',
    'Choose the correct sentence:\n\nA) She did not went to school.\nB) She did not go to school.\nC) She not did go to school.\nD) She no go to school.',
    2,
    'B'
  ),
  -- A2: Present perfect
  (
    'pq000000-0000-0000-0001-000000000004',
    'ps000000-0000-0000-0000-000000000001',
    'multiple_choice',
    'Choose the correct form:\n\nI ___ already ___ my homework.\n\nA) have ... finished\nB) has ... finished\nC) am ... finishing\nD) was ... finished',
    3,
    'A'
  ),
  -- A2-A3: Conditional
  (
    'pq000000-0000-0000-0001-000000000005',
    'ps000000-0000-0000-0000-000000000001',
    'true_false',
    'Is this sentence correct?\n\n"If I will have time, I will help you."\n\nA) True\nB) False',
    4,
    'false'
  ),
  -- A3: Passive voice
  (
    'pq000000-0000-0000-0001-000000000006',
    'ps000000-0000-0000-0000-000000000001',
    'multiple_choice',
    'Choose the correct passive form:\n\nThe report ___ by the manager last week.\n\nA) was written\nB) is written\nC) has written\nD) wrote',
    5,
    'A'
  )
ON CONFLICT (placement_section_id, order_index) DO NOTHING;

-- -----------------------------------------------------------------------
-- 4. Vocabulary Questions (Section 2, order_index 0-5)
-- -----------------------------------------------------------------------

INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, order_index, correct_answer)
VALUES
  -- A1: Basic everyday words
  (
    'pq000000-0000-0000-0002-000000000001',
    'ps000000-0000-0000-0000-000000000002',
    'multiple_choice',
    'What is the opposite of "hot"?\n\nA) warm\nB) cold\nC) cool\nD) wet',
    0,
    'B'
  ),
  -- A1: Common actions
  (
    'pq000000-0000-0000-0002-000000000002',
    'ps000000-0000-0000-0000-000000000002',
    'fill_blank',
    'Complete the sentence with the correct word:\n\nEvery morning I ___ my teeth before breakfast.',
    1,
    'brush'
  ),
  -- A1-A2: Daily routines
  (
    'pq000000-0000-0000-0002-000000000003',
    'ps000000-0000-0000-0000-000000000002',
    'multiple_choice',
    'Which word means "a meal you eat in the middle of the day"?\n\nA) breakfast\nB) dinner\nC) lunch\nD) supper',
    2,
    'C'
  ),
  -- A2: Phrasal verbs
  (
    'pq000000-0000-0000-0002-000000000004',
    'ps000000-0000-0000-0000-000000000002',
    'fill_blank',
    'Complete the sentence:\n\nPlease ___ ___ the light. It is too dark in here.\n\n(two words)',
    3,
    'turn on'
  ),
  -- A2-A3: Collocations
  (
    'pq000000-0000-0000-0002-000000000005',
    'ps000000-0000-0000-0000-000000000002',
    'multiple_choice',
    'Which phrase is correct?\n\nA) make a decision\nB) do a decision\nC) take a decision\nD) have a decision',
    4,
    'A'
  ),
  -- A3: Academic vocabulary
  (
    'pq000000-0000-0000-0002-000000000006',
    'ps000000-0000-0000-0000-000000000002',
    'fill_blank',
    'Complete the sentence with the correct word:\n\nThe scientist conducted an ___ to test her theory.',
    5,
    'experiment'
  )
ON CONFLICT (placement_section_id, order_index) DO NOTHING;

-- -----------------------------------------------------------------------
-- 5. Reading Questions (Section 3, order_index 0-5)
-- -----------------------------------------------------------------------

INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, order_index, correct_answer)
VALUES
  -- A1: Simple paragraph
  (
    'pq000000-0000-0000-0003-000000000001',
    'ps000000-0000-0000-0000-000000000003',
    'multiple_choice',
    E'Read the passage and answer the question:\n\n"My name is Fatima. I am from Riyadh. I like to read books and play with my cat. My cat''s name is Lulu."\n\nWhat does Fatima like to do?\n\nA) Cook food\nB) Read books and play with her cat\nC) Watch TV\nD) Go swimming',
    0,
    'B'
  ),
  -- A1: Short notice
  (
    'pq000000-0000-0000-0003-000000000002',
    'ps000000-0000-0000-0000-000000000003',
    'multiple_choice',
    E'Read the notice:\n\n"Library Hours\nSunday to Thursday: 8:00 AM – 6:00 PM\nFriday and Saturday: Closed"\n\nWhen is the library open?\n\nA) Every day\nB) Only on weekends\nC) Sunday to Thursday\nD) Friday and Saturday',
    1,
    'C'
  ),
  -- A2: Email
  (
    'pq000000-0000-0000-0003-000000000003',
    'ps000000-0000-0000-0000-000000000003',
    'multiple_choice',
    E'Read the email:\n\n"Dear Ahmed,\nThank you for your application. We are happy to invite you to an interview on Tuesday at 10:00 AM. Please bring your CV and a copy of your passport. If you cannot come, please call us at 555-1234.\nBest regards,\nHR Department"\n\nWhat should Ahmed bring to the interview?\n\nA) His laptop and phone\nB) His CV and passport copy\nC) His university certificate\nD) His reference letters',
    2,
    'B'
  ),
  -- A2: Short story
  (
    'pq000000-0000-0000-0003-000000000004',
    'ps000000-0000-0000-0000-000000000003',
    'multiple_choice',
    E'Read the passage:\n\n"Last summer, Omar visited London for the first time. He was surprised by how cold it was in July. He visited Big Ben and the British Museum. He tried fish and chips and thought they were delicious. He wants to go back next year."\n\nHow did Omar feel about the weather?\n\nA) He expected it to be cold.\nB) He was surprised it was cold.\nC) He thought it was too hot.\nD) He did not notice the weather.',
    3,
    'B'
  ),
  -- A3: Informational text
  (
    'pq000000-0000-0000-0003-000000000005',
    'ps000000-0000-0000-0000-000000000003',
    'multiple_choice',
    E'Read the passage:\n\n"Learning a second language has many benefits beyond communication. Research shows that bilingual individuals often demonstrate better problem-solving skills and improved memory. Additionally, speaking another language can delay the onset of age-related cognitive decline. For Arabic speakers learning English, the process also opens doors to a vast amount of academic and professional resources available primarily in English."\n\nAccording to the passage, what is one benefit of being bilingual?\n\nA) It guarantees a higher salary.\nB) It improves problem-solving skills.\nC) It replaces the need for formal education.\nD) It only helps with travel.',
    4,
    'B'
  ),
  -- A3: Complex passage
  (
    'pq000000-0000-0000-0003-000000000006',
    'ps000000-0000-0000-0000-000000000003',
    'multiple_choice',
    E'Read the passage:\n\n"Despite the widespread belief that children learn languages more easily than adults, recent studies suggest the picture is more nuanced. While children may acquire native-like pronunciation more readily, adults often learn grammar rules and vocabulary faster due to their developed cognitive abilities. The key factor for success at any age appears to be consistent exposure and practice rather than age alone."\n\nWhat does the passage suggest about language learning?\n\nA) Children always learn faster than adults.\nB) Adults cannot achieve fluency in a new language.\nC) Consistent practice matters more than age.\nD) Only pronunciation is affected by age.',
    5,
    'C'
  )
ON CONFLICT (placement_section_id, order_index) DO NOTHING;

-- -----------------------------------------------------------------------
-- 6. Listening Questions (Section 4, order_index 0-5)
-- -----------------------------------------------------------------------

INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, media_url, order_index, correct_answer)
VALUES
  -- A1: Simple greeting
  (
    'pq000000-0000-0000-0004-000000000001',
    'ps000000-0000-0000-0000-000000000004',
    'listening_choice',
    'Listen to the conversation and choose the correct answer:\n\nWhat does the man say?\n\nA) Good morning, how are you?\nB) Good night, see you tomorrow.\nC) Goodbye, nice to meet you.\nD) Good afternoon, welcome.',
    '/audio/placement/listening_01.mp3',
    0,
    'A'
  ),
  -- A1: Numbers and time
  (
    'pq000000-0000-0000-0004-000000000002',
    'ps000000-0000-0000-0000-000000000004',
    'listening_choice',
    'Listen and answer:\n\nWhat time does the class start?\n\nA) 8:00 AM\nB) 9:00 AM\nC) 10:00 AM\nD) 11:00 AM',
    '/audio/placement/listening_02.mp3',
    1,
    'B'
  ),
  -- A2: Directions
  (
    'pq000000-0000-0000-0004-000000000003',
    'ps000000-0000-0000-0000-000000000004',
    'listening_choice',
    'Listen to the directions and choose the correct answer:\n\nWhere is the pharmacy?\n\nA) Next to the bank\nB) Across from the school\nC) Behind the hospital\nD) In front of the park',
    '/audio/placement/listening_03.mp3',
    2,
    'A'
  ),
  -- A2: Shopping dialogue
  (
    'pq000000-0000-0000-0004-000000000004',
    'ps000000-0000-0000-0000-000000000004',
    'listening_choice',
    'Listen to the conversation in a shop and answer:\n\nHow much does the shirt cost?\n\nA) 15 dollars\nB) 25 dollars\nC) 35 dollars\nD) 50 dollars',
    '/audio/placement/listening_04.mp3',
    3,
    'C'
  ),
  -- A3: News report
  (
    'pq000000-0000-0000-0004-000000000005',
    'ps000000-0000-0000-0000-000000000004',
    'listening_choice',
    'Listen to the short news report and answer:\n\nWhat is the main topic of the report?\n\nA) A new school opening in the city\nB) Changes to public transport schedules\nC) A local sports competition\nD) Weather warnings for the weekend',
    '/audio/placement/listening_05.mp3',
    4,
    'B'
  ),
  -- A3: Academic lecture excerpt
  (
    'pq000000-0000-0000-0004-000000000006',
    'ps000000-0000-0000-0000-000000000004',
    'listening_choice',
    'Listen to the lecture excerpt and answer:\n\nAccording to the speaker, what is the most important factor in language acquisition?\n\nA) Living in a foreign country\nB) Starting at a young age\nC) Regular practice and motivation\nD) Having a private tutor',
    '/audio/placement/listening_06.mp3',
    5,
    'C'
  )
ON CONFLICT (placement_section_id, order_index) DO NOTHING;

-- -----------------------------------------------------------------------
-- 7. Question-Skill Links
--    Links each question to a relevant skill from 03_curriculum_content.sql
--    Skills available:
--      a0000000-...-001 = grammar.past_simple.forms
--      a0000000-...-002 = grammar.past_simple.negative
--      a0000000-...-003 = grammar.past_simple.questions
--      a0000000-...-004 = vocabulary.everyday_actions
-- -----------------------------------------------------------------------

INSERT INTO placement_question_skills (placement_question_id, skill_id, is_primary)
VALUES
  -- Grammar section
  ('pq000000-0000-0000-0001-000000000001', 'a0000000-0000-0000-0000-000000000001', true),
  ('pq000000-0000-0000-0001-000000000002', 'a0000000-0000-0000-0000-000000000001', true),
  ('pq000000-0000-0000-0001-000000000003', 'a0000000-0000-0000-0000-000000000002', true),
  ('pq000000-0000-0000-0001-000000000004', 'a0000000-0000-0000-0000-000000000001', true),
  ('pq000000-0000-0000-0001-000000000005', 'a0000000-0000-0000-0000-000000000003', true),
  ('pq000000-0000-0000-0001-000000000006', 'a0000000-0000-0000-0000-000000000001', true),

  -- Vocabulary section
  ('pq000000-0000-0000-0002-000000000001', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0002-000000000002', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0002-000000000003', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0002-000000000004', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0002-000000000005', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0002-000000000006', 'a0000000-0000-0000-0000-000000000004', true),

  -- Reading section
  ('pq000000-0000-0000-0003-000000000001', 'a0000000-0000-0000-0000-000000000001', true),
  ('pq000000-0000-0000-0003-000000000002', 'a0000000-0000-0000-0000-000000000001', true),
  ('pq000000-0000-0000-0003-000000000003', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0003-000000000004', 'a0000000-0000-0000-0000-000000000001', true),
  ('pq000000-0000-0000-0003-000000000005', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0003-000000000006', 'a0000000-0000-0000-0000-000000000003', true),

  -- Listening section
  ('pq000000-0000-0000-0004-000000000001', 'a0000000-0000-0000-0000-000000000003', true),
  ('pq000000-0000-0000-0004-000000000002', 'a0000000-0000-0000-0000-000000000001', true),
  ('pq000000-0000-0000-0004-000000000003', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0004-000000000004', 'a0000000-0000-0000-0000-000000000004', true),
  ('pq000000-0000-0000-0004-000000000005', 'a0000000-0000-0000-0000-000000000003', true),
  ('pq000000-0000-0000-0004-000000000006', 'a0000000-0000-0000-0000-000000000001', true)
ON CONFLICT (placement_question_id, skill_id) DO NOTHING;
