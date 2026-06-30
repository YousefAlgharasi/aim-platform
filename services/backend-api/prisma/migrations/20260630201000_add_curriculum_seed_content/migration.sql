-- Seed a small sample curriculum content tree so the student app (lesson
-- list, lesson detail, Quick Start, Recommended Course) has real published
-- content to render instead of empty states.
--
-- Scope:
-- Curriculum & Content System only. One course -> one level -> one chapter
-- -> two lessons, each fully published with linked skills and content
-- assets (text/image/audio/vocabulary/exercise). Idempotent — guarded by
-- slug/key uniqueness so re-running this migration is a no-op.
--
-- Security rules:
-- - All rows are backend-owned static content; no secrets, credentials, or
--   AI provider keys here.
-- - No AIM Engine runtime, placement, session, or progress data is created
--   by this migration — only static curriculum content.

DO $$
DECLARE
  v_course_id   UUID;
  v_level_id    UUID;
  v_chapter_id  UUID;
  v_skill_id    UUID;
  v_lesson1_id  UUID;
  v_lesson2_id  UUID;
BEGIN
  -- Skip entirely if this seed has already been applied.
  IF EXISTS (SELECT 1 FROM courses WHERE slug = 'english-basics') THEN
    RETURN;
  END IF;

  INSERT INTO courses (title, slug, description, sort_order, status)
  VALUES (
    'English Basics',
    'english-basics',
    'Foundational English for absolute beginners — greetings, everyday phrases, and core vocabulary.',
    1,
    'published'
  )
  RETURNING id INTO v_course_id;

  INSERT INTO levels (course_id, title, code, slug, description, sort_order, status)
  VALUES (
    v_course_id,
    'Beginner',
    'A1',
    'beginner',
    'Starting point for learners with little to no prior English knowledge.',
    1,
    'published'
  )
  RETURNING id INTO v_level_id;

  INSERT INTO chapters (level_id, title, slug, description, sort_order, status)
  VALUES (
    v_level_id,
    'Getting Started',
    'getting-started',
    'Your first steps into English conversation.',
    1,
    'published'
  )
  RETURNING id INTO v_chapter_id;

  INSERT INTO skills (key, title, description, domain, status)
  VALUES (
    'functional_language.greetings.basic',
    'Basic Greetings',
    'Recognising and using common English greeting phrases.',
    'functional_language',
    'published'
  )
  RETURNING id INTO v_skill_id;

  -- Lesson 1: Saying Hello
  INSERT INTO lessons (chapter_id, title, description, sort_order, status, xp_value)
  VALUES (
    v_chapter_id,
    'Saying Hello',
    'What you do — the first step in any English conversation.',
    1,
    'published',
    40
  )
  RETURNING id INTO v_lesson1_id;

  INSERT INTO lesson_skills (lesson_id, skill_id) VALUES (v_lesson1_id, v_skill_id);

  INSERT INTO lesson_assets (lesson_id, type, title, description, "order", status, duration_seconds, metadata)
  VALUES
    (v_lesson1_id, 'text', 'Introduction', 'What you will learn', 1, 'published', NULL, NULL),
    (v_lesson1_id, 'image', 'Greeting Scenes', 'Greeting scenes illustration', 2, 'published', NULL, NULL),
    (v_lesson1_id, 'audio', 'Common Greetings', 'Listen: common greetings', 3, 'published', 80, NULL),
    (v_lesson1_id, 'vocabulary', 'New Words', '8 new words to learn', 4, 'published', NULL, '{"wordCount": 8}'::jsonb),
    (v_lesson1_id, 'exercise', 'Match the Greetings', 'Match the greetings', 5, 'published', NULL, '{"itemCount": 5}'::jsonb);

  -- Lesson 2: Introducing Yourself
  INSERT INTO lessons (chapter_id, title, description, sort_order, status, xp_value)
  VALUES (
    v_chapter_id,
    'Introducing Yourself',
    'Learn to share your name, where you are from, and ask the same in return.',
    2,
    'published',
    40
  )
  RETURNING id INTO v_lesson2_id;

  INSERT INTO lesson_skills (lesson_id, skill_id) VALUES (v_lesson2_id, v_skill_id);

  INSERT INTO lesson_assets (lesson_id, type, title, description, "order", status, duration_seconds, metadata)
  VALUES
    (v_lesson2_id, 'text', 'Introduction', 'What you will learn', 1, 'published', NULL, NULL),
    (v_lesson2_id, 'audio', 'Self Introductions', 'Listen: introducing yourself', 2, 'published', 95, NULL),
    (v_lesson2_id, 'vocabulary', 'New Words', '6 new words to learn', 3, 'published', NULL, '{"wordCount": 6}'::jsonb),
    (v_lesson2_id, 'exercise', 'Practice Introductions', 'Complete the dialogue', 4, 'published', NULL, '{"itemCount": 4}'::jsonb);
END $$;
