-- =============================================================================
-- AIM Platform Seed — Part 2: Chapters & Lessons
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- A1 CHAPTERS (8 chapters)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO chapters (id, level_id, title, slug, description, sort_order, status) VALUES
  ('ch000000-0000-0000-0001-000000000001', 'l0000000-0000-0000-0000-000000000001', 'The English Alphabet', 'the-english-alphabet', 'Learn to recognize and write all 26 English letters in uppercase and lowercase.', 1, 'published'),
  ('ch000000-0000-0000-0001-000000000002', 'l0000000-0000-0000-0000-000000000001', 'First Words & Greetings', 'first-words-greetings', 'Learn essential greetings, polite phrases, and your first English vocabulary.', 2, 'published'),
  ('ch000000-0000-0000-0001-000000000003', 'l0000000-0000-0000-0000-000000000001', 'Numbers, Days & Time', 'numbers-days-time', 'Count in English, learn the days of the week, and tell the time.', 3, 'published'),
  ('ch000000-0000-0000-0001-000000000004', 'l0000000-0000-0000-0000-000000000001', 'People & Family', 'people-family', 'Talk about your family and describe people using simple adjectives.', 4, 'published'),
  ('ch000000-0000-0000-0001-000000000005', 'l0000000-0000-0000-0000-000000000001', 'Grammar Foundations: To Be', 'grammar-to-be', 'Master am, is, are — the most important verb in English.', 5, 'published'),
  ('ch000000-0000-0000-0001-000000000006', 'l0000000-0000-0000-0000-000000000001', 'My World: Places & Things', 'places-things', 'Learn vocabulary for the classroom, colors, food, and common places.', 6, 'published'),
  ('ch000000-0000-0000-0001-000000000007', 'l0000000-0000-0000-0000-000000000001', 'Present Simple & Actions', 'present-simple-actions', 'Use English verbs to talk about what you do every day.', 7, 'published'),
  ('ch000000-0000-0000-0001-000000000008', 'l0000000-0000-0000-0000-000000000001', 'Reading & Writing Skills', 'reading-writing-skills', 'Read simple texts and write short sentences and descriptions.', 8, 'published')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A2 CHAPTERS (6 chapters)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO chapters (id, level_id, title, slug, description, sort_order, status) VALUES
  ('ch000000-0000-0000-0002-000000000001', 'l0000000-0000-0000-0000-000000000002', 'Talking About the Past', 'talking-about-the-past', 'Learn past simple tense for regular and irregular verbs.', 1, 'published'),
  ('ch000000-0000-0000-0002-000000000002', 'l0000000-0000-0000-0000-000000000002', 'Plans & the Future', 'plans-and-future', 'Express future plans using going to and will.', 2, 'published'),
  ('ch000000-0000-0000-0002-000000000003', 'l0000000-0000-0000-0000-000000000002', 'Comparing Things', 'comparing-things', 'Use comparatives and superlatives to compare people, places, and things.', 3, 'published'),
  ('ch000000-0000-0000-0002-000000000004', 'l0000000-0000-0000-0000-000000000002', 'Daily Life & Routines', 'daily-life-routines', 'Talk about daily activities, hobbies, and jobs.', 4, 'published'),
  ('ch000000-0000-0000-0002-000000000005', 'l0000000-0000-0000-0000-000000000002', 'Out & About', 'out-and-about', 'Vocabulary for transport, shopping, weather, and the home.', 5, 'published'),
  ('ch000000-0000-0000-0002-000000000006', 'l0000000-0000-0000-0000-000000000002', 'Reading & Writing at A2', 'reading-writing-a2', 'Read stories and emails; write messages and descriptions of past events.', 6, 'published')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A3 CHAPTERS (6 chapters)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO chapters (id, level_id, title, slug, description, sort_order, status) VALUES
  ('ch000000-0000-0000-0003-000000000001', 'l0000000-0000-0000-0000-000000000003', 'Experience & Achievement', 'experience-achievement', 'Use present perfect to talk about life experiences and achievements.', 1, 'published'),
  ('ch000000-0000-0000-0003-000000000002', 'l0000000-0000-0000-0000-000000000003', 'Conditions & Possibilities', 'conditions-possibilities', 'Express real and imaginary conditions using first and second conditionals.', 2, 'published'),
  ('ch000000-0000-0000-0003-000000000003', 'l0000000-0000-0000-0000-000000000003', 'How Things Are Done', 'how-things-are-done', 'Describe processes and events using the passive voice.', 3, 'published'),
  ('ch000000-0000-0000-0003-000000000004', 'l0000000-0000-0000-0000-000000000003', 'Modern Life & Technology', 'modern-life-technology', 'Vocabulary for technology, environment, health, and the workplace.', 4, 'published'),
  ('ch000000-0000-0000-0003-000000000005', 'l0000000-0000-0000-0000-000000000003', 'Complex Sentences', 'complex-sentences', 'Build longer sentences with relative clauses, gerunds, infinitives, and modals.', 5, 'published'),
  ('ch000000-0000-0000-0003-000000000006', 'l0000000-0000-0000-0000-000000000003', 'Academic Reading & Writing', 'academic-reading-writing', 'Read articles and narratives; write opinion paragraphs and formal emails.', 6, 'published')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A1 LESSONS (24 lessons, 3 per chapter)
-- ─────────────────────────────────────────────────────────────────────────────

-- Chapter 1: The English Alphabet
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0001-000000000001', 'ch000000-0000-0000-0001-000000000001', 'Meet the Uppercase Letters', 'Learn to recognize all 26 uppercase English letters A through Z. Practice identifying letters and matching them to their names.', 1, 'published'),
  ('le000000-0000-0000-0001-000000000002', 'ch000000-0000-0000-0001-000000000001', 'Meet the Lowercase Letters', 'Learn to recognize all 26 lowercase English letters a through z. Practice distinguishing confusing pairs like b/d and p/q.', 2, 'published'),
  ('le000000-0000-0000-0001-000000000003', 'ch000000-0000-0000-0001-000000000001', 'Vowels & Consonants: First Sounds', 'Learn the five short vowel sounds (a, e, i, o, u) and common consonant sounds. Begin decoding simple CVC words.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 2: First Words & Greetings
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0001-000000000004', 'ch000000-0000-0000-0001-000000000002', 'Hello & Goodbye', 'Learn essential greeting phrases: hello, hi, goodbye, bye, good morning, good evening. Practice using them in short exchanges.', 1, 'published'),
  ('le000000-0000-0000-0001-000000000005', 'ch000000-0000-0000-0001-000000000002', 'Please, Thank You & Sorry', 'Learn polite expressions: please, thank you, sorry, excuse me, you''re welcome. Practice using them in everyday situations.', 2, 'published'),
  ('le000000-0000-0000-0001-000000000006', 'ch000000-0000-0000-0001-000000000002', 'What Is Your Name?', 'Learn personal identity vocabulary: name, age, country, nationality. Practice introducing yourself: My name is... I am from...', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 3: Numbers, Days & Time
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0001-000000000007', 'ch000000-0000-0000-0001-000000000003', 'Numbers 0 to 20', 'Learn to say, read, and write numbers from zero to twenty in English.', 1, 'published'),
  ('le000000-0000-0000-0001-000000000008', 'ch000000-0000-0000-0001-000000000003', 'Days of the Week', 'Learn the seven days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Practice with today, tomorrow, yesterday.', 2, 'published'),
  ('le000000-0000-0000-0001-000000000009', 'ch000000-0000-0000-0001-000000000003', 'What Time Is It?', 'Learn to tell time using o''clock and half past. Practice asking and answering: What time is it?', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 4: People & Family
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0001-000000000010', 'ch000000-0000-0000-0001-000000000004', 'My Family', 'Learn family vocabulary: mother, father, sister, brother, son, daughter. Practice: This is my mother. I have two brothers.', 1, 'published'),
  ('le000000-0000-0000-0001-000000000011', 'ch000000-0000-0000-0001-000000000004', 'Describing People', 'Learn adjectives to describe people: tall, short, old, young, happy, sad. Practice: She is tall. He is young.', 2, 'published'),
  ('le000000-0000-0000-0001-000000000012', 'ch000000-0000-0000-0001-000000000004', 'Colors', 'Learn the names of common colors: red, blue, green, yellow, black, white, brown, pink, orange, purple.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 5: Grammar Foundations: To Be
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0001-000000000013', 'ch000000-0000-0000-0001-000000000005', 'I Am, You Are, She Is', 'Learn to use am, is, are in affirmative sentences. Practice: I am a student. She is happy. They are here.', 1, 'published'),
  ('le000000-0000-0000-0001-000000000014', 'ch000000-0000-0000-0001-000000000005', 'I Am Not, He Is Not', 'Learn to make negative sentences with to be. Practice: I am not tired. She isn''t late. They aren''t students.', 2, 'published'),
  ('le000000-0000-0000-0001-000000000015', 'ch000000-0000-0000-0001-000000000005', 'Are You a Student? — Questions with To Be', 'Learn to form yes/no questions and wh-questions with to be. Practice: Are you happy? What is your name?', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 6: My World: Places & Things
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0001-000000000016', 'ch000000-0000-0000-0001-000000000006', 'In the Classroom', 'Learn classroom objects: book, pen, pencil, bag, table, chair, board. Practice: This is a pen. That is a book.', 1, 'published'),
  ('le000000-0000-0000-0001-000000000017', 'ch000000-0000-0000-0001-000000000006', 'Food & Drink', 'Learn common food and drink words: rice, bread, water, milk, chicken, apple, orange. Practice expressing preferences.', 2, 'published'),
  ('le000000-0000-0000-0001-000000000018', 'ch000000-0000-0000-0001-000000000006', 'Places in My City', 'Learn places vocabulary: school, home, shop, hospital, park, restaurant, mosque. Practice: I go to school. The park is near.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 7: Present Simple & Actions
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0001-000000000019', 'ch000000-0000-0000-0001-000000000007', 'Action Verbs: I Go, I Eat, I Read', 'Learn common action verbs and use them in present simple affirmative. Focus on third-person -s: She reads. He eats.', 1, 'published'),
  ('le000000-0000-0000-0001-000000000020', 'ch000000-0000-0000-0001-000000000007', 'I Don''t Like Coffee — Negative Sentences', 'Learn to form negative present simple sentences using don''t and doesn''t. Practice: I don''t drink milk. She doesn''t eat meat.', 2, 'published'),
  ('le000000-0000-0000-0001-000000000021', 'ch000000-0000-0000-0001-000000000007', 'Do You Speak English? — Questions', 'Learn to form present simple questions using Do/Does. Practice: Do you like football? Does she speak Arabic?', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 8: Reading & Writing Skills
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0001-000000000022', 'ch000000-0000-0000-0001-000000000008', 'Reading Simple Sentences', 'Practice reading declarative and question sentences. Answer basic comprehension questions about short texts.', 1, 'published'),
  ('le000000-0000-0000-0001-000000000023', 'ch000000-0000-0000-0001-000000000008', 'Writing Words & Sentences', 'Practice writing familiar vocabulary from memory. Write simple sentences using to be and present simple.', 2, 'published'),
  ('le000000-0000-0000-0001-000000000024', 'ch000000-0000-0000-0001-000000000008', 'About Me — My First Paragraph', 'Write a short personal description: your name, age, country, and what you like. Read a model text first.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A2 LESSONS (18 lessons, 3 per chapter)
-- ─────────────────────────────────────────────────────────────────────────────

-- Chapter 1: Talking About the Past
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0002-000000000001', 'ch000000-0000-0000-0002-000000000001', 'Yesterday I Walked to School', 'Learn regular past simple verbs with -ed endings: walked, played, watched, listened. Practice telling what happened yesterday.', 1, 'published'),
  ('le000000-0000-0000-0002-000000000002', 'ch000000-0000-0000-0002-000000000001', 'I Went, I Saw, I Ate', 'Learn the most common irregular past simple verbs: went, saw, ate, had, got, made, came, took.', 2, 'published'),
  ('le000000-0000-0000-0002-000000000003', 'ch000000-0000-0000-0002-000000000001', 'Did You Go? I Didn''t Go', 'Learn past simple negative and question forms: didn''t + base form, Did you + base form?', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 2: Plans & the Future
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0002-000000000004', 'ch000000-0000-0000-0002-000000000002', 'I Am Going to Study', 'Learn to express planned future actions using going to. Practice: I am going to visit my family. She is going to study.', 1, 'published'),
  ('le000000-0000-0000-0002-000000000005', 'ch000000-0000-0000-0002-000000000002', 'It Will Rain Tomorrow', 'Learn to use will for predictions and spontaneous decisions. Practice: I think it will be hot. I will help you.', 2, 'published'),
  ('le000000-0000-0000-0002-000000000006', 'ch000000-0000-0000-0002-000000000002', 'What Are You Doing Right Now?', 'Learn present continuous for actions happening now. Practice: I am reading. She is cooking. They are playing.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 3: Comparing Things
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0002-000000000007', 'ch000000-0000-0000-0002-000000000003', 'Bigger, Faster, More Beautiful', 'Learn comparative adjectives: -er for short words, more for long words. Practice: A car is faster than a bus.', 1, 'published'),
  ('le000000-0000-0000-0002-000000000008', 'ch000000-0000-0000-0002-000000000003', 'The Biggest, The Best', 'Learn superlative adjectives: -est and most. Practice: Mount Everest is the tallest mountain. She is the best student.', 2, 'published'),
  ('le000000-0000-0000-0002-000000000009', 'ch000000-0000-0000-0002-000000000003', 'Some, Many, Much, A Few', 'Learn countable and uncountable nouns with quantifiers. Practice: some water, many books, much time, a few friends.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 4: Daily Life & Routines
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0002-000000000010', 'ch000000-0000-0000-0002-000000000004', 'My Daily Routine', 'Learn daily routine expressions: wake up, get dressed, have breakfast. Describe your typical day.', 1, 'published'),
  ('le000000-0000-0000-0002-000000000011', 'ch000000-0000-0000-0002-000000000004', 'Hobbies & Free Time', 'Learn hobby vocabulary: football, swimming, reading, cooking. Practice: In my free time, I like playing football.', 2, 'published'),
  ('le000000-0000-0000-0002-000000000012', 'ch000000-0000-0000-0002-000000000004', 'Jobs & Occupations', 'Learn common jobs: doctor, teacher, engineer, driver. Practice: She is a doctor. He works in a hospital.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 5: Out & About
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0002-000000000013', 'ch000000-0000-0000-0002-000000000005', 'Getting Around: Transport', 'Learn transport vocabulary: bus, train, car, taxi, plane. Practice: I go to school by bus. She takes the train.', 1, 'published'),
  ('le000000-0000-0000-0002-000000000014', 'ch000000-0000-0000-0002-000000000005', 'At the Shop', 'Learn shopping vocabulary: price, cheap, expensive, buy, pay. Practice dialogues about buying things.', 2, 'published'),
  ('le000000-0000-0000-0002-000000000015', 'ch000000-0000-0000-0002-000000000005', 'What''s the Weather Like?', 'Learn weather vocabulary: sunny, rainy, cloudy, windy, hot, cold. Practice: It is sunny today. It will rain tomorrow.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 6: Reading & Writing at A2
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0002-000000000016', 'ch000000-0000-0000-0002-000000000006', 'Reading a Short Story', 'Read a short story (5–8 sentences) about everyday life. Practice identifying main idea and sequence of events.', 1, 'published'),
  ('le000000-0000-0000-0002-000000000017', 'ch000000-0000-0000-0002-000000000006', 'Reading Emails & Messages', 'Read simple informal emails and text messages. Practice understanding purpose, main information, and responding.', 2, 'published'),
  ('le000000-0000-0000-0002-000000000018', 'ch000000-0000-0000-0002-000000000006', 'Writing About My Weekend', 'Write 4–5 sentences about what you did last weekend using past simple. Read a model text first.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- A3 LESSONS (18 lessons, 3 per chapter)
-- ─────────────────────────────────────────────────────────────────────────────

-- Chapter 1: Experience & Achievement
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0003-000000000001', 'ch000000-0000-0000-0003-000000000001', 'I Have Visited London', 'Learn present perfect for life experiences: I have visited, She has eaten, Have you ever? Practice with ever and never.', 1, 'published'),
  ('le000000-0000-0000-0003-000000000002', 'ch000000-0000-0000-0003-000000000001', 'I Have Lived Here for 5 Years', 'Learn present perfect with for and since for duration. Contrast with past simple: I lived there in 2020.', 2, 'published'),
  ('le000000-0000-0000-0003-000000000003', 'ch000000-0000-0000-0003-000000000001', 'While I Was Reading, She Called', 'Learn past continuous for interrupted actions and simultaneous events. Practice: I was studying when the phone rang.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 2: Conditions & Possibilities
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0003-000000000004', 'ch000000-0000-0000-0003-000000000002', 'If It Rains, I Will Stay Home', 'Learn first conditional for real future possibilities. Practice: If you study, you will pass. If it is sunny, we will go out.', 1, 'published'),
  ('le000000-0000-0000-0003-000000000005', 'ch000000-0000-0000-0003-000000000002', 'If I Had Money, I Would Travel', 'Learn second conditional for imaginary situations. Practice: If I were president, I would help people.', 2, 'published'),
  ('le000000-0000-0000-0003-000000000006', 'ch000000-0000-0000-0003-000000000002', 'You Should Study — Advice with Modals', 'Learn should, must, and have to for advice and obligation. Practice: You should exercise. You must wear a seatbelt.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 3: How Things Are Done
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0003-000000000007', 'ch000000-0000-0000-0003-000000000003', 'English Is Spoken Here', 'Learn present passive voice. Practice: Rice is grown in Asia. Cars are made in Japan. English is spoken worldwide.', 1, 'published'),
  ('le000000-0000-0000-0003-000000000008', 'ch000000-0000-0000-0003-000000000003', 'The Book Was Written in 1990', 'Learn past passive voice. Practice: The Pyramids were built 4,000 years ago. The email was sent yesterday.', 2, 'published'),
  ('le000000-0000-0000-0003-000000000009', 'ch000000-0000-0000-0003-000000000003', 'Basic Phrasal Verbs', 'Learn essential phrasal verbs: look up, turn on, give up, find out, pick up. Practice using them in sentences.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 4: Modern Life & Technology
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0003-000000000010', 'ch000000-0000-0000-0003-000000000004', 'Technology & the Internet', 'Learn technology vocabulary: computer, internet, website, app, email, password, download. Practice discussions about technology use.', 1, 'published'),
  ('le000000-0000-0000-0003-000000000011', 'ch000000-0000-0000-0003-000000000004', 'Our Environment', 'Learn environment vocabulary: pollution, recycle, climate, energy, protect. Discuss environmental topics.', 2, 'published'),
  ('le000000-0000-0000-0003-000000000012', 'ch000000-0000-0000-0003-000000000004', 'At the Office', 'Learn workplace vocabulary: office, meeting, colleague, manager, deadline. Practice office-related dialogues.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 5: Complex Sentences
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0003-000000000013', 'ch000000-0000-0000-0003-000000000005', 'The Man Who Lives Next Door', 'Learn relative clauses with who, which, and that. Practice: The teacher who teaches English is kind.', 1, 'published'),
  ('le000000-0000-0000-0003-000000000014', 'ch000000-0000-0000-0003-000000000005', 'I Enjoy Reading — Gerunds & Infinitives', 'Learn when to use -ing forms and to + verb. Practice: I enjoy swimming. I want to learn. She stopped talking.', 2, 'published'),
  ('le000000-0000-0000-0003-000000000015', 'ch000000-0000-0000-0003-000000000005', 'Giving Your Opinion', 'Learn opinion expressions: I think, I believe, In my opinion, I agree, I disagree. Practice structured discussions.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

-- Chapter 6: Academic Reading & Writing
INSERT INTO lessons (id, chapter_id, title, description, sort_order, status) VALUES
  ('le000000-0000-0000-0003-000000000016', 'ch000000-0000-0000-0003-000000000006', 'Reading a News Article', 'Read a simplified news article. Identify the main argument, key facts, and supporting details.', 1, 'published'),
  ('le000000-0000-0000-0003-000000000017', 'ch000000-0000-0000-0003-000000000006', 'Writing an Opinion Paragraph', 'Write a structured opinion paragraph with a topic sentence, supporting reasons, and a conclusion.', 2, 'published'),
  ('le000000-0000-0000-0003-000000000018', 'ch000000-0000-0000-0003-000000000006', 'Writing a Formal Email', 'Learn formal email structure: greeting, body, sign-off. Write a formal email for a school or work context.', 3, 'published')
ON CONFLICT (id) DO NOTHING;

COMMIT;
