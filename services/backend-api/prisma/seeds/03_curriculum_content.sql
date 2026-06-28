-- 03_curriculum_content.sql
-- Comprehensive curriculum seed: 3 courses (A1/A2/A3), skills, chapters,
-- lessons, objectives, question_bank, questions table, and all junction tables.
-- All ON CONFLICT for idempotent re-runs.

-- =======================================================================
-- 1. COURSES
-- =======================================================================
INSERT INTO courses (id, title, slug, description, sort_order, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'English for Beginners (A1)', 'english-a1',
   'Start your English journey from zero. Designed for Arabic speakers with no prior English knowledge.', 0, 'published'),
  ('c0000000-0000-0000-0000-000000000002', 'Elementary English (A2)', 'english-a2',
   'Build on basics. Learn past tense, comparatives, and everyday conversation for Arabic speakers.', 1, 'published'),
  ('c0000000-0000-0000-0000-000000000003', 'Pre-Intermediate English (A3)', 'english-a3',
   'Expand your range. Present perfect, conditionals, passive voice, and opinion-giving for Arabic speakers.', 2, 'published')
ON CONFLICT (id) DO NOTHING;

-- =======================================================================
-- 2. LEVELS (one per course)
-- =======================================================================
INSERT INTO levels (id, course_id, title, code, slug, description, sort_order, status) VALUES
  ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'A1 — Absolute Beginner', 'A1', 'a1-beginner', 'CEFR A1: Can understand familiar everyday expressions.', 0, 'published'),
  ('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002',
   'A2 — Elementary', 'A2', 'a2-elementary', 'CEFR A2: Can communicate in simple, routine tasks.', 0, 'published'),
  ('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003',
   'A3 — Pre-Intermediate', 'A3', 'a3-pre-intermediate', 'CEFR A2+/B1-: Can deal with most travel situations and describe experiences.', 0, 'published')
ON CONFLICT (id) DO NOTHING;

-- =======================================================================
-- 3. SKILLS (20 A1 + 15 A2 + 15 A3 = 50 skills)
-- =======================================================================
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  -- A1 Pronunciation (4)
  ('c0000000-0000-0000-0001-000000000001', 'en.a1.pho.letter_recognition', 'Letter Recognition (A-Z)', 'Recognize all 26 English letters in upper and lowercase.', 'pronunciation', 'published'),
  ('c0000000-0000-0000-0001-000000000002', 'en.a1.pho.short_vowels', 'Short Vowel Sounds', 'Produce and distinguish the five short vowel sounds.', 'pronunciation', 'published'),
  ('c0000000-0000-0000-0001-000000000003', 'en.a1.pho.consonant_pairs', 'Consonant Pairs (p/b, f/v)', 'Distinguish consonant pairs that do not exist in Arabic.', 'pronunciation', 'published'),
  ('c0000000-0000-0000-0001-000000000004', 'en.a1.pho.basic_blends', 'Basic Consonant Blends', 'Read and pronounce bl, cl, fl, st, sp blends.', 'pronunciation', 'published'),
  -- A1 Vocabulary (4)
  ('c0000000-0000-0000-0001-000000000005', 'en.a1.voc.greetings', 'Greetings & Introductions', 'Hello, goodbye, my name is, how are you.', 'vocabulary', 'published'),
  ('c0000000-0000-0000-0001-000000000006', 'en.a1.voc.numbers', 'Numbers 1-100', 'Count, read, and write numbers from 1 to 100.', 'vocabulary', 'published'),
  ('c0000000-0000-0000-0001-000000000007', 'en.a1.voc.family', 'Family Members', 'Mother, father, brother, sister, son, daughter.', 'vocabulary', 'published'),
  ('c0000000-0000-0000-0001-000000000008', 'en.a1.voc.colors_shapes', 'Colors & Shapes', 'Basic color and shape vocabulary.', 'vocabulary', 'published'),
  -- A1 Grammar (6)
  ('c0000000-0000-0000-0001-000000000009', 'en.a1.gra.to_be_affirmative', 'To Be: Affirmative', 'I am, you are, he/she/it is, we/they are.', 'grammar', 'published'),
  ('c0000000-0000-0000-0001-000000000010', 'en.a1.gra.to_be_negative', 'To Be: Negative', 'I am not, you are not, he is not.', 'grammar', 'published'),
  ('c0000000-0000-0000-0001-000000000011', 'en.a1.gra.present_simple_aff', 'Present Simple: Affirmative', 'I go, she goes, they play — third person -s rule.', 'grammar', 'published'),
  ('c0000000-0000-0000-0001-000000000012', 'en.a1.gra.articles_a_an', 'Articles: a / an', 'Use a before consonant sounds, an before vowel sounds.', 'grammar', 'published'),
  ('c0000000-0000-0000-0001-000000000013', 'en.a1.gra.prepositions_place', 'Prepositions of Place', 'In, on, under, next to, between, behind.', 'grammar', 'published'),
  ('c0000000-0000-0000-0001-000000000014', 'en.a1.gra.possessive_adj', 'Possessive Adjectives', 'My, your, his, her, its, our, their.', 'grammar', 'published'),
  -- A1 Reading/Writing/Listening/Speaking (6)
  ('c0000000-0000-0000-0001-000000000015', 'en.a1.read.simple_sentences', 'Read Simple Sentences', 'Read and understand 3-6 word sentences about daily life.', 'reading', 'published'),
  ('c0000000-0000-0000-0001-000000000016', 'en.a1.write.copy_words', 'Copy & Write Words', 'Copy words correctly and write from dictation.', 'writing', 'published'),
  ('c0000000-0000-0000-0001-000000000017', 'en.a1.lis.classroom_commands', 'Classroom Commands', 'Understand: open, close, sit down, stand up, listen, repeat.', 'listening', 'published'),
  ('c0000000-0000-0000-0001-000000000018', 'en.a1.spe.introduce_self', 'Introduce Yourself', 'Say your name, age, and where you are from.', 'speaking', 'published'),
  ('c0000000-0000-0000-0001-000000000019', 'en.a1.func.asking_permission', 'Asking Permission', 'Can I go? May I use this? Is it OK if I...?', 'functional_language', 'published'),
  ('c0000000-0000-0000-0001-000000000020', 'en.a1.voc.food_drink', 'Food & Drink', 'Common food and drink vocabulary: water, rice, chicken, juice.', 'vocabulary', 'published'),

  -- A2 Skills (15)
  ('c0000000-0000-0000-0002-000000000001', 'en.a2.gra.past_simple_regular', 'Past Simple: Regular Verbs', 'Add -ed to form past simple; spelling rules.', 'grammar', 'published'),
  ('c0000000-0000-0000-0002-000000000002', 'en.a2.gra.past_simple_irregular', 'Past Simple: Irregular Verbs', 'Went, saw, ate, had — common irregular past forms.', 'grammar', 'published'),
  ('c0000000-0000-0000-0002-000000000003', 'en.a2.gra.future_will', 'Future: will', 'I will go, she will not come, will you help?', 'grammar', 'published'),
  ('c0000000-0000-0000-0002-000000000004', 'en.a2.gra.future_going_to', 'Future: going to', 'Plans and intentions with be going to.', 'grammar', 'published'),
  ('c0000000-0000-0000-0002-000000000005', 'en.a2.gra.comparatives', 'Comparatives', 'Bigger, more beautiful, better — comparing two things.', 'grammar', 'published'),
  ('c0000000-0000-0000-0002-000000000006', 'en.a2.gra.superlatives', 'Superlatives', 'The biggest, the most beautiful, the best.', 'grammar', 'published'),
  ('c0000000-0000-0000-0002-000000000007', 'en.a2.gra.present_continuous', 'Present Continuous', 'I am eating, she is reading — actions happening now.', 'grammar', 'published'),
  ('c0000000-0000-0000-0002-000000000008', 'en.a2.voc.daily_routine', 'Daily Routine', 'Wake up, brush teeth, have breakfast, go to work/school.', 'vocabulary', 'published'),
  ('c0000000-0000-0000-0002-000000000009', 'en.a2.voc.weather', 'Weather Vocabulary', 'Sunny, cloudy, rainy, hot, cold, windy.', 'vocabulary', 'published'),
  ('c0000000-0000-0000-0002-000000000010', 'en.a2.voc.transport', 'Transport & Directions', 'Bus, car, taxi, turn left/right, go straight.', 'vocabulary', 'published'),
  ('c0000000-0000-0000-0002-000000000011', 'en.a2.read.short_paragraphs', 'Read Short Paragraphs', 'Understand a 50-80 word paragraph about a familiar topic.', 'reading', 'published'),
  ('c0000000-0000-0000-0002-000000000012', 'en.a2.write.simple_messages', 'Write Simple Messages', 'Write a short email, note, or text message.', 'writing', 'published'),
  ('c0000000-0000-0000-0002-000000000013', 'en.a2.lis.conversations', 'Understand Simple Conversations', 'Follow a short dialogue about shopping, travel, or plans.', 'listening', 'published'),
  ('c0000000-0000-0000-0002-000000000014', 'en.a2.spe.describe_routine', 'Describe Your Routine', 'Talk about what you do every day using time expressions.', 'speaking', 'published'),
  ('c0000000-0000-0000-0002-000000000015', 'en.a2.func.making_requests', 'Making Polite Requests', 'Could you...? Would you mind...? Can you please...?', 'functional_language', 'published'),

  -- A3 Skills (15)
  ('c0000000-0000-0000-0003-000000000001', 'en.a3.gra.present_perfect', 'Present Perfect', 'I have visited, she has eaten — experience and result.', 'grammar', 'published'),
  ('c0000000-0000-0000-0003-000000000002', 'en.a3.gra.present_perfect_vs_past', 'Present Perfect vs Past Simple', 'I have been vs I went — finished vs unfinished time.', 'grammar', 'published'),
  ('c0000000-0000-0000-0003-000000000003', 'en.a3.gra.first_conditional', 'First Conditional', 'If it rains, I will stay home — real future possibility.', 'grammar', 'published'),
  ('c0000000-0000-0000-0003-000000000004', 'en.a3.gra.second_conditional', 'Second Conditional', 'If I had money, I would travel — unreal present.', 'grammar', 'published'),
  ('c0000000-0000-0000-0003-000000000005', 'en.a3.gra.passive_present', 'Passive Voice: Present', 'The book is written, cars are made — present passive.', 'grammar', 'published'),
  ('c0000000-0000-0000-0003-000000000006', 'en.a3.gra.passive_past', 'Passive Voice: Past', 'The letter was sent, the houses were built.', 'grammar', 'published'),
  ('c0000000-0000-0000-0003-000000000007', 'en.a3.gra.relative_clauses', 'Relative Clauses', 'who, which, that, where — defining relative clauses.', 'grammar', 'published'),
  ('c0000000-0000-0000-0003-000000000008', 'en.a3.gra.gerunds_infinitives', 'Gerunds & Infinitives', 'Enjoy swimming vs want to swim — verb patterns.', 'grammar', 'published'),
  ('c0000000-0000-0000-0003-000000000009', 'en.a3.voc.work_jobs', 'Work & Jobs', 'Doctor, engineer, teacher, apply, interview, salary.', 'vocabulary', 'published'),
  ('c0000000-0000-0000-0003-000000000010', 'en.a3.voc.health_body', 'Health & Body', 'Headache, fever, medicine, appointment, stomach.', 'vocabulary', 'published'),
  ('c0000000-0000-0000-0003-000000000011', 'en.a3.read.news_articles', 'Read Simple News Articles', 'Understand a 100-150 word news or magazine text.', 'reading', 'published'),
  ('c0000000-0000-0000-0003-000000000012', 'en.a3.write.short_paragraphs', 'Write Short Paragraphs', 'Write 50-80 words giving opinions or describing events.', 'writing', 'published'),
  ('c0000000-0000-0000-0003-000000000013', 'en.a3.lis.announcements', 'Understand Announcements', 'Follow airport, school, or workplace announcements.', 'listening', 'published'),
  ('c0000000-0000-0000-0003-000000000014', 'en.a3.spe.give_opinions', 'Give Opinions', 'I think..., In my opinion..., I agree/disagree because...', 'speaking', 'published'),
  ('c0000000-0000-0000-0003-000000000015', 'en.a3.func.complaining', 'Making Complaints', 'I am not happy with..., I would like to complain about...', 'functional_language', 'published')
ON CONFLICT (key) DO NOTHING;

-- =======================================================================
-- 4. CHAPTERS (8 A1 + 6 A2 + 6 A3 = 20)
-- =======================================================================
INSERT INTO chapters (id, level_id, title, slug, description, sort_order, status) VALUES
  -- A1 chapters
  ('c1000000-0000-0000-0001-000000000001', '50000000-0000-0000-0000-000000000001', 'The English Alphabet & Sounds', 'alphabet-sounds', 'Learn to read and pronounce English letters.', 0, 'published'),
  ('c1000000-0000-0000-0001-000000000002', '50000000-0000-0000-0000-000000000001', 'Greetings & Introductions', 'greetings', 'Say hello, introduce yourself, and ask simple questions.', 1, 'published'),
  ('c1000000-0000-0000-0001-000000000003', '50000000-0000-0000-0000-000000000001', 'Numbers, Colors & Shapes', 'numbers-colors', 'Count to 100 and describe basic objects.', 2, 'published'),
  ('c1000000-0000-0000-0001-000000000004', '50000000-0000-0000-0000-000000000001', 'My Family', 'family', 'Talk about your family members.', 3, 'published'),
  ('c1000000-0000-0000-0001-000000000005', '50000000-0000-0000-0000-000000000001', 'To Be: am, is, are', 'to-be', 'Use the verb to be in sentences.', 4, 'published'),
  ('c1000000-0000-0000-0001-000000000006', '50000000-0000-0000-0000-000000000001', 'Present Simple', 'present-simple', 'Describe habits and routines.', 5, 'published'),
  ('c1000000-0000-0000-0001-000000000007', '50000000-0000-0000-0000-000000000001', 'Articles & Prepositions', 'articles-prepositions', 'Use a/an and prepositions of place.', 6, 'published'),
  ('c1000000-0000-0000-0001-000000000008', '50000000-0000-0000-0000-000000000001', 'Food, Drink & Daily Life', 'food-daily', 'Talk about food, drink, and daily activities.', 7, 'published'),
  -- A2 chapters
  ('c1000000-0000-0000-0002-000000000001', '50000000-0000-0000-0000-000000000002', 'Past Simple', 'past-simple', 'Talk about completed actions in the past.', 0, 'published'),
  ('c1000000-0000-0000-0002-000000000002', '50000000-0000-0000-0000-000000000002', 'Future Tense', 'future', 'Make plans and predictions with will and going to.', 1, 'published'),
  ('c1000000-0000-0000-0002-000000000003', '50000000-0000-0000-0000-000000000002', 'Comparatives & Superlatives', 'comparatives', 'Compare people, places, and things.', 2, 'published'),
  ('c1000000-0000-0000-0002-000000000004', '50000000-0000-0000-0000-000000000002', 'Present Continuous', 'present-continuous', 'Describe actions happening right now.', 3, 'published'),
  ('c1000000-0000-0000-0002-000000000005', '50000000-0000-0000-0000-000000000002', 'Daily Life & Routines', 'daily-life', 'Vocabulary and conversation about routines and travel.', 4, 'published'),
  ('c1000000-0000-0000-0002-000000000006', '50000000-0000-0000-0000-000000000002', 'Reading & Communication', 'reading-comm', 'Read short texts and make polite requests.', 5, 'published'),
  -- A3 chapters
  ('c1000000-0000-0000-0003-000000000001', '50000000-0000-0000-0000-000000000003', 'Present Perfect', 'present-perfect', 'Talk about experiences and recent events.', 0, 'published'),
  ('c1000000-0000-0000-0003-000000000002', '50000000-0000-0000-0000-000000000003', 'Conditionals', 'conditionals', 'Express real and unreal possibilities.', 1, 'published'),
  ('c1000000-0000-0000-0003-000000000003', '50000000-0000-0000-0000-000000000003', 'Passive Voice', 'passive', 'Describe processes and events with passive structures.', 2, 'published'),
  ('c1000000-0000-0000-0003-000000000004', '50000000-0000-0000-0000-000000000003', 'Relative Clauses & Verb Patterns', 'relative-verbs', 'Add detail with relative clauses; gerunds vs infinitives.', 3, 'published'),
  ('c1000000-0000-0000-0003-000000000005', '50000000-0000-0000-0000-000000000003', 'Work, Health & Daily Topics', 'work-health', 'Vocabulary for jobs, health, and everyday situations.', 4, 'published'),
  ('c1000000-0000-0000-0003-000000000006', '50000000-0000-0000-0000-000000000003', 'Reading, Writing & Opinions', 'reading-writing', 'Read articles, write paragraphs, and express opinions.', 5, 'published')
ON CONFLICT (id) DO NOTHING;

-- =======================================================================
-- 5. LESSONS (3 per chapter = 60 lessons)
-- =======================================================================
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  -- A1 Ch1: Alphabet & Sounds
  ('5e000000-0000-0000-0001-000000000001', 'c1000000-0000-0000-0001-000000000001', 'Upper & Lowercase Letters', 'Learn to recognize and write all 26 English letters.', 0, 'published'),
  ('5e000000-0000-0000-0001-000000000002', 'c1000000-0000-0000-0001-000000000001', 'Short Vowel Sounds', 'Practice the sounds of a, e, i, o, u in simple words.', 1, 'published'),
  ('5e000000-0000-0000-0001-000000000003', 'c1000000-0000-0000-0001-000000000001', 'Tricky Consonants: p/b, f/v', 'Arabic has no p or v — learn to hear and say them.', 2, 'published'),
  -- A1 Ch2: Greetings
  ('5e000000-0000-0000-0001-000000000004', 'c1000000-0000-0000-0001-000000000002', 'Hello & Goodbye', 'Common greeting and farewell phrases.', 0, 'published'),
  ('5e000000-0000-0000-0001-000000000005', 'c1000000-0000-0000-0001-000000000002', 'What Is Your Name?', 'Ask and answer name questions.', 1, 'published'),
  ('5e000000-0000-0000-0001-000000000006', 'c1000000-0000-0000-0001-000000000002', 'How Are You?', 'Ask about feelings and respond appropriately.', 2, 'published'),
  -- A1 Ch3: Numbers & Colors
  ('5e000000-0000-0000-0001-000000000007', 'c1000000-0000-0000-0001-000000000003', 'Numbers 1-20', 'Count, read, and write numbers one through twenty.', 0, 'published'),
  ('5e000000-0000-0000-0001-000000000008', 'c1000000-0000-0000-0001-000000000003', 'Numbers 21-100', 'Tens and compound numbers up to one hundred.', 1, 'published'),
  ('5e000000-0000-0000-0001-000000000009', 'c1000000-0000-0000-0001-000000000003', 'Colors & Shapes', 'Name basic colors and geometric shapes.', 2, 'published'),
  -- A1 Ch4: Family
  ('5e000000-0000-0000-0001-000000000010', 'c1000000-0000-0000-0001-000000000004', 'My Family Tree', 'Mother, father, brother, sister, and more.', 0, 'published'),
  ('5e000000-0000-0000-0001-000000000011', 'c1000000-0000-0000-0001-000000000004', 'Describing Family Members', 'He is tall. She is kind. My brother is young.', 1, 'published'),
  ('5e000000-0000-0000-0001-000000000012', 'c1000000-0000-0000-0001-000000000004', 'Possessive Adjectives with Family', 'My mother, your father, his sister, her brother.', 2, 'published'),
  -- A1 Ch5: To Be
  ('5e000000-0000-0000-0001-000000000013', 'c1000000-0000-0000-0001-000000000005', 'I am, You are, He/She is', 'Affirmative sentences with to be.', 0, 'published'),
  ('5e000000-0000-0000-0001-000000000014', 'c1000000-0000-0000-0001-000000000005', 'Negative: am not, is not, are not', 'Making negative sentences with to be.', 1, 'published'),
  ('5e000000-0000-0000-0001-000000000015', 'c1000000-0000-0000-0001-000000000005', 'Questions: Am I? Is he? Are they?', 'Yes/no questions with to be.', 2, 'published'),
  -- A1 Ch6: Present Simple
  ('5e000000-0000-0000-0001-000000000016', 'c1000000-0000-0000-0001-000000000006', 'I play, She plays', 'Third-person -s rule in affirmative sentences.', 0, 'published'),
  ('5e000000-0000-0000-0001-000000000017', 'c1000000-0000-0000-0001-000000000006', 'Negative: do not, does not', 'Making negative present simple sentences.', 1, 'published'),
  ('5e000000-0000-0000-0001-000000000018', 'c1000000-0000-0000-0001-000000000006', 'Asking Questions: Do you...?', 'Forming present simple questions.', 2, 'published'),
  -- A1 Ch7: Articles & Prepositions
  ('5e000000-0000-0000-0001-000000000019', 'c1000000-0000-0000-0001-000000000007', 'A or An?', 'Use a before consonant sounds, an before vowel sounds.', 0, 'published'),
  ('5e000000-0000-0000-0001-000000000020', 'c1000000-0000-0000-0001-000000000007', 'Where Is It? Prepositions of Place', 'In, on, under, next to, between.', 1, 'published'),
  ('5e000000-0000-0000-0001-000000000021', 'c1000000-0000-0000-0001-000000000007', 'Classroom & Home Objects', 'Describe where things are in a room.', 2, 'published'),
  -- A1 Ch8: Food & Daily Life
  ('5e000000-0000-0000-0001-000000000022', 'c1000000-0000-0000-0001-000000000008', 'Food & Drink Vocabulary', 'Rice, bread, chicken, water, juice, tea.', 0, 'published'),
  ('5e000000-0000-0000-0001-000000000023', 'c1000000-0000-0000-0001-000000000008', 'I Like / I Do Not Like', 'Express food preferences with like.', 1, 'published'),
  ('5e000000-0000-0000-0001-000000000024', 'c1000000-0000-0000-0001-000000000008', 'Reading Simple Sentences', 'Read and understand short texts about daily life.', 2, 'published'),

  -- A2 Ch1: Past Simple
  ('5e000000-0000-0000-0002-000000000001', 'c1000000-0000-0000-0002-000000000001', 'Regular Verbs in the Past', 'Add -ed: walked, played, studied.', 0, 'published'),
  ('5e000000-0000-0000-0002-000000000002', 'c1000000-0000-0000-0002-000000000001', 'Irregular Verbs in the Past', 'Went, saw, ate, had, took — memorize common forms.', 1, 'published'),
  ('5e000000-0000-0000-0002-000000000003', 'c1000000-0000-0000-0002-000000000001', 'Past Simple Questions & Negatives', 'Did you go? I did not see. Where did she eat?', 2, 'published'),
  -- A2 Ch2: Future
  ('5e000000-0000-0000-0002-000000000004', 'c1000000-0000-0000-0002-000000000002', 'Will for Predictions', 'It will rain tomorrow. She will be a doctor.', 0, 'published'),
  ('5e000000-0000-0000-0002-000000000005', 'c1000000-0000-0000-0002-000000000002', 'Going To for Plans', 'I am going to visit my cousin. We are going to study.', 1, 'published'),
  ('5e000000-0000-0000-0002-000000000006', 'c1000000-0000-0000-0002-000000000002', 'Will vs Going To', 'Compare spontaneous decisions and planned intentions.', 2, 'published'),
  -- A2 Ch3: Comparatives
  ('5e000000-0000-0000-0002-000000000007', 'c1000000-0000-0000-0002-000000000003', 'Comparatives: -er and more', 'Bigger, taller, more expensive, more beautiful.', 0, 'published'),
  ('5e000000-0000-0000-0002-000000000008', 'c1000000-0000-0000-0002-000000000003', 'Superlatives: -est and most', 'The biggest, the tallest, the most beautiful.', 1, 'published'),
  ('5e000000-0000-0000-0002-000000000009', 'c1000000-0000-0000-0002-000000000003', 'Irregular Comparisons', 'Good/better/best, bad/worse/worst, far/further/furthest.', 2, 'published'),
  -- A2 Ch4: Present Continuous
  ('5e000000-0000-0000-0002-000000000010', 'c1000000-0000-0000-0002-000000000004', 'What Are You Doing Now?', 'Form and use present continuous for actions in progress.', 0, 'published'),
  ('5e000000-0000-0000-0002-000000000011', 'c1000000-0000-0000-0002-000000000004', 'Present Simple vs Continuous', 'I eat lunch vs I am eating lunch — habit vs now.', 1, 'published'),
  ('5e000000-0000-0000-0002-000000000012', 'c1000000-0000-0000-0002-000000000004', 'Spelling Rules for -ing', 'Run→running, make→making, die→dying.', 2, 'published'),
  -- A2 Ch5: Daily Life
  ('5e000000-0000-0000-0002-000000000013', 'c1000000-0000-0000-0002-000000000005', 'My Daily Routine', 'Describe your day from morning to night.', 0, 'published'),
  ('5e000000-0000-0000-0002-000000000014', 'c1000000-0000-0000-0002-000000000005', 'Weather & Seasons', 'Describe weather and talk about seasons in your city.', 1, 'published'),
  ('5e000000-0000-0000-0002-000000000015', 'c1000000-0000-0000-0002-000000000005', 'Transport & Directions', 'Ask for and give simple directions using transport.', 2, 'published'),
  -- A2 Ch6: Reading & Communication
  ('5e000000-0000-0000-0002-000000000016', 'c1000000-0000-0000-0002-000000000006', 'Reading Short Paragraphs', 'Read a 50-80 word text and answer questions.', 0, 'published'),
  ('5e000000-0000-0000-0002-000000000017', 'c1000000-0000-0000-0002-000000000006', 'Writing a Simple Email', 'Write a short email to a friend or teacher.', 1, 'published'),
  ('5e000000-0000-0000-0002-000000000018', 'c1000000-0000-0000-0002-000000000006', 'Polite Requests & Offers', 'Could you help me? Would you like some tea?', 2, 'published'),

  -- A3 Ch1: Present Perfect
  ('5e000000-0000-0000-0003-000000000001', 'c1000000-0000-0000-0003-000000000001', 'Have You Ever...?', 'Use present perfect for life experiences.', 0, 'published'),
  ('5e000000-0000-0000-0003-000000000002', 'c1000000-0000-0000-0003-000000000001', 'Just, Already, Yet', 'Use time markers with present perfect.', 1, 'published'),
  ('5e000000-0000-0000-0003-000000000003', 'c1000000-0000-0000-0003-000000000001', 'Present Perfect vs Past Simple', 'I have been to Jeddah vs I went to Jeddah last year.', 2, 'published'),
  -- A3 Ch2: Conditionals
  ('5e000000-0000-0000-0003-000000000004', 'c1000000-0000-0000-0003-000000000002', 'First Conditional: Real Possibilities', 'If it rains, I will take an umbrella.', 0, 'published'),
  ('5e000000-0000-0000-0003-000000000005', 'c1000000-0000-0000-0003-000000000002', 'Second Conditional: Unreal Situations', 'If I were rich, I would buy a big house.', 1, 'published'),
  ('5e000000-0000-0000-0003-000000000006', 'c1000000-0000-0000-0003-000000000002', 'Giving Advice with Conditionals', 'If I were you, I would study harder.', 2, 'published'),
  -- A3 Ch3: Passive
  ('5e000000-0000-0000-0003-000000000007', 'c1000000-0000-0000-0003-000000000003', 'Present Passive', 'English is spoken worldwide. Cars are made in factories.', 0, 'published'),
  ('5e000000-0000-0000-0003-000000000008', 'c1000000-0000-0000-0003-000000000003', 'Past Passive', 'The Pyramids were built thousands of years ago.', 1, 'published'),
  ('5e000000-0000-0000-0003-000000000009', 'c1000000-0000-0000-0003-000000000003', 'Active vs Passive', 'Choose when to use active or passive voice.', 2, 'published'),
  -- A3 Ch4: Relative Clauses & Verbs
  ('5e000000-0000-0000-0003-000000000010', 'c1000000-0000-0000-0003-000000000004', 'Defining Relative Clauses', 'The man who lives next door is a teacher.', 0, 'published'),
  ('5e000000-0000-0000-0003-000000000011', 'c1000000-0000-0000-0003-000000000004', 'Gerunds: Verb + -ing', 'I enjoy reading. Swimming is fun. Stop talking!', 1, 'published'),
  ('5e000000-0000-0000-0003-000000000012', 'c1000000-0000-0000-0003-000000000004', 'Infinitives: to + Verb', 'I want to eat. She decided to leave. It is easy to learn.', 2, 'published'),
  -- A3 Ch5: Work & Health
  ('5e000000-0000-0000-0003-000000000013', 'c1000000-0000-0000-0003-000000000005', 'Jobs & Workplaces', 'Talk about different jobs and where people work.', 0, 'published'),
  ('5e000000-0000-0000-0003-000000000014', 'c1000000-0000-0000-0003-000000000005', 'At the Doctor', 'Describe symptoms and understand health advice.', 1, 'published'),
  ('5e000000-0000-0000-0003-000000000015', 'c1000000-0000-0000-0003-000000000005', 'Making Complaints Politely', 'I am afraid there is a problem with...', 2, 'published'),
  -- A3 Ch6: Reading, Writing, Opinions
  ('5e000000-0000-0000-0003-000000000016', 'c1000000-0000-0000-0003-000000000006', 'Reading a Short Article', 'Read 100-150 words about a familiar topic.', 0, 'published'),
  ('5e000000-0000-0000-0003-000000000017', 'c1000000-0000-0000-0003-000000000006', 'Writing Your Opinion', 'Write 50-80 words about a topic you care about.', 1, 'published'),
  ('5e000000-0000-0000-0003-000000000018', 'c1000000-0000-0000-0003-000000000006', 'Agreeing & Disagreeing', 'I agree with you. I see your point, but...', 2, 'published')
ON CONFLICT (id) DO NOTHING;

-- =======================================================================
-- 6. OBJECTIVES (10)
-- =======================================================================
INSERT INTO objectives (id, key, title, description, status) VALUES
  ('8b000000-0000-0000-0000-000000000001', 'obj.a1.recognize_letters', 'Recognize English Letters', 'Identify all 26 letters in both cases.', 'published'),
  ('8b000000-0000-0000-0000-000000000002', 'obj.a1.introduce_self', 'Introduce Yourself', 'State your name, age, and nationality in English.', 'published'),
  ('8b000000-0000-0000-0000-000000000003', 'obj.a1.use_to_be', 'Use To Be Correctly', 'Form affirmative, negative, and question sentences with to be.', 'published'),
  ('8b000000-0000-0000-0000-000000000004', 'obj.a1.describe_daily', 'Describe Daily Activities', 'Talk about routines using present simple.', 'published'),
  ('8b000000-0000-0000-0000-000000000005', 'obj.a2.narrate_past', 'Narrate Past Events', 'Tell a simple story in the past tense.', 'published'),
  ('8b000000-0000-0000-0000-000000000006', 'obj.a2.make_plans', 'Make Future Plans', 'Discuss plans using will and going to.', 'published'),
  ('8b000000-0000-0000-0000-000000000007', 'obj.a2.compare_things', 'Compare Things', 'Use comparatives and superlatives correctly.', 'published'),
  ('8b000000-0000-0000-0000-000000000008', 'obj.a3.describe_experiences', 'Describe Life Experiences', 'Use present perfect to talk about experiences.', 'published'),
  ('8b000000-0000-0000-0000-000000000009', 'obj.a3.express_conditions', 'Express Conditions', 'Use first and second conditional in context.', 'published'),
  ('8b000000-0000-0000-0000-000000000010', 'obj.a3.use_passive', 'Use Passive Voice', 'Transform active sentences to passive and vice versa.', 'published')
ON CONFLICT (key) DO NOTHING;

-- =======================================================================
-- 7. LESSON_SKILLS (every lesson gets at least 1 skill)
-- =======================================================================
INSERT INTO lesson_skills (lesson_id, skill_id) VALUES
  -- A1 lessons
  ('5e000000-0000-0000-0001-000000000001', 'c0000000-0000-0000-0001-000000000001'),
  ('5e000000-0000-0000-0001-000000000002', 'c0000000-0000-0000-0001-000000000002'),
  ('5e000000-0000-0000-0001-000000000003', 'c0000000-0000-0000-0001-000000000003'),
  ('5e000000-0000-0000-0001-000000000004', 'c0000000-0000-0000-0001-000000000005'),
  ('5e000000-0000-0000-0001-000000000005', 'c0000000-0000-0000-0001-000000000005'),
  ('5e000000-0000-0000-0001-000000000006', 'c0000000-0000-0000-0001-000000000005'),
  ('5e000000-0000-0000-0001-000000000007', 'c0000000-0000-0000-0001-000000000006'),
  ('5e000000-0000-0000-0001-000000000008', 'c0000000-0000-0000-0001-000000000006'),
  ('5e000000-0000-0000-0001-000000000009', 'c0000000-0000-0000-0001-000000000008'),
  ('5e000000-0000-0000-0001-000000000010', 'c0000000-0000-0000-0001-000000000007'),
  ('5e000000-0000-0000-0001-000000000011', 'c0000000-0000-0000-0001-000000000007'),
  ('5e000000-0000-0000-0001-000000000012', 'c0000000-0000-0000-0001-000000000014'),
  ('5e000000-0000-0000-0001-000000000013', 'c0000000-0000-0000-0001-000000000009'),
  ('5e000000-0000-0000-0001-000000000014', 'c0000000-0000-0000-0001-000000000010'),
  ('5e000000-0000-0000-0001-000000000015', 'c0000000-0000-0000-0001-000000000009'),
  ('5e000000-0000-0000-0001-000000000016', 'c0000000-0000-0000-0001-000000000011'),
  ('5e000000-0000-0000-0001-000000000017', 'c0000000-0000-0000-0001-000000000011'),
  ('5e000000-0000-0000-0001-000000000018', 'c0000000-0000-0000-0001-000000000011'),
  ('5e000000-0000-0000-0001-000000000019', 'c0000000-0000-0000-0001-000000000012'),
  ('5e000000-0000-0000-0001-000000000020', 'c0000000-0000-0000-0001-000000000013'),
  ('5e000000-0000-0000-0001-000000000021', 'c0000000-0000-0000-0001-000000000013'),
  ('5e000000-0000-0000-0001-000000000022', 'c0000000-0000-0000-0001-000000000020'),
  ('5e000000-0000-0000-0001-000000000023', 'c0000000-0000-0000-0001-000000000020'),
  ('5e000000-0000-0000-0001-000000000024', 'c0000000-0000-0000-0001-000000000015'),
  -- A2 lessons
  ('5e000000-0000-0000-0002-000000000001', 'c0000000-0000-0000-0002-000000000001'),
  ('5e000000-0000-0000-0002-000000000002', 'c0000000-0000-0000-0002-000000000002'),
  ('5e000000-0000-0000-0002-000000000003', 'c0000000-0000-0000-0002-000000000001'),
  ('5e000000-0000-0000-0002-000000000004', 'c0000000-0000-0000-0002-000000000003'),
  ('5e000000-0000-0000-0002-000000000005', 'c0000000-0000-0000-0002-000000000004'),
  ('5e000000-0000-0000-0002-000000000006', 'c0000000-0000-0000-0002-000000000003'),
  ('5e000000-0000-0000-0002-000000000007', 'c0000000-0000-0000-0002-000000000005'),
  ('5e000000-0000-0000-0002-000000000008', 'c0000000-0000-0000-0002-000000000006'),
  ('5e000000-0000-0000-0002-000000000009', 'c0000000-0000-0000-0002-000000000005'),
  ('5e000000-0000-0000-0002-000000000010', 'c0000000-0000-0000-0002-000000000007'),
  ('5e000000-0000-0000-0002-000000000011', 'c0000000-0000-0000-0002-000000000007'),
  ('5e000000-0000-0000-0002-000000000012', 'c0000000-0000-0000-0002-000000000007'),
  ('5e000000-0000-0000-0002-000000000013', 'c0000000-0000-0000-0002-000000000008'),
  ('5e000000-0000-0000-0002-000000000014', 'c0000000-0000-0000-0002-000000000009'),
  ('5e000000-0000-0000-0002-000000000015', 'c0000000-0000-0000-0002-000000000010'),
  ('5e000000-0000-0000-0002-000000000016', 'c0000000-0000-0000-0002-000000000011'),
  ('5e000000-0000-0000-0002-000000000017', 'c0000000-0000-0000-0002-000000000012'),
  ('5e000000-0000-0000-0002-000000000018', 'c0000000-0000-0000-0002-000000000015'),
  -- A3 lessons
  ('5e000000-0000-0000-0003-000000000001', 'c0000000-0000-0000-0003-000000000001'),
  ('5e000000-0000-0000-0003-000000000002', 'c0000000-0000-0000-0003-000000000001'),
  ('5e000000-0000-0000-0003-000000000003', 'c0000000-0000-0000-0003-000000000002'),
  ('5e000000-0000-0000-0003-000000000004', 'c0000000-0000-0000-0003-000000000003'),
  ('5e000000-0000-0000-0003-000000000005', 'c0000000-0000-0000-0003-000000000004'),
  ('5e000000-0000-0000-0003-000000000006', 'c0000000-0000-0000-0003-000000000003'),
  ('5e000000-0000-0000-0003-000000000007', 'c0000000-0000-0000-0003-000000000005'),
  ('5e000000-0000-0000-0003-000000000008', 'c0000000-0000-0000-0003-000000000006'),
  ('5e000000-0000-0000-0003-000000000009', 'c0000000-0000-0000-0003-000000000005'),
  ('5e000000-0000-0000-0003-000000000010', 'c0000000-0000-0000-0003-000000000007'),
  ('5e000000-0000-0000-0003-000000000011', 'c0000000-0000-0000-0003-000000000008'),
  ('5e000000-0000-0000-0003-000000000012', 'c0000000-0000-0000-0003-000000000008'),
  ('5e000000-0000-0000-0003-000000000013', 'c0000000-0000-0000-0003-000000000009'),
  ('5e000000-0000-0000-0003-000000000014', 'c0000000-0000-0000-0003-000000000010'),
  ('5e000000-0000-0000-0003-000000000015', 'c0000000-0000-0000-0003-000000000015'),
  ('5e000000-0000-0000-0003-000000000016', 'c0000000-0000-0000-0003-000000000011'),
  ('5e000000-0000-0000-0003-000000000017', 'c0000000-0000-0000-0003-000000000012'),
  ('5e000000-0000-0000-0003-000000000018', 'c0000000-0000-0000-0003-000000000014')
ON CONFLICT DO NOTHING;

-- =======================================================================
-- 8. LESSON_OBJECTIVES
-- =======================================================================
INSERT INTO lesson_objectives (lesson_id, objective_id) VALUES
  ('5e000000-0000-0000-0001-000000000001', '8b000000-0000-0000-0000-000000000001'),
  ('5e000000-0000-0000-0001-000000000002', '8b000000-0000-0000-0000-000000000001'),
  ('5e000000-0000-0000-0001-000000000004', '8b000000-0000-0000-0000-000000000002'),
  ('5e000000-0000-0000-0001-000000000005', '8b000000-0000-0000-0000-000000000002'),
  ('5e000000-0000-0000-0001-000000000013', '8b000000-0000-0000-0000-000000000003'),
  ('5e000000-0000-0000-0001-000000000014', '8b000000-0000-0000-0000-000000000003'),
  ('5e000000-0000-0000-0001-000000000016', '8b000000-0000-0000-0000-000000000004'),
  ('5e000000-0000-0000-0002-000000000001', '8b000000-0000-0000-0000-000000000005'),
  ('5e000000-0000-0000-0002-000000000002', '8b000000-0000-0000-0000-000000000005'),
  ('5e000000-0000-0000-0002-000000000004', '8b000000-0000-0000-0000-000000000006'),
  ('5e000000-0000-0000-0002-000000000005', '8b000000-0000-0000-0000-000000000006'),
  ('5e000000-0000-0000-0002-000000000007', '8b000000-0000-0000-0000-000000000007'),
  ('5e000000-0000-0000-0002-000000000008', '8b000000-0000-0000-0000-000000000007'),
  ('5e000000-0000-0000-0003-000000000001', '8b000000-0000-0000-0000-000000000008'),
  ('5e000000-0000-0000-0003-000000000002', '8b000000-0000-0000-0000-000000000008'),
  ('5e000000-0000-0000-0003-000000000004', '8b000000-0000-0000-0000-000000000009'),
  ('5e000000-0000-0000-0003-000000000005', '8b000000-0000-0000-0000-000000000009'),
  ('5e000000-0000-0000-0003-000000000007', '8b000000-0000-0000-0000-000000000010'),
  ('5e000000-0000-0000-0003-000000000008', '8b000000-0000-0000-0000-000000000010')
ON CONFLICT DO NOTHING;

-- =======================================================================
-- 9. OBJECTIVE_SKILLS
-- =======================================================================
INSERT INTO objective_skills (objective_id, skill_id) VALUES
  ('8b000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0001-000000000001'),
  ('8b000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0001-000000000002'),
  ('8b000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0001-000000000005'),
  ('8b000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0001-000000000018'),
  ('8b000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0001-000000000009'),
  ('8b000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0001-000000000010'),
  ('8b000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0001-000000000011'),
  ('8b000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0002-000000000001'),
  ('8b000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0002-000000000002'),
  ('8b000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0002-000000000003'),
  ('8b000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0002-000000000004'),
  ('8b000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0002-000000000005'),
  ('8b000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0002-000000000006'),
  ('8b000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0003-000000000001'),
  ('8b000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0003-000000000002'),
  ('8b000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0003-000000000003'),
  ('8b000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0003-000000000004'),
  ('8b000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0003-000000000005'),
  ('8b000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0003-000000000006')
ON CONFLICT DO NOTHING;

-- =======================================================================
-- 10. QUESTION_BANK (10 A1 + 5 A2 + 5 A3 = 20 items)
-- =======================================================================
INSERT INTO question_bank (id, type, stem, difficulty, explanation, hint, tags, status, created_by) VALUES
  -- A1
  ('ab000000-0000-0000-0001-000000000001', 'multiple_choice', 'She _____ a student.', 'beginner',
   'We use "is" with he/she/it.', 'Think about the subject — she is third person singular.',
   ARRAY['a1','grammar','to_be'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000002', 'multiple_choice', 'What is the opposite of "big"?', 'beginner',
   'Big means large. The opposite is small.', 'Think about size.',
   ARRAY['a1','vocabulary'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000003', 'true_false', '"I have a apple" is correct English.', 'beginner',
   'We use "an" before vowel sounds: an apple.', 'Check the article before "apple".',
   ARRAY['a1','grammar','articles'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000004', 'fill_in_the_blank', 'My _____ is Ahmed. (name / game)', 'beginner',
   'We say "My name is..." to introduce ourselves.', 'How do you introduce yourself?',
   ARRAY['a1','vocabulary','greetings'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000005', 'multiple_choice', 'They _____ to school every day.', 'beginner',
   'With they/we/I/you, use the base form: go.', 'They is plural — no -s needed.',
   ARRAY['a1','grammar','present_simple'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000006', 'multiple_choice', 'The book is _____ the table.', 'beginner',
   '"On" means touching the surface.', 'The book is resting on top of something.',
   ARRAY['a1','grammar','prepositions'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000007', 'multiple_choice', 'How many letters are in the English alphabet?', 'beginner',
   'The English alphabet has 26 letters: A-Z.', 'Count from A to Z.',
   ARRAY['a1','phonics'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000008', 'multiple_choice', 'My mother''s mother is my _____.', 'beginner',
   'Your mother''s mother is your grandmother.', 'Think about family relationships.',
   ARRAY['a1','vocabulary','family'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000009', 'true_false', '"She go to school" is correct.', 'beginner',
   'Third person singular needs -s: She goes to school.', 'Check the verb with she/he/it.',
   ARRAY['a1','grammar','present_simple'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0001-000000000010', 'multiple_choice', 'What color is the sky on a clear day?', 'beginner',
   'A clear sky is blue.', 'Look up!',
   ARRAY['a1','vocabulary','colors'], 'published', '00000000-0000-0000-0000-000000000001'),
  -- A2
  ('ab000000-0000-0000-0002-000000000001', 'multiple_choice', 'She _____ to the park yesterday.', 'elementary',
   '"Go" becomes "went" in past simple (irregular).', 'Yesterday = past tense.',
   ARRAY['a2','grammar','past_simple'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0002-000000000002', 'multiple_choice', 'This book is _____ than that one.', 'elementary',
   'Use "more interesting" for long adjectives.', 'Long adjectives use "more" for comparatives.',
   ARRAY['a2','grammar','comparatives'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0002-000000000003', 'fill_in_the_blank', 'I _____ TV when my friend called. (watch — past continuous)', 'elementary',
   'Past continuous: was/were + verb-ing.', 'What tense shows an action in progress in the past?',
   ARRAY['a2','grammar','past_continuous'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0002-000000000004', 'multiple_choice', 'Choose the word for "a person who serves food in a restaurant".', 'elementary',
   'A waiter/waitress serves food.', 'Think about restaurant workers.',
   ARRAY['a2','vocabulary'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0002-000000000005', 'true_false', '"I am go to the shop now" is correct present continuous.', 'elementary',
   'Present continuous: am/is/are + verb-ing. Correct: I am going.', 'Check the -ing form.',
   ARRAY['a2','grammar','present_continuous'], 'published', '00000000-0000-0000-0000-000000000001'),
  -- A3
  ('ab000000-0000-0000-0003-000000000001', 'multiple_choice', 'I have _____ to London three times.', 'intermediate',
   'Present perfect with "been" for experiences.', 'Have + past participle.',
   ARRAY['a3','grammar','present_perfect'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0003-000000000002', 'multiple_choice', 'If I _____ more time, I would travel more.', 'intermediate',
   'Second conditional: If + past simple, would + base verb.', 'This is an unreal/imaginary situation.',
   ARRAY['a3','grammar','conditionals'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0003-000000000003', 'multiple_choice', 'The report _____ by the manager last week.', 'intermediate',
   'Past passive: was/were + past participle.', 'Who did the action? The manager. The report received the action.',
   ARRAY['a3','grammar','passive'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0003-000000000004', 'multiple_choice', 'The man _____ lives next door is a teacher.', 'intermediate',
   'Use "who" for people in defining relative clauses.', 'Which word connects a person to extra information?',
   ARRAY['a3','grammar','relative_clauses'], 'published', '00000000-0000-0000-0000-000000000001'),
  ('ab000000-0000-0000-0003-000000000005', 'multiple_choice', 'She enjoys _____. (swim / swimming / to swim)', 'intermediate',
   'After "enjoy" we use the gerund (-ing form).', 'Some verbs are followed by -ing.',
   ARRAY['a3','grammar','gerunds'], 'published', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Question choices for question_bank items
INSERT INTO question_choices (id, question_id, text, is_correct, sort_order) VALUES
  -- qb01: She _____ a student
  ('ac000000-0000-0000-0001-000000000001', 'ab000000-0000-0000-0001-000000000001', 'is', true, 0),
  ('ac000000-0000-0000-0001-000000000002', 'ab000000-0000-0000-0001-000000000001', 'am', false, 1),
  ('ac000000-0000-0000-0001-000000000003', 'ab000000-0000-0000-0001-000000000001', 'are', false, 2),
  ('ac000000-0000-0000-0001-000000000004', 'ab000000-0000-0000-0001-000000000001', 'be', false, 3),
  -- qb02: opposite of big
  ('ac000000-0000-0000-0001-000000000005', 'ab000000-0000-0000-0001-000000000002', 'small', true, 0),
  ('ac000000-0000-0000-0001-000000000006', 'ab000000-0000-0000-0001-000000000002', 'tall', false, 1),
  ('ac000000-0000-0000-0001-000000000007', 'ab000000-0000-0000-0001-000000000002', 'fast', false, 2),
  ('ac000000-0000-0000-0001-000000000008', 'ab000000-0000-0000-0001-000000000002', 'hot', false, 3),
  -- qb03: true/false "I have a apple"
  ('ac000000-0000-0000-0001-000000000009', 'ab000000-0000-0000-0001-000000000003', 'True', false, 0),
  ('ac000000-0000-0000-0001-000000000010', 'ab000000-0000-0000-0001-000000000003', 'False', true, 1),
  -- qb05: They _____ to school
  ('ac000000-0000-0000-0001-000000000011', 'ab000000-0000-0000-0001-000000000005', 'go', true, 0),
  ('ac000000-0000-0000-0001-000000000012', 'ab000000-0000-0000-0001-000000000005', 'goes', false, 1),
  ('ac000000-0000-0000-0001-000000000013', 'ab000000-0000-0000-0001-000000000005', 'going', false, 2),
  ('ac000000-0000-0000-0001-000000000014', 'ab000000-0000-0000-0001-000000000005', 'gone', false, 3),
  -- qb06: book _____ table
  ('ac000000-0000-0000-0001-000000000015', 'ab000000-0000-0000-0001-000000000006', 'on', true, 0),
  ('ac000000-0000-0000-0001-000000000016', 'ab000000-0000-0000-0001-000000000006', 'at', false, 1),
  ('ac000000-0000-0000-0001-000000000017', 'ab000000-0000-0000-0001-000000000006', 'to', false, 2),
  ('ac000000-0000-0000-0001-000000000018', 'ab000000-0000-0000-0001-000000000006', 'in', false, 3),
  -- qb07: how many letters
  ('ac000000-0000-0000-0001-000000000019', 'ab000000-0000-0000-0001-000000000007', '26', true, 0),
  ('ac000000-0000-0000-0001-000000000020', 'ab000000-0000-0000-0001-000000000007', '24', false, 1),
  ('ac000000-0000-0000-0001-000000000021', 'ab000000-0000-0000-0001-000000000007', '28', false, 2),
  ('ac000000-0000-0000-0001-000000000022', 'ab000000-0000-0000-0001-000000000007', '30', false, 3),
  -- qb08: grandmother
  ('ac000000-0000-0000-0001-000000000023', 'ab000000-0000-0000-0001-000000000008', 'grandmother', true, 0),
  ('ac000000-0000-0000-0001-000000000024', 'ab000000-0000-0000-0001-000000000008', 'aunt', false, 1),
  ('ac000000-0000-0000-0001-000000000025', 'ab000000-0000-0000-0001-000000000008', 'sister', false, 2),
  ('ac000000-0000-0000-0001-000000000026', 'ab000000-0000-0000-0001-000000000008', 'cousin', false, 3),
  -- qb09: true/false "She go"
  ('ac000000-0000-0000-0001-000000000027', 'ab000000-0000-0000-0001-000000000009', 'True', false, 0),
  ('ac000000-0000-0000-0001-000000000028', 'ab000000-0000-0000-0001-000000000009', 'False', true, 1),
  -- qb10: sky color
  ('ac000000-0000-0000-0001-000000000029', 'ab000000-0000-0000-0001-000000000010', 'blue', true, 0),
  ('ac000000-0000-0000-0001-000000000030', 'ab000000-0000-0000-0001-000000000010', 'green', false, 1),
  ('ac000000-0000-0000-0001-000000000031', 'ab000000-0000-0000-0001-000000000010', 'red', false, 2),
  ('ac000000-0000-0000-0001-000000000032', 'ab000000-0000-0000-0001-000000000010', 'yellow', false, 3),
  -- A2 qb01: went
  ('ac000000-0000-0000-0002-000000000001', 'ab000000-0000-0000-0002-000000000001', 'went', true, 0),
  ('ac000000-0000-0000-0002-000000000002', 'ab000000-0000-0000-0002-000000000001', 'go', false, 1),
  ('ac000000-0000-0000-0002-000000000003', 'ab000000-0000-0000-0002-000000000001', 'goes', false, 2),
  ('ac000000-0000-0000-0002-000000000004', 'ab000000-0000-0000-0002-000000000001', 'going', false, 3),
  -- A2 qb02: more interesting
  ('ac000000-0000-0000-0002-000000000005', 'ab000000-0000-0000-0002-000000000002', 'more interesting', true, 0),
  ('ac000000-0000-0000-0002-000000000006', 'ab000000-0000-0000-0002-000000000002', 'interestinger', false, 1),
  ('ac000000-0000-0000-0002-000000000007', 'ab000000-0000-0000-0002-000000000002', 'most interesting', false, 2),
  ('ac000000-0000-0000-0002-000000000008', 'ab000000-0000-0000-0002-000000000002', 'interesting', false, 3),
  -- A2 qb04: waiter
  ('ac000000-0000-0000-0002-000000000009', 'ab000000-0000-0000-0002-000000000004', 'waiter', true, 0),
  ('ac000000-0000-0000-0002-000000000010', 'ab000000-0000-0000-0002-000000000004', 'driver', false, 1),
  ('ac000000-0000-0000-0002-000000000011', 'ab000000-0000-0000-0002-000000000004', 'teacher', false, 2),
  ('ac000000-0000-0000-0002-000000000012', 'ab000000-0000-0000-0002-000000000004', 'doctor', false, 3),
  -- A2 qb05: true/false present continuous
  ('ac000000-0000-0000-0002-000000000013', 'ab000000-0000-0000-0002-000000000005', 'True', false, 0),
  ('ac000000-0000-0000-0002-000000000014', 'ab000000-0000-0000-0002-000000000005', 'False', true, 1),
  -- A3 qb01: been
  ('ac000000-0000-0000-0003-000000000001', 'ab000000-0000-0000-0003-000000000001', 'been', true, 0),
  ('ac000000-0000-0000-0003-000000000002', 'ab000000-0000-0000-0003-000000000001', 'went', false, 1),
  ('ac000000-0000-0000-0003-000000000003', 'ab000000-0000-0000-0003-000000000001', 'gone', false, 2),
  ('ac000000-0000-0000-0003-000000000004', 'ab000000-0000-0000-0003-000000000001', 'go', false, 3),
  -- A3 qb02: had
  ('ac000000-0000-0000-0003-000000000005', 'ab000000-0000-0000-0003-000000000002', 'had', true, 0),
  ('ac000000-0000-0000-0003-000000000006', 'ab000000-0000-0000-0003-000000000002', 'have', false, 1),
  ('ac000000-0000-0000-0003-000000000007', 'ab000000-0000-0000-0003-000000000002', 'has', false, 2),
  ('ac000000-0000-0000-0003-000000000008', 'ab000000-0000-0000-0003-000000000002', 'having', false, 3),
  -- A3 qb03: was reviewed
  ('ac000000-0000-0000-0003-000000000009', 'ab000000-0000-0000-0003-000000000003', 'was reviewed', true, 0),
  ('ac000000-0000-0000-0003-000000000010', 'ab000000-0000-0000-0003-000000000003', 'reviewed', false, 1),
  ('ac000000-0000-0000-0003-000000000011', 'ab000000-0000-0000-0003-000000000003', 'is reviewed', false, 2),
  ('ac000000-0000-0000-0003-000000000012', 'ab000000-0000-0000-0003-000000000003', 'has reviewed', false, 3),
  -- A3 qb04: who
  ('ac000000-0000-0000-0003-000000000013', 'ab000000-0000-0000-0003-000000000004', 'who', true, 0),
  ('ac000000-0000-0000-0003-000000000014', 'ab000000-0000-0000-0003-000000000004', 'which', false, 1),
  ('ac000000-0000-0000-0003-000000000015', 'ab000000-0000-0000-0003-000000000004', 'what', false, 2),
  ('ac000000-0000-0000-0003-000000000016', 'ab000000-0000-0000-0003-000000000004', 'where', false, 3),
  -- A3 qb05: swimming
  ('ac000000-0000-0000-0003-000000000017', 'ab000000-0000-0000-0003-000000000005', 'swimming', true, 0),
  ('ac000000-0000-0000-0003-000000000018', 'ab000000-0000-0000-0003-000000000005', 'swim', false, 1),
  ('ac000000-0000-0000-0003-000000000019', 'ab000000-0000-0000-0003-000000000005', 'to swim', false, 2),
  ('ac000000-0000-0000-0003-000000000020', 'ab000000-0000-0000-0003-000000000005', 'swam', false, 3)
ON CONFLICT (id) DO NOTHING;

-- Question answers for fill_in_the_blank items
INSERT INTO question_answers (id, question_id, answer_type, value) VALUES
  ('aa000000-0000-0000-0001-000000000001', 'ab000000-0000-0000-0001-000000000004', 'fill_blank',
   '{"blanks": [{"position": 1, "accepted_values": ["name"]}], "case_sensitive": false}'::jsonb),
  ('aa000000-0000-0000-0002-000000000001', 'ab000000-0000-0000-0002-000000000003', 'fill_blank',
   '{"blanks": [{"position": 1, "accepted_values": ["was watching"]}], "case_sensitive": false}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =======================================================================
-- 11. QUESTIONS TABLE (supplementary — used by assessments)
--     15 A1 + 5 A2 + 5 A3 = 25 items
-- =======================================================================
INSERT INTO questions (id, key, type, difficulty, prompt, explanation, status, metadata) VALUES
  -- A1 (15)
  ('a0000000-0000-0000-0001-000000000001', 'q.a1.grammar.to_be.01', 'multiple_choice', 'easy',
   'He _____ a teacher.', 'Use "is" with he/she/it.', 'published', '{"tags":["a1","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000002', 'q.a1.grammar.to_be.02', 'multiple_choice', 'easy',
   'We _____ happy today.', 'Use "are" with we/you/they.', 'published', '{"tags":["a1","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000003', 'q.a1.vocab.greetings.01', 'multiple_choice', 'easy',
   'What do you say when you meet someone in the morning?', '"Good morning" is the greeting for morning.', 'published', '{"tags":["a1","vocabulary"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000004', 'q.a1.vocab.numbers.01', 'multiple_choice', 'easy',
   'What number comes after twelve?', 'After twelve comes thirteen.', 'published', '{"tags":["a1","vocabulary"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000005', 'q.a1.vocab.family.01', 'multiple_choice', 'easy',
   'Your father''s wife is your _____.', 'Your father''s wife is your mother.', 'published', '{"tags":["a1","vocabulary"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000006', 'q.a1.grammar.present_simple.01', 'multiple_choice', 'easy',
   'She _____ breakfast at 7 AM.', 'Third person singular: eats.', 'published', '{"tags":["a1","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000007', 'q.a1.grammar.articles.01', 'multiple_choice', 'easy',
   'I want _____ orange.', 'Use "an" before vowel sounds.', 'published', '{"tags":["a1","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000008', 'q.a1.grammar.prepositions.01', 'multiple_choice', 'easy',
   'The cat is _____ the box.', '"In" means inside.', 'published', '{"tags":["a1","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000009', 'q.a1.vocab.colors.01', 'multiple_choice', 'easy',
   'What color is a banana?', 'Bananas are yellow.', 'published', '{"tags":["a1","vocabulary"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000010', 'q.a1.grammar.possessive.01', 'multiple_choice', 'easy',
   '_____ name is Fatima. (She)', 'Use "Her" as possessive adjective for she.', 'published', '{"tags":["a1","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000011', 'q.a1.grammar.to_be_neg.01', 'true_false', 'easy',
   '"He are not happy" is correct.', 'With he/she/it we use "is not", not "are not".', 'published', '{"tags":["a1","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000012', 'q.a1.vocab.food.01', 'multiple_choice', 'easy',
   'Which one is a drink?', 'Juice is a drink.', 'published', '{"tags":["a1","vocabulary"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000013', 'q.a1.phonics.vowels.01', 'multiple_choice', 'easy',
   'Which letter is a vowel?', 'The vowels are A, E, I, O, U.', 'published', '{"tags":["a1","phonics"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000014', 'q.a1.reading.simple.01', 'true_false', 'easy',
   'Read: "Ali has two brothers." — Ali has three brothers.', 'The text says two, not three.', 'published', '{"tags":["a1","reading"]}'::jsonb),
  ('a0000000-0000-0000-0001-000000000015', 'q.a1.grammar.present_simple.02', 'fill_in_blank', 'easy',
   'They _____ football every Friday.', 'With they, use the base form: play.', 'published', '{"tags":["a1","grammar"]}'::jsonb),
  -- A2 (5)
  ('a0000000-0000-0000-0002-000000000001', 'q.a2.grammar.past_simple.01', 'multiple_choice', 'medium',
   'Yesterday, I _____ my grandmother.', '"Visit" becomes "visited" in past simple.', 'published', '{"tags":["a2","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0002-000000000002', 'q.a2.grammar.future.01', 'multiple_choice', 'medium',
   'It _____ rain tomorrow. (prediction)', 'Use "will" for predictions.', 'published', '{"tags":["a2","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0002-000000000003', 'q.a2.grammar.comparatives.01', 'multiple_choice', 'medium',
   'My house is _____ than yours.', 'Big → bigger (short adjective + -er).', 'published', '{"tags":["a2","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0002-000000000004', 'q.a2.vocab.weather.01', 'multiple_choice', 'medium',
   'When water falls from the sky, it is _____.', 'Rain = water falling from the sky.', 'published', '{"tags":["a2","vocabulary"]}'::jsonb),
  ('a0000000-0000-0000-0002-000000000005', 'q.a2.grammar.present_cont.01', 'multiple_choice', 'medium',
   'Look! The children _____ in the park.', 'Present continuous: are playing.', 'published', '{"tags":["a2","grammar"]}'::jsonb),
  -- A3 (5)
  ('a0000000-0000-0000-0003-000000000001', 'q.a3.grammar.present_perfect.01', 'multiple_choice', 'hard',
   'She has _____ lived in Dubai.', '"Always" goes between has and the past participle.', 'published', '{"tags":["a3","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0003-000000000002', 'q.a3.grammar.conditionals.01', 'multiple_choice', 'hard',
   'If she studied harder, she _____ pass the exam.', 'Second conditional: would + base verb.', 'published', '{"tags":["a3","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0003-000000000003', 'q.a3.grammar.passive.01', 'multiple_choice', 'hard',
   'English _____ in many countries.', 'Present passive: is spoken.', 'published', '{"tags":["a3","grammar"]}'::jsonb),
  ('a0000000-0000-0000-0003-000000000004', 'q.a3.vocab.work.01', 'multiple_choice', 'hard',
   'A person who fixes cars is called a _____.', 'A mechanic fixes cars.', 'published', '{"tags":["a3","vocabulary"]}'::jsonb),
  ('a0000000-0000-0000-0003-000000000005', 'q.a3.grammar.gerunds.01', 'multiple_choice', 'hard',
   'I decided _____ a new language.', 'After "decide" we use the infinitive: to learn.', 'published', '{"tags":["a3","grammar"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Note: question_choices table has FK to question_bank, not questions.
-- The questions table items above are used by assessment_questions links only.
-- Their answer choices are embedded in the prompt text and metadata.

-- Question skill links for questions table
INSERT INTO question_skill_links (question_id, skill_key) VALUES
  ('a0000000-0000-0000-0001-000000000001', 'en.a1.gra.to_be_affirmative'),
  ('a0000000-0000-0000-0001-000000000002', 'en.a1.gra.to_be_affirmative'),
  ('a0000000-0000-0000-0001-000000000003', 'en.a1.voc.greetings'),
  ('a0000000-0000-0000-0001-000000000004', 'en.a1.voc.numbers'),
  ('a0000000-0000-0000-0001-000000000005', 'en.a1.voc.family'),
  ('a0000000-0000-0000-0001-000000000006', 'en.a1.gra.present_simple_aff'),
  ('a0000000-0000-0000-0001-000000000007', 'en.a1.gra.articles_a_an'),
  ('a0000000-0000-0000-0001-000000000008', 'en.a1.gra.prepositions_place'),
  ('a0000000-0000-0000-0001-000000000009', 'en.a1.voc.colors_shapes'),
  ('a0000000-0000-0000-0001-000000000010', 'en.a1.gra.possessive_adj'),
  ('a0000000-0000-0000-0001-000000000011', 'en.a1.gra.to_be_negative'),
  ('a0000000-0000-0000-0001-000000000012', 'en.a1.voc.food_drink'),
  ('a0000000-0000-0000-0001-000000000013', 'en.a1.pho.letter_recognition'),
  ('a0000000-0000-0000-0001-000000000014', 'en.a1.read.simple_sentences'),
  ('a0000000-0000-0000-0001-000000000015', 'en.a1.gra.present_simple_aff'),
  ('a0000000-0000-0000-0002-000000000001', 'en.a2.gra.past_simple_regular'),
  ('a0000000-0000-0000-0002-000000000002', 'en.a2.gra.future_will'),
  ('a0000000-0000-0000-0002-000000000003', 'en.a2.gra.comparatives'),
  ('a0000000-0000-0000-0002-000000000004', 'en.a2.voc.weather'),
  ('a0000000-0000-0000-0002-000000000005', 'en.a2.gra.present_continuous'),
  ('a0000000-0000-0000-0003-000000000001', 'en.a3.gra.present_perfect'),
  ('a0000000-0000-0000-0003-000000000002', 'en.a3.gra.second_conditional'),
  ('a0000000-0000-0000-0003-000000000003', 'en.a3.gra.passive_present'),
  ('a0000000-0000-0000-0003-000000000004', 'en.a3.voc.work_jobs'),
  ('a0000000-0000-0000-0003-000000000005', 'en.a3.gra.gerunds_infinitives')
ON CONFLICT DO NOTHING;
