-- Phase 4 — P4-026
-- Add Placement Performance Indexes
-- Branch: phase4/P4-026-placement-indexes
-- Description: Add composite and cross-query performance indexes for the
--   placement flow covering placement_tests, placement_sections,
--   placement_questions, placement_attempts, placement_answers,
--   placement_question_skills, placement_results, initial_learning_path,
--   and placement_audit_log tables.
--
-- Rationale:
--   Individual table migrations (P4-017 through P4-025) already created
--   single-column and primary-constraint indexes per table.  This migration
--   adds the *composite* and *partial* indexes that target the actual backend
--   query patterns identified in the placement API contracts:
--
--     • Question delivery (P4-040): fetch all questions for a section in
--       order — needs (placement_section_id, order_index) covering index.
--     • Answer scoring (P4-042/043): look up all answers for an attempt
--       grouped by skill — needs (placement_attempt_id, skill_code).
--     • Correctness rollup (P4-043/046): aggregate is_correct per skill
--       within an attempt — needs (placement_attempt_id, skill_code, is_correct).
--     • Active-attempt lookup (P4-041): find a student's active attempt for
--       the published test — needs (student_id, status) partial index.
--     • Audit timeline (P4-050): ordered event history per student/attempt —
--       needs (student_id, created_at) and (placement_attempt_id, created_at).
--     • Result lookup (P4-046/047): fetch result by student and level —
--       needs (student_id, estimated_level).
--     • Admin question listing: ordered question bank per section with type
--       filter — needs (placement_section_id, question_type, order_index).
--     • Learning path ordered fetch: all entries for a result ordered by
--       priority — needs (placement_result_id, priority ASC) covering index.
--
-- Scope:
--   Placement Test phase only.
--   No AIM Engine runtime, AI Teacher, lesson delivery, recommendations,
--   progress dashboard, or Phase 5+ tables.
--
-- Security rules:
--   No secrets, service-role keys, database credentials, JWT secrets, or
--   AI provider keys are stored or referenced here.
--   correct_answer and scoring data remain server-side only; these indexes
--   do not expose answer keys or computed levels to clients.
--   Flutter/client must never use these indexes to infer placement scores,
--   estimated_level, skill_mastery_map, weakness_map, or initial path order.
--   Backend remains the sole authority for all placement scoring and results.
--
-- Dependencies:
--   P4-017 (placement_tests table)
--   P4-018 (placement_sections table)
--   P4-019 (placement_questions table)
--   P4-020 (placement_question_skills table)
--   P4-021 (placement_attempts table)
--   P4-022 (placement_answers table)
--   P4-023 (placement_results table)
--   P4-024 (initial_learning_path table)
--   P4-025 (placement_audit_log table)

-- ============================================================
-- placement_tests: admin section-list query
-- ============================================================

-- Admin fetches sections for a test ordered by status then created_at
-- (e.g. GET /admin/placement-tests?status=published&sort=created_at)
CREATE INDEX IF NOT EXISTS placement_tests_status_created_at_idx
    ON placement_tests (status, created_at DESC);

-- ============================================================
-- placement_sections: ordered section list per test (admin & delivery)
-- ============================================================

-- Already created in P4-018; added here with IF NOT EXISTS as a no-op guard.
-- The covering index (test_id, order_index) is the hot path for delivery.
CREATE INDEX IF NOT EXISTS placement_sections_test_order_idx
    ON placement_sections (placement_test_id, order_index ASC);

-- ============================================================
-- placement_questions: question delivery and admin listing
-- ============================================================

-- Q-delivery (P4-040): fetch ordered questions for a section
-- Covers the JOIN path: section → questions ordered for display.
CREATE INDEX IF NOT EXISTS placement_questions_section_order_delivery_idx
    ON placement_questions (placement_section_id, order_index ASC);

-- Admin question bank filtered by type within a section
CREATE INDEX IF NOT EXISTS placement_questions_section_type_order_idx
    ON placement_questions (placement_section_id, question_type, order_index ASC);

-- ============================================================
-- placement_question_skills: scoring service skill lookups
-- ============================================================

-- Scoring (P4-046): given a skill, find all primary-skill questions
-- Partial index on primary-skill rows only (already one per question).
CREATE INDEX IF NOT EXISTS placement_question_skills_primary_by_skill_idx
    ON placement_question_skills (skill_id)
    WHERE is_primary = true;

-- Scoring (P4-046): for a batch of question IDs, fetch their primary skill
CREATE INDEX IF NOT EXISTS placement_question_skills_question_primary_idx
    ON placement_question_skills (placement_question_id, skill_id)
    WHERE is_primary = true;

-- ============================================================
-- placement_attempts: active-attempt lookup
-- ============================================================

-- API guard (P4-041): one-active-attempt check — student's active attempts
-- Partial index: only 'active' rows (small, fast for constraint check).
CREATE INDEX IF NOT EXISTS placement_attempts_student_active_idx
    ON placement_attempts (student_id)
    WHERE status = 'active';

-- Lifecycle queries: attempts for a student ordered by start time
CREATE INDEX IF NOT EXISTS placement_attempts_student_started_at_idx
    ON placement_attempts (student_id, started_at DESC);

-- Admin: attempts for a test filtered by status
CREATE INDEX IF NOT EXISTS placement_attempts_test_status_idx
    ON placement_attempts (placement_test_id, status);

-- ============================================================
-- placement_answers: scoring rollup indexes
-- ============================================================

-- Scoring (P4-043/046): all answers for an attempt grouped by skill.
-- Hot path: score each skill area after submission.
CREATE INDEX IF NOT EXISTS placement_answers_attempt_skill_idx
    ON placement_answers (placement_attempt_id, skill_code);

-- Correctness rollup: count correct answers per skill within an attempt.
-- Covering index for the scoring aggregate query.
CREATE INDEX IF NOT EXISTS placement_answers_attempt_skill_correct_idx
    ON placement_answers (placement_attempt_id, skill_code, is_correct);

-- Correctness-only partial: total correct answers for an attempt (fast count).
CREATE INDEX IF NOT EXISTS placement_answers_attempt_correct_idx
    ON placement_answers (placement_attempt_id)
    WHERE is_correct = true;

-- ============================================================
-- placement_results: result lookup and admin reporting
-- ============================================================

-- Student result history by level (admin reporting / analytics)
CREATE INDEX IF NOT EXISTS placement_results_student_level_idx
    ON placement_results (student_id, estimated_level);

-- Admin: filter results by level across all students
CREATE INDEX IF NOT EXISTS placement_results_level_created_at_idx
    ON placement_results (estimated_level, created_at DESC);

-- ============================================================
-- initial_learning_path: ordered path fetch
-- ============================================================

-- Primary read path (P4-047): fetch all entries for a result in priority order.
-- Covering index for: SELECT ... WHERE placement_result_id = $1 ORDER BY priority ASC
CREATE INDEX IF NOT EXISTS initial_learning_path_result_priority_asc_idx
    ON initial_learning_path (placement_result_id, priority ASC);

-- Skill-type entries lookup: find path entries for a specific skill
CREATE INDEX IF NOT EXISTS initial_learning_path_skill_id_entry_type_idx
    ON initial_learning_path (skill_id, entry_type)
    WHERE skill_id IS NOT NULL;

-- ============================================================
-- placement_audit_log: ordered timeline queries
-- ============================================================

-- Timeline: all events for a student ordered by time (debugging / audit)
CREATE INDEX IF NOT EXISTS placement_audit_log_student_created_at_idx
    ON placement_audit_log (student_id, created_at DESC);

-- Timeline: all events for an attempt ordered by time
CREATE INDEX IF NOT EXISTS placement_audit_log_attempt_created_at_idx
    ON placement_audit_log (placement_attempt_id, created_at DESC)
    WHERE placement_attempt_id IS NOT NULL;

-- Event-type filter with time ordering (e.g. all result_generated events)
CREATE INDEX IF NOT EXISTS placement_audit_log_event_type_created_at_idx
    ON placement_audit_log (event_type, created_at DESC);
