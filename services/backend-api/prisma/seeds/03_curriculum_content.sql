-- Phase 3 - P3-029
-- MVP Curriculum Content Seed.
--
-- Scope: Curriculum & Content System only.
-- Provides safe development seed data for curriculum hierarchy, skills,
-- lesson-skill links, reusable questions, and question-skill links.
--
-- Security rules:
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys.
-- - Backend is the final authority for content status, publishing, and skill links.
-- - This seed is for development/testing only.
-- - Do not insert onboarding, placement, learner delivery, practice attempt,
--   session, AIM runtime, progress, recommendation, AI Teacher, or Student Web App data.
--
-- Safe to run multiple times: all inserts use ON CONFLICT handling.

-- -----------------------------------------------------------------------
-- 1. Skills
-- -----------------------------------------------------------------------

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
    'Produce negative sentences in the past simple using did not plus a base verb.',
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
    'Use common action verbs in past simple contexts.',
    'vocabulary',
    'published'
  )
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------
-- 2. Curriculum Hierarchy
-- -----------------------------------------------------------------------

INSERT INTO courses (id, title, slug, description, sort_order, status)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'English for Beginners A1',
  'english-for-beginners-a1',
  'A complete beginner course for English learners.',
  0,
  'draft'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO levels (id, course_id, title, code, slug, description, sort_order, status)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'Unit 1: Past Simple',
  'A1-U1',
  'unit-1-past-simple',
  'Introductory unit covering the past simple tense.',
  0,
  'draft'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO chapters (id, level_id, title, slug, description, sort_order, status)
VALUES (
  'b0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000002',
  'Chapter 1: Affirmative and Negative',
  'chapter-1-affirmative-negative',
  'Forming affirmative and negative past simple sentences.',
  0,
  'draft'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, chapter_id, title, description, sort_order, status)
VALUES
  (
    'b0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000003',
    'Lesson 1: Past Simple Affirmative',
    'Learn to form and use affirmative sentences in the past simple.',
    0,
    'draft'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000003',
    'Lesson 2: Past Simple Negative',
    'Learn to form and use negative sentences in the past simple.',
    1,
    'draft'
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 3. Lesson-Skill Links
-- -----------------------------------------------------------------------
-- Critical rule: every seeded lesson has at least one skill link before any
-- test attempts to publish it.

INSERT INTO lesson_skills (lesson_id, skill_id)
VALUES
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------
-- 4. Question Bank Items
-- -----------------------------------------------------------------------
-- Reusable question bank content only. This does not create placement,
-- practice attempt, session, mastery, or learner delivery data.

INSERT INTO questions (id, key, type, difficulty, prompt, explanation, status, metadata)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'question.grammar.past_simple.forms.affirmative_gap',
    'multiple_choice',
    'easy',
    'She _____ to the market yesterday.',
    'The past simple affirmative form of "go" is "went".',
    'draft',
    '{"tags":["past_simple","a1","affirmative"],"source":"p3-029-seed"}'::jsonb
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'question.grammar.past_simple.negative.rule_check',
    'true_false',
    'easy',
    'We use "did not" to form negative past simple sentences.',
    'Past simple negatives use did not plus the base verb.',
    'draft',
    '{"tags":["past_simple","a1","negative"],"source":"p3-029-seed"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 5. Question-Skill Links
-- -----------------------------------------------------------------------

INSERT INTO question_skills (question_id, skill_id)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;
