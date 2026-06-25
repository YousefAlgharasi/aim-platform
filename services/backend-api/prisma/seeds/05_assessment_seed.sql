-- Phase 10 — P10-018
-- Seed data for development/testing: sample quiz and exam with sections,
-- questions, settings, and a deadline window.
--
-- Scope: Assessment system (Phase 10) only.
--
-- Security rules:
--   - No secrets, service-role keys, database credentials, JWT secrets,
--     or AI provider keys are present here.
--   - Correct answer values (is_correct on question_choices) are NOT seeded
--     here — they belong to the question bank (Phase 3) and remain
--     backend-only. This seed file never exposes correct answers.
--   - pass_threshold and late_penalty_percent in assessment_settings are
--     backend-owned configuration — they are seeded here for dev testing
--     only and must never be returned to Flutter clients.
--   - This file must only be executed by backend-controlled tooling
--     (prisma db seed or psql pipeline). Never expose to clients.
--   - Backend remains the final authority for grading, scoring, pass/fail,
--     deadline status, and attempt eligibility.
--
-- Dependencies:
--   P10-006 (assessments), P10-007 (sections), P10-008 (question links),
--   P10-009 (settings), P10-010 (deadlines), P10-017 (constraints)
--
-- Usage: Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING.

-- ============================================================
-- Fixed UUIDs (dev environment only — never production secrets)
-- ============================================================

-- Assessment IDs
-- p10-quiz-001  : Unit 3 Grammar Quiz (quiz, published)
-- p10-exam-001  : Midterm Exam        (exam, published)

-- Section IDs
-- p10-section-quiz-grammar   : Grammar section of quiz
-- p10-section-exam-listening : Listening section of exam
-- p10-section-exam-grammar   : Grammar section of exam

-- ============================================================
-- 1. Assessments
-- ============================================================

INSERT INTO assessments (id, type, title, description, status, created_by)
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'quiz',
    'Unit 3 Grammar Quiz',
    'A short grammar check covering Unit 3 material.',
    'published',
    '00000000-0000-0000-0000-000000000001'  -- dev admin placeholder
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'exam',
    'Midterm Exam',
    'Covers Units 1–5: listening, grammar, and vocabulary.',
    'published',
    '00000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Assessment Sections
-- ============================================================

INSERT INTO assessment_sections (id, assessment_id, title, "order", weight)
VALUES
  -- Quiz: single section
  (
    'a1000000-0000-0001-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Grammar',
    1,
    1.000
  ),
  -- Exam: two sections
  (
    'a1000000-0000-0001-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'Listening',
    1,
    0.400
  ),
  (
    'a1000000-0000-0001-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    'Grammar',
    2,
    0.600
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Assessment Settings
-- (pass_threshold and late_penalty_percent: backend-only — never to Flutter)
-- ============================================================

INSERT INTO assessment_settings (
  id, assessment_id, time_limit_seconds, max_attempts, allow_retake,
  randomize_questions, randomize_options,
  grading_mode, pass_threshold,
  late_submission_window_seconds, late_penalty_percent,
  result_visibility, feedback_policy
)
VALUES
  -- Quiz settings
  (
    'a1000000-0000-0002-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    900,      -- 15 minutes
    2,        -- 2 attempts allowed
    FALSE,
    FALSE, FALSE,
    'auto',
    60.00,    -- 60% pass threshold — NEVER returned to Flutter
    3600,     -- 1h late window
    10.00,    -- 10% late penalty — NEVER returned to Flutter
    'immediate',
    'after_submission'
  ),
  -- Exam settings
  (
    'a1000000-0000-0002-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    3600,     -- 60 minutes
    1,        -- 1 attempt only
    FALSE,
    TRUE, FALSE,
    'auto',
    70.00,    -- 70% pass threshold — NEVER returned to Flutter
    NULL,     -- no late submissions
    0.00,
    'after_deadline',
    'after_deadline'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Assessment Deadlines
-- (opens/closes relative to seed time for dev flexibility)
-- ============================================================

INSERT INTO assessment_deadlines (
  id, assessment_id, student_id, timezone,
  opens_at, closes_at, extended_closes_at,
  late_window_seconds, late_penalty_percent, is_active
)
VALUES
  -- Quiz: open now, closes in 7 days
  (
    'a1000000-0000-0003-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    NULL,   -- global deadline
    'UTC',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '7 days',
    NULL,
    3600,
    10.00,
    TRUE
  ),
  -- Exam: open now, closes in 14 days
  (
    'a1000000-0000-0003-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    NULL,
    'UTC',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '14 days',
    NULL,
    NULL,
    0.00,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;
