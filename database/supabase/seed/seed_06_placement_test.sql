-- seed_06_placement_test.sql
-- Placement test with 4 sections (grammar, vocabulary, reading, listening)
-- and questions for initial student level assessment.

-- ============================================================
-- Placement Test
-- ============================================================
INSERT INTO placement_tests (id, title, description, status, estimated_minutes, total_sections, version, published_at)
VALUES (
  'pt000000-0000-0000-0000-000000000001',
  'English Placement Test',
  'Determine your starting English level. This test covers grammar, vocabulary, reading, and listening.',
  'published',
  25,
  4,
  1,
  now()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Placement Sections
-- ============================================================
INSERT INTO placement_sections (id, placement_test_id, title, skill_code, order_index, total_questions) VALUES
  ('ps000000-0000-0000-0000-000000000001', 'pt000000-0000-0000-0000-000000000001', 'Grammar',    'grammar',    1, 8),
  ('ps000000-0000-0000-0000-000000000002', 'pt000000-0000-0000-0000-000000000001', 'Vocabulary',  'vocabulary', 2, 8),
  ('ps000000-0000-0000-0000-000000000003', 'pt000000-0000-0000-0000-000000000001', 'Reading',     'reading',    3, 4),
  ('ps000000-0000-0000-0000-000000000004', 'pt000000-0000-0000-0000-000000000001', 'Listening',   'listening',  4, 4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Grammar Section Questions (8 questions, A1→A3 progression)
-- ============================================================
INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, order_index, correct_answer) VALUES
  -- A1 level
  ('pq000000-0000-0000-0001-000000000001', 'ps000000-0000-0000-0000-000000000001', 'multiple_choice',
   'She _____ a student.',
   1, 'is'),
  ('pq000000-0000-0000-0001-000000000002', 'ps000000-0000-0000-0000-000000000001', 'multiple_choice',
   'They _____ to school every day.',
   2, 'go'),
  ('pq000000-0000-0000-0001-000000000003', 'ps000000-0000-0000-0000-000000000001', 'true_false',
   '"I have a apple" is grammatically correct.',
   3, 'false'),
  -- A2 level
  ('pq000000-0000-0000-0001-000000000004', 'ps000000-0000-0000-0000-000000000001', 'multiple_choice',
   'She _____ to the park yesterday.',
   4, 'went'),
  ('pq000000-0000-0000-0001-000000000005', 'ps000000-0000-0000-0000-000000000001', 'multiple_choice',
   'This book is _____ than that one.',
   5, 'more interesting'),
  ('pq000000-0000-0000-0001-000000000006', 'ps000000-0000-0000-0000-000000000001', 'fill_blank',
   'I _____ (watch) TV when my friend called.',
   6, 'was watching'),
  -- A3 level
  ('pq000000-0000-0000-0001-000000000007', 'ps000000-0000-0000-0000-000000000001', 'multiple_choice',
   'If I _____ more time, I would travel more.',
   7, 'had'),
  ('pq000000-0000-0000-0001-000000000008', 'ps000000-0000-0000-0000-000000000001', 'multiple_choice',
   'The report _____ by the manager last week.',
   8, 'was reviewed')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Vocabulary Section Questions (8 questions)
-- ============================================================
INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, order_index, correct_answer) VALUES
  -- A1
  ('pq000000-0000-0000-0002-000000000001', 'ps000000-0000-0000-0000-000000000002', 'multiple_choice',
   'What is the opposite of "hot"?',
   1, 'cold'),
  ('pq000000-0000-0000-0002-000000000002', 'ps000000-0000-0000-0000-000000000002', 'multiple_choice',
   'A "brother" is a _____ family member.',
   2, 'male'),
  ('pq000000-0000-0000-0002-000000000003', 'ps000000-0000-0000-0000-000000000002', 'fill_blank',
   'I am very _____. I want to eat something. (hungry / angry)',
   3, 'hungry'),
  -- A2
  ('pq000000-0000-0000-0002-000000000004', 'ps000000-0000-0000-0000-000000000002', 'multiple_choice',
   'Choose the word that means "to fix something that is broken":',
   4, 'repair'),
  ('pq000000-0000-0000-0002-000000000005', 'ps000000-0000-0000-0000-000000000002', 'multiple_choice',
   'The _____ is the person who serves food in a restaurant.',
   5, 'waiter'),
  -- A3
  ('pq000000-0000-0000-0002-000000000006', 'ps000000-0000-0000-0000-000000000002', 'multiple_choice',
   '"Reluctant" most closely means:',
   6, 'unwilling'),
  ('pq000000-0000-0000-0002-000000000007', 'ps000000-0000-0000-0000-000000000002', 'multiple_choice',
   'Choose the correct meaning of "break out":',
   7, 'to start suddenly'),
  ('pq000000-0000-0000-0002-000000000008', 'ps000000-0000-0000-0000-000000000002', 'fill_blank',
   'Despite his _____ (succeed) in business, he remained humble.',
   8, 'success')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Reading Section Questions (4 questions)
-- ============================================================
INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, order_index, correct_answer) VALUES
  ('pq000000-0000-0000-0003-000000000001', 'ps000000-0000-0000-0000-000000000003', 'multiple_choice',
   'Read: "Tom wakes up at 7 AM. He eats breakfast and goes to school." What does Tom do first?',
   1, 'eats breakfast'),
  ('pq000000-0000-0000-0003-000000000002', 'ps000000-0000-0000-0000-000000000003', 'multiple_choice',
   'Read: "Sara wanted to buy a new dress, but she did not have enough money. She decided to save her pocket money." Why did Sara decide to save money?',
   2, 'She wanted to buy a dress'),
  ('pq000000-0000-0000-0003-000000000003', 'ps000000-0000-0000-0000-000000000003', 'true_false',
   'Read: "Although the weather was bad, the team continued playing." The team stopped because of the weather.',
   3, 'false'),
  ('pq000000-0000-0000-0003-000000000004', 'ps000000-0000-0000-0000-000000000003', 'multiple_choice',
   'Read: "The government has implemented new policies to reduce carbon emissions. Critics argue these measures are insufficient." What is the critics'' position?',
   4, 'The policies are not enough')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Listening Section Questions (4 questions, no real audio)
-- ============================================================
INSERT INTO placement_questions (id, placement_section_id, question_type, prompt, order_index, correct_answer) VALUES
  ('pq000000-0000-0000-0004-000000000001', 'ps000000-0000-0000-0000-000000000004', 'multiple_choice',
   '[Audio placeholder: "My name is Ali. I am from Riyadh."] Where is Ali from?',
   1, 'Riyadh'),
  ('pq000000-0000-0000-0004-000000000002', 'ps000000-0000-0000-0000-000000000004', 'multiple_choice',
   '[Audio placeholder: "Can you tell me the way to the hospital? Go straight and turn left."] Where does the person want to go?',
   2, 'the hospital'),
  ('pq000000-0000-0000-0004-000000000003', 'ps000000-0000-0000-0000-000000000004', 'true_false',
   '[Audio placeholder: "I have been living in London for three years."] The speaker recently moved to London.',
   3, 'false'),
  ('pq000000-0000-0000-0004-000000000004', 'ps000000-0000-0000-0000-000000000004', 'multiple_choice',
   '[Audio placeholder: "The meeting has been postponed until next Thursday due to scheduling conflicts."] When is the new meeting?',
   4, 'next Thursday')
ON CONFLICT (id) DO NOTHING;
