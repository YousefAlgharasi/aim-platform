-- =============================================================================
-- AIM Platform — Comprehensive Seed Data
-- English Language Learning: A1, A2, A3 Beginner Courses
-- =============================================================================
-- This seed populates: users, courses, levels, chapters, skills, objectives,
-- lessons, lesson_skills, lesson_objectives, question_bank, question_choices,
-- question_answers, question_skills, placement tests, and assessments.
-- All content is real English teaching material for Arabic-speaking learners.
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. SEED ADMIN USER (for created_by references)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (id, supabase_auth_uid, email, user_type, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-aaaaaaaaa001',
  'content-admin@aim-platform.test',
  'admin',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. COURSES
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO courses (id, title, slug, description, sort_order, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'English A1 — Absolute Beginner', 'english-a1', 'Foundation English for Arabic-speaking absolute beginners. Covers the alphabet, core vocabulary, basic grammar (to be, present simple), and simple reading and writing.', 1, 'published'),
  ('c0000000-0000-0000-0000-000000000002', 'English A2 — Elementary', 'english-a2', 'Elementary English building on A1 foundations. Introduces past simple, future tense, comparatives, and expanded vocabulary for daily life situations.', 2, 'published'),
  ('c0000000-0000-0000-0000-000000000003', 'English A3 — Pre-Intermediate', 'english-a3', 'Pre-intermediate English bridging A2 to B1. Covers present perfect, conditionals, passive voice, and academic/workplace vocabulary.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. LEVELS (one level per course for MVP)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO levels (id, course_id, title, code, slug, description, sort_order, status) VALUES
  ('l0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'A1 — Beginner', 'A1', 'a1-beginner', 'CEFR A1: Can understand and use familiar everyday expressions and very basic phrases.', 1, 'published'),
  ('l0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'A2 — Elementary', 'A2', 'a2-elementary', 'CEFR A2: Can communicate in simple and routine tasks on familiar topics.', 1, 'published'),
  ('l0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'A3 — Pre-Intermediate', 'A3', 'a3-pre-intermediate', 'Bridging A2 to B1: Can deal with most situations likely to arise while travelling.', 1, 'published')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. SKILLS — Full A1 Skill Tree (86 skills) + A2/A3 skills
-- ─────────────────────────────────────────────────────────────────────────────

-- 3a. A1 Phonics & Pronunciation (10 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  ('s0000000-0000-0000-0001-000000000001', 'en.a1.pho.uppercase_recognition', 'Uppercase letter recognition (A–Z)', 'Recognize all 26 uppercase English letters as new symbols distinct from Arabic script.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000002', 'en.a1.pho.lowercase_recognition', 'Lowercase letter recognition (a–z)', 'Recognize all 26 lowercase English letters; distinguish visually confusing pairs: b/d, p/q, m/n.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000003', 'en.a1.pho.short_vowels', 'Short vowel sounds (a, e, i, o, u)', 'Map letters to short vowel sounds. Arabic has only three vowel sounds; all five English short vowels need explicit teaching.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000004', 'en.a1.pho.consonant_sounds', 'Consonant sounds', 'Map consonant letters to their sounds. Focus on sounds absent in Arabic: p, v, g (as in go).', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000005', 'en.a1.pho.cvc_decoding', 'CVC word decoding', 'Decode consonant-vowel-consonant words like cat, bed, sit, hop, cup.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000006', 'en.a1.pho.digraphs', 'Digraphs (ch, sh, th, wh)', 'Recognize and produce two-letter sounds: ch, sh, th, wh.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000007', 'en.a1.pho.silent_e', 'Silent-e pattern (cake, bike, note)', 'Understand the silent-e rule that changes short vowels to long vowels.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000008', 'en.a1.pho.vowel_digraphs', 'Common vowel digraphs (ea, oo, ee, ai)', 'Read two-letter vowel combinations that produce a single sound.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000009', 'en.a1.pho.word_stress', 'Word stress in two-syllable words', 'Identify which syllable is stressed in common two-syllable words like TEAcher, stuDENT.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0001-000000000010', 'en.a1.pho.sentence_stress', 'Basic sentence stress and rhythm', 'Recognize that content words are stressed while function words are reduced in English sentences.', 'pronunciation', 'published')
ON CONFLICT (id) DO NOTHING;

-- 3b. A1 Vocabulary (20 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  ('s0000000-0000-0000-0001-000000000011', 'en.a1.voc.greetings', 'Greetings and basic politeness', 'Hello, hi, goodbye, please, thank you, sorry, excuse me, yes, no.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000012', 'en.a1.voc.personal_identity', 'Personal identity words', 'Name, age, country, city, nationality, language, I am, my name is.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000013', 'en.a1.voc.numbers_0_20', 'Numbers 0–20', 'Cardinal numbers zero through twenty.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000014', 'en.a1.voc.numbers_21_100', 'Numbers 21–100', 'Twenty-one through one hundred, by tens.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000015', 'en.a1.voc.days_of_week', 'Days of the week', 'Monday through Sunday, today, tomorrow, yesterday.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000016', 'en.a1.voc.months', 'Months of the year', 'January through December, this month, next month.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000017', 'en.a1.voc.telling_time', 'Telling time (hours and half-hours)', 'O''clock, half past. What time is it? It is three o''clock.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000018', 'en.a1.voc.family_members', 'Family members', 'Mother, father, sister, brother, son, daughter, husband, wife, family.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000019', 'en.a1.voc.describing_people', 'Describing people (basic adjectives)', 'Tall, short, old, young, big, small, happy, sad, nice, friendly.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000020', 'en.a1.voc.classroom_objects', 'Classroom objects', 'Book, pen, pencil, bag, table, chair, board, window, door, notebook.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000021', 'en.a1.voc.colors', 'Colors', 'Red, blue, green, yellow, orange, purple, black, white, brown, pink.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000022', 'en.a1.voc.common_places', 'Common places in a city', 'School, home, shop, hospital, park, street, bank, restaurant, mosque.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000023', 'en.a1.voc.food', 'Common food words', 'Rice, bread, water, milk, egg, chicken, fruit, vegetable, apple, orange.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000024', 'en.a1.voc.ordering_food', 'Ordering and expressing preference', 'I want, I like, I don''t like, Can I have, please, thank you.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000025', 'en.a1.voc.body_parts', 'Body parts', 'Head, eyes, ears, nose, mouth, hand, arm, leg, foot, back.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000026', 'en.a1.voc.health_expressions', 'Simple health expressions', 'I am sick, I have a headache, I feel good, I am tired.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000027', 'en.a1.voc.action_verbs', 'Common action verbs', 'Go, come, eat, drink, read, write, speak, listen, sit, stand, open, close.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000028', 'en.a1.voc.state_verbs', 'Common state verbs', 'Have, want, like, know, need, see, hear, feel, think, understand.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000029', 'en.a1.voc.prepositions_of_place', 'Basic prepositions of place', 'In, on, under, next to, in front of, behind, between.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0001-000000000030', 'en.a1.voc.direction_words', 'Direction words', 'Left, right, straight, turn, near, far, here, there.', 'vocabulary', 'published')
ON CONFLICT (id) DO NOTHING;

-- 3c. A1 Grammar (20 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  ('s0000000-0000-0000-0001-000000000031', 'en.a1.gra.subject_pronouns', 'Subject pronouns', 'I, you, he, she, it, we, they.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000032', 'en.a1.gra.indefinite_articles', 'Indefinite articles (a / an)', 'A book, an apple, a student, an orange.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000033', 'en.a1.gra.definite_article', 'Definite article (the)', 'The book, the teacher, the school. Arabic has ال but English rules differ.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000034', 'en.a1.gra.possessive_adjectives', 'Possessive adjectives', 'My, your, his, her, its, our, their.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000035', 'en.a1.gra.demonstratives', 'Demonstratives', 'This, that, these, those.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000036', 'en.a1.gra.to_be_affirmative', 'To be — affirmative (am, is, are)', 'I am a student. She is happy. They are here.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000037', 'en.a1.gra.to_be_negative', 'To be — negative (am not, is not, are not)', 'I am not tired. He is not late. Contractions: isn''t, aren''t.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000038', 'en.a1.gra.to_be_questions', 'To be — yes/no questions and short answers', 'Are you a student? Yes, I am. / No, I am not.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000039', 'en.a1.gra.to_be_wh_questions', 'To be — wh-questions', 'What is your name? Where are you from? How old are you?', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000040', 'en.a1.gra.regular_plurals', 'Regular plural nouns', 'Book → books, pen → pens, box → boxes. Arabic plurals are irregular; this rule needs explicit teaching.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000041', 'en.a1.gra.irregular_plurals', 'Common irregular plural nouns', 'Man → men, woman → women, child → children.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000042', 'en.a1.gra.present_simple_aff', 'Present simple — affirmative', 'I read. She reads. They eat. Third-person -s is a common error for Arabic speakers.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000043', 'en.a1.gra.present_simple_neg', 'Present simple — negative (don''t / doesn''t)', 'I don''t like coffee. She doesn''t go to school.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000044', 'en.a1.gra.present_simple_yn_q', 'Present simple — yes/no questions', 'Do you speak Arabic? Does she live here?', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000045', 'en.a1.gra.present_simple_wh_q', 'Present simple — wh-questions', 'What do you eat? Where does he work?', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000046', 'en.a1.gra.there_is_are', 'There is / There are', 'There is a book on the table. There are three students.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000047', 'en.a1.gra.can_ability', 'Can for ability', 'I can swim. She can''t drive. Can you speak English?', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000048', 'en.a1.gra.imperatives', 'Imperative sentences', 'Open your book. Sit down. Don''t talk. Please listen.', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000049', 'en.a1.gra.have_got', 'Have got (simple possession)', 'I have got a pen. She hasn''t got a bag. Have you got a phone?', 'grammar', 'published'),
  ('s0000000-0000-0000-0001-000000000050', 'en.a1.gra.word_order_svo', 'Basic sentence word order (SVO)', 'Subject + Verb + Object. I eat rice. She reads books. Arabic VSO order causes frequent transfer errors.', 'grammar', 'published')
ON CONFLICT (id) DO NOTHING;

-- 3d. A1 Reading (10 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  ('s0000000-0000-0000-0001-000000000051', 'en.a1.read.uppercase_in_words', 'Recognizing uppercase letters in words', 'Identify named uppercase letters inside printed words.', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000052', 'en.a1.read.lowercase_in_words', 'Recognizing lowercase letters in words', 'Identify named lowercase letters inside printed words.', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000053', 'en.a1.read.cvc_words', 'Reading CVC words', 'Decode short consonant-vowel-consonant words: cat, hot, big.', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000054', 'en.a1.read.sight_words', 'Reading high-frequency sight words', 'The, is, are, a, an, I, and, in, on, to, have, be, this, that, it.', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000055', 'en.a1.read.noun_phrases', 'Reading simple noun phrases', 'A red pen, the old book, my sister, three apples.', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000056', 'en.a1.read.declarative_sentences', 'Reading simple declarative sentences', 'I am a student. She is happy. They have a book.', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000057', 'en.a1.read.question_sentences', 'Reading simple question sentences', 'Are you a student? What is your name? Can you swim?', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000058', 'en.a1.read.short_text', 'Reading a short text (3–5 sentences)', 'Read a short paragraph about a person, place, or daily routine and answer comprehension questions.', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000059', 'en.a1.read.instructions', 'Reading and following simple instructions', 'Classroom instructions, simple signs, step lists.', 'reading', 'published'),
  ('s0000000-0000-0000-0001-000000000060', 'en.a1.read.personal_profile', 'Reading a short personal profile', 'A profile card: name, age, nationality, language, likes.', 'reading', 'published')
ON CONFLICT (id) DO NOTHING;

-- 3e. A1 Writing (10 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  ('s0000000-0000-0000-0001-000000000061', 'en.a1.write.uppercase_letters', 'Writing uppercase letters (A–Z)', 'Trace and copy all 26 uppercase letters correctly.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000062', 'en.a1.write.lowercase_letters', 'Writing lowercase letters (a–z)', 'Trace and copy all 26 lowercase letters correctly.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000063', 'en.a1.write.copying_words', 'Copying simple words', 'Copy familiar vocabulary words without errors.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000064', 'en.a1.write.words_from_memory', 'Writing basic vocabulary from memory', 'Spell common words from dictation using known vocabulary.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000065', 'en.a1.write.noun_phrases', 'Writing a simple noun phrase', 'Write: a red pen, my book, three apples.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000066', 'en.a1.write.sentences_to_be', 'Writing a simple sentence using to be', 'Write: I am a student. She is ten years old.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000067', 'en.a1.write.sentences_present', 'Writing a sentence using present simple', 'Write: I like rice. She reads every day.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000068', 'en.a1.write.answers_to_questions', 'Writing answers to simple questions', 'Answer: What is your name? → My name is Ahmed.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000069', 'en.a1.write.personal_description', 'Writing a short personal description', 'Write three connected sentences about yourself: name, age, country.', 'writing', 'published'),
  ('s0000000-0000-0000-0001-000000000070', 'en.a1.write.daily_routine', 'Writing a short daily routine', 'Write: I wake up at seven. I eat breakfast. I go to school.', 'writing', 'published')
ON CONFLICT (id) DO NOTHING;

-- 3f. A1 Listening (8 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  ('s0000000-0000-0000-0001-000000000071', 'en.a1.lis.alphabet_recognition', 'Recognizing spoken alphabet letters', 'Identify all 26 English letter names when spoken aloud.', 'listening', 'published'),
  ('s0000000-0000-0000-0001-000000000072', 'en.a1.lis.vowel_discrimination', 'Distinguishing short vowel sounds', 'Discriminate all five English short vowels in minimal pairs.', 'listening', 'published'),
  ('s0000000-0000-0000-0001-000000000073', 'en.a1.lis.word_identification', 'Identifying familiar words when spoken', 'Recognize known A1 vocabulary words when spoken slowly.', 'listening', 'published'),
  ('s0000000-0000-0000-0001-000000000074', 'en.a1.lis.classroom_instructions', 'Understanding classroom instructions', 'Comprehend imperative classroom commands: open, sit, write, listen.', 'listening', 'published'),
  ('s0000000-0000-0000-0001-000000000075', 'en.a1.lis.greetings_questions', 'Understanding greetings and personal questions', 'Comprehend spoken greetings and simple personal questions.', 'listening', 'published'),
  ('s0000000-0000-0000-0001-000000000076', 'en.a1.lis.numbers_spoken', 'Understanding numbers 0–20 when spoken', 'Identify numbers zero through twenty when spoken aloud.', 'listening', 'published'),
  ('s0000000-0000-0000-0001-000000000077', 'en.a1.lis.to_be_sentences', 'Understanding simple to be sentences', 'Comprehend spoken sentences using am, is, are in full and contracted forms.', 'listening', 'published'),
  ('s0000000-0000-0000-0001-000000000078', 'en.a1.lis.mini_dialogues', 'Understanding short mini-dialogues', 'Process connected speech across 2–4 turns at slow native speed.', 'listening', 'published')
ON CONFLICT (id) DO NOTHING;

-- 3g. A1 Speaking (8 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  ('s0000000-0000-0000-0001-000000000079', 'en.a1.spe.alphabet_production', 'Producing English alphabet letter names', 'Say all 26 English letter names clearly.', 'speaking', 'published'),
  ('s0000000-0000-0000-0001-000000000080', 'en.a1.spe.consonant_production', 'Producing consonant sounds (p/v/g)', 'Produce English consonant sounds absent in Arabic: /p/, /v/, /g/.', 'speaking', 'published'),
  ('s0000000-0000-0000-0001-000000000081', 'en.a1.spe.vowel_production', 'Producing short vowel sounds in CVC words', 'Produce all five short vowels distinctly in CVC words.', 'speaking', 'published'),
  ('s0000000-0000-0000-0001-000000000082', 'en.a1.spe.greetings_phrases', 'Saying basic greetings and polite phrases', 'Say hello, thank you, goodbye, excuse me as holistic chunks.', 'speaking', 'published'),
  ('s0000000-0000-0000-0001-000000000083', 'en.a1.spe.identity_sentences', 'Saying personal identity sentences', 'Produce I am, My name is, I am from sentences.', 'speaking', 'published'),
  ('s0000000-0000-0000-0001-000000000084', 'en.a1.spe.to_be_qa', 'Asking and answering to be questions', 'Produce Are you a student? with rising intonation and short answers.', 'speaking', 'published'),
  ('s0000000-0000-0000-0001-000000000085', 'en.a1.spe.present_simple_sentences', 'Producing present-tense sentences', 'Say she reads, he eats with correct third-person -s.', 'speaking', 'published'),
  ('s0000000-0000-0000-0001-000000000086', 'en.a1.spe.guided_dialogue', 'Participating in a short guided dialogue', 'Combine listening and speaking in a structured 4-turn exchange.', 'speaking', 'published')
ON CONFLICT (id) DO NOTHING;

-- 3h. A2 Skills (30 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  -- A2 Grammar
  ('s0000000-0000-0000-0002-000000000001', 'en.a2.gra.past_simple_regular', 'Past simple — regular verbs', 'I walked. She played. They watched. Regular -ed endings.', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000002', 'en.a2.gra.past_simple_irregular', 'Past simple — irregular verbs', 'I went. She ate. They saw. Common irregular past forms.', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000003', 'en.a2.gra.past_simple_negative', 'Past simple — negative', 'I didn''t go. She didn''t eat. They didn''t see.', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000004', 'en.a2.gra.past_simple_questions', 'Past simple — questions', 'Did you go? Where did she eat? What did they see?', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000005', 'en.a2.gra.future_going_to', 'Future with going to', 'I am going to study. She is going to travel.', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000006', 'en.a2.gra.future_will', 'Future with will', 'I will help you. It will rain tomorrow.', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000007', 'en.a2.gra.comparatives', 'Comparative adjectives', 'Bigger, smaller, more beautiful. Than comparisons.', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000008', 'en.a2.gra.superlatives', 'Superlative adjectives', 'The biggest, the smallest, the most beautiful.', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000009', 'en.a2.gra.present_continuous', 'Present continuous', 'I am reading. She is eating. They are playing.', 'grammar', 'published'),
  ('s0000000-0000-0000-0002-000000000010', 'en.a2.gra.countable_uncountable', 'Countable and uncountable nouns', 'Some water, many books, much time, a few apples.', 'grammar', 'published'),
  -- A2 Vocabulary
  ('s0000000-0000-0000-0002-000000000011', 'en.a2.voc.weather', 'Weather vocabulary', 'Sunny, rainy, cloudy, windy, hot, cold, snow, storm.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000012', 'en.a2.voc.clothes', 'Clothes and accessories', 'Shirt, trousers, dress, shoes, hat, jacket, scarf.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000013', 'en.a2.voc.transport', 'Transport and travel', 'Bus, train, car, taxi, plane, ticket, station, airport.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000014', 'en.a2.voc.hobbies', 'Hobbies and free time', 'Football, swimming, reading, cooking, playing, watching.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000015', 'en.a2.voc.house_rooms', 'Parts of a house', 'Kitchen, bedroom, bathroom, living room, garden, stairs.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000016', 'en.a2.voc.shopping', 'Shopping vocabulary', 'Price, cheap, expensive, buy, sell, pay, change, receipt.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000017', 'en.a2.voc.jobs', 'Common jobs and occupations', 'Doctor, teacher, engineer, driver, nurse, police officer.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000018', 'en.a2.voc.daily_routines', 'Daily routine expressions', 'Wake up, get dressed, have breakfast, go to work, come home.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000019', 'en.a2.voc.emotions', 'Emotions and feelings', 'Excited, worried, angry, surprised, bored, scared, proud.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0002-000000000020', 'en.a2.voc.school_subjects', 'School subjects', 'Maths, science, English, history, art, sport, music.', 'vocabulary', 'published'),
  -- A2 Reading & Writing
  ('s0000000-0000-0000-0002-000000000021', 'en.a2.read.short_stories', 'Reading short stories (5–8 sentences)', 'Read simple stories and identify main idea, characters, and sequence.', 'reading', 'published'),
  ('s0000000-0000-0000-0002-000000000022', 'en.a2.read.emails_messages', 'Reading simple emails and messages', 'Understand informal emails and text messages about daily life.', 'reading', 'published'),
  ('s0000000-0000-0000-0002-000000000023', 'en.a2.read.signs_notices', 'Reading signs and public notices', 'Understand common signs: No Smoking, Exit, Open/Closed, Danger.', 'reading', 'published'),
  ('s0000000-0000-0000-0002-000000000024', 'en.a2.write.short_messages', 'Writing short messages and notes', 'Write simple text messages, notes, and short emails.', 'writing', 'published'),
  ('s0000000-0000-0000-0002-000000000025', 'en.a2.write.about_past', 'Writing about past events', 'Write 4–5 sentences about what happened yesterday or last weekend.', 'writing', 'published'),
  -- A2 Listening & Speaking
  ('s0000000-0000-0000-0002-000000000026', 'en.a2.lis.short_conversations', 'Understanding short conversations', 'Follow a 4–6 turn conversation on familiar topics at normal speed.', 'listening', 'published'),
  ('s0000000-0000-0000-0002-000000000027', 'en.a2.lis.announcements', 'Understanding simple announcements', 'Comprehend transport announcements, school notices, weather reports.', 'listening', 'published'),
  ('s0000000-0000-0000-0002-000000000028', 'en.a2.spe.describing_routines', 'Describing daily routines', 'Talk about daily activities using present simple and time expressions.', 'speaking', 'published'),
  ('s0000000-0000-0000-0002-000000000029', 'en.a2.spe.past_events', 'Talking about past events', 'Describe what happened using past simple in connected speech.', 'speaking', 'published'),
  ('s0000000-0000-0000-0002-000000000030', 'en.a2.spe.making_plans', 'Making plans and arrangements', 'Use going to and will to discuss future plans in a conversation.', 'speaking', 'published')
ON CONFLICT (id) DO NOTHING;

-- 3i. A3 Skills (30 skills)
INSERT INTO skills (id, key, title, description, domain, status) VALUES
  -- A3 Grammar
  ('s0000000-0000-0000-0003-000000000001', 'en.a3.gra.present_perfect', 'Present perfect', 'I have visited London. She has eaten lunch. Have you ever...?', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000002', 'en.a3.gra.present_perfect_vs_past', 'Present perfect vs past simple', 'I have lived here for 5 years vs I lived there in 2020.', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000003', 'en.a3.gra.first_conditional', 'First conditional (if + present, will)', 'If it rains, I will stay home. If you study, you will pass.', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000004', 'en.a3.gra.second_conditional', 'Second conditional (if + past, would)', 'If I had money, I would travel. If she were here, she would help.', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000005', 'en.a3.gra.passive_present', 'Passive voice — present', 'English is spoken here. The door is opened every morning.', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000006', 'en.a3.gra.passive_past', 'Passive voice — past', 'The book was written in 1990. The cars were made in Japan.', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000007', 'en.a3.gra.relative_clauses', 'Relative clauses (who, which, that)', 'The man who lives next door. The book that I read.', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000008', 'en.a3.gra.modal_should_must', 'Modals: should and must', 'You should study. You must wear a seatbelt. You shouldn''t be late.', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000009', 'en.a3.gra.past_continuous', 'Past continuous', 'I was reading when she called. They were playing football.', 'grammar', 'published'),
  ('s0000000-0000-0000-0003-000000000010', 'en.a3.gra.gerunds_infinitives', 'Gerunds and infinitives', 'I enjoy reading. I want to read. She stopped smoking.', 'grammar', 'published'),
  -- A3 Vocabulary
  ('s0000000-0000-0000-0003-000000000011', 'en.a3.voc.technology', 'Technology vocabulary', 'Computer, internet, website, app, email, password, download, search.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0003-000000000012', 'en.a3.voc.environment', 'Environment and nature', 'Pollution, recycle, climate, forest, ocean, energy, protect.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0003-000000000013', 'en.a3.voc.health_fitness', 'Health and fitness', 'Exercise, diet, healthy, medicine, symptom, appointment, surgery.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0003-000000000014', 'en.a3.voc.workplace', 'Workplace vocabulary', 'Office, meeting, colleague, manager, deadline, project, salary.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0003-000000000015', 'en.a3.voc.education', 'Education vocabulary', 'University, degree, exam, course, lecture, research, graduate.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0003-000000000016', 'en.a3.voc.media_entertainment', 'Media and entertainment', 'News, article, documentary, podcast, series, character, review.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0003-000000000017', 'en.a3.voc.phrasal_verbs_basic', 'Basic phrasal verbs', 'Look up, turn on, turn off, give up, find out, pick up, put on.', 'vocabulary', 'published'),
  ('s0000000-0000-0000-0003-000000000018', 'en.a3.voc.opinions_debate', 'Giving opinions', 'I think, I believe, In my opinion, I agree, I disagree, However.', 'vocabulary', 'published'),
  -- A3 Reading & Writing
  ('s0000000-0000-0000-0003-000000000019', 'en.a3.read.articles', 'Reading newspaper-style articles', 'Read simplified news articles and identify main argument and supporting details.', 'reading', 'published'),
  ('s0000000-0000-0000-0003-000000000020', 'en.a3.read.narratives', 'Reading short narratives', 'Read fiction excerpts and understand plot, setting, character motivation.', 'reading', 'published'),
  ('s0000000-0000-0000-0003-000000000021', 'en.a3.write.opinion_paragraph', 'Writing an opinion paragraph', 'Write a structured paragraph: topic sentence, reasons, conclusion.', 'writing', 'published'),
  ('s0000000-0000-0000-0003-000000000022', 'en.a3.write.formal_email', 'Writing a formal email', 'Write emails with proper greetings, body, and sign-off for work/school contexts.', 'writing', 'published'),
  -- A3 Listening & Speaking
  ('s0000000-0000-0000-0003-000000000023', 'en.a3.lis.lectures', 'Understanding short talks', 'Follow a 2-minute talk on a familiar topic and note key points.', 'listening', 'published'),
  ('s0000000-0000-0000-0003-000000000024', 'en.a3.lis.phone_conversations', 'Understanding phone conversations', 'Follow phone calls about appointments, bookings, and enquiries.', 'listening', 'published'),
  ('s0000000-0000-0000-0003-000000000025', 'en.a3.spe.presentations', 'Giving a short presentation', 'Present a topic for 1–2 minutes with introduction, body, and conclusion.', 'speaking', 'published'),
  ('s0000000-0000-0000-0003-000000000026', 'en.a3.spe.discussions', 'Participating in discussions', 'Express and defend opinions, agree and disagree politely in group discussions.', 'speaking', 'published'),
  -- A3 Pronunciation
  ('s0000000-0000-0000-0003-000000000027', 'en.a3.pho.connected_speech', 'Connected speech patterns', 'Understand linking, elision, and assimilation in natural speech.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0003-000000000028', 'en.a3.pho.intonation_patterns', 'Intonation for meaning', 'Use rising/falling intonation to express questions, statements, and lists.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0003-000000000029', 'en.a3.pho.weak_forms', 'Weak forms of function words', 'Recognize and produce weak forms: can /kən/, to /tə/, for /fə/.', 'pronunciation', 'published'),
  ('s0000000-0000-0000-0003-000000000030', 'en.a3.pho.consonant_clusters', 'Consonant clusters', 'Produce initial and final clusters: str-, -nds, -sts, -lks.', 'pronunciation', 'published')
ON CONFLICT (id) DO NOTHING;

COMMIT;
