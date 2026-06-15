-- Phase 3 — P3-061 (curriculum-import-seed-check follow-up)
-- MVP Curriculum Content Seed.
--
-- Scope: Curriculum & Content System only.
-- Provides minimum viable content for admin UI display and backend validation.
--
-- Security rules:
-- - No secrets, service-role keys, database credentials, or AI provider keys.
-- - Backend is the final authority for content status and skill keys.
-- - This seed is for development/testing only.
--
-- Content created:
-- 1. Skills (grammar domain — published)
-- 2. 1 Course → 1 Level → 1 Chapter → 2 Lessons (all draft)
-- 3. lesson_skills links (each lesson linked to ≥1 skill)
-- 4. 2 Questions (draft, multiple_choice)
--
-- Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING.

-- ──────────────────────────────────────────
-- 1. Skills
-- ──────────────────────────────────────────

INSERT INTO skills (id, key, title, description, domain, status)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'grammar.past_simple.forms',
    'Past Simple: Affirmative Forms',
    'Recognise and produce affirmative sentences in the past simple tense.',
    'grammar',
    'published'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'grammar.past_simple.negative',
    'Past Simple: Negative Forms',
    'Produce negative sentences in the past simple using did not / didn''t.',
    'grammar',
    'published'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'grammar.past_simple.questions',
    'Past Simple: Question Forms',
    'Form and respond to yes/no and wh- questions in the past simple.',
    'grammar',
    'published'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'vocabulary.everyday_actions',
    'Everyday Action Verbs',
    'Use common action verbs in past simple context.',
    'vocabulary',
    'published'
  )
ON CONFLICT (key) DO NOTHING;

-- ──────────────────────────────────────────
-- 2. Course
-- ──────────────────────────────────────────

INSERT INTO courses (id, title, slug, description, sort_order, status)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'English for Beginners (A1)',
  'english-for-beginners-a1',
  'A complete beginner course for Arabic-speaking learners of English.',
  0,
  'draft'
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────
-- 3. Level
-- ──────────────────────────────────────────

INSERT INTO levels (id, course_id, title, code, slug, description, sort_order, status)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'Unit 1 — Past Simple',
  'A1-U1',
  'unit-1-past-simple',
  'Introductory unit covering the past simple tense.',
  0,
  'draft'
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────
-- 4. Chapter
-- ──────────────────────────────────────────

INSERT INTO chapters (id, level_id, title, slug, description, sort_order, status)
VALUES (
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000002',
  'Chapter 1 — Affirmative and Negative',
  'chapter-1-affirmative-negative',
  'Forming affirmative and negative past simple sentences.',
  0,
  'draft'
)
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────
-- 5. Lessons
-- ──────────────────────────────────────────

INSERT INTO lessons (id, chapter_id, title, description, sort_order, status)
VALUES
  (
    'b0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000003',
    'Lesson 1 — Past Simple Affirmative',
    'Learn to form and use affirmative sentences in the past simple.',
    0,
    'draft'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000003',
    'Lesson 2 — Past Simple Negative',
    'Learn to form and use negative sentences in the past simple.',
    1,
    'draft'
  )
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────
-- 6. Lesson-Skill Links
-- ──────────────────────────────────────────
-- Critical rule: every lesson must have ≥1 skill link before publish.

INSERT INTO lesson_skills (lesson_id, skill_id)
VALUES
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────
-- 7. Questions (question bank — not linked to lessons by design)
-- ──────────────────────────────────────────

INSERT INTO questions (id, type, stem, difficulty, tags, status, created_by)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'multiple_choice',
    'She _____ (go) to the market yesterday.',
    'beginner',
    ARRAY['past_simple', 'A1', 'affirmative'],
    'draft',
    '00000000-0000-0000-0000-000000000000'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'true_false',
    'We use "did not" to form negative past simple sentences.',
    'beginner',
    ARRAY['past_simple', 'A1', 'negative'],
    'draft',
    '00000000-0000-0000-0000-000000000000'
  )
ON CONFLICT (id) DO NOTHING;
