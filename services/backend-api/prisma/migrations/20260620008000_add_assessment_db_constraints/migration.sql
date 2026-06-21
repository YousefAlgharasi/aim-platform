-- P10-017: Add Assessment DB Constraints
-- Branch: phase10/P10-017-db-constraints
-- Dependencies: P10-006..P10-016 (all assessment tables on main)
-- Scope: Additive constraint and index migration only.
--        Adds cross-table composite indexes, missing status/lifecycle guards,
--        and performance indexes not present in individual table migrations.
--
-- Backend authority rules:
--   - No client-writable authority columns introduced.
--   - No score, correctness, pass/fail, or deadline-state columns added.
--   - All constraints enforce backend-controlled state transitions only.
--
-- Scope guard: no AI Teacher, payment, parent dashboard, voice tables.
-- No secrets, service-role keys, credentials, or AI provider keys.

-- ============================================================
-- 1. assessment_sections — section weight sum guard (per assessment)
-- ============================================================

-- Partial index: only published assessments must have at least one section.
-- (Enforced at application layer; index here supports the validation query.)
CREATE INDEX IF NOT EXISTS assessment_sections_published_assessment_idx
    ON assessment_sections (assessment_id)
    WHERE assessment_id IN (
        SELECT id FROM assessments WHERE status = 'published'
    );

-- Composite: section lookup by assessment + title (admin dedup queries)
CREATE INDEX IF NOT EXISTS assessment_sections_assessment_title_idx
    ON assessment_sections (assessment_id, title);

-- ============================================================
-- 2. assessment_questions — additional composite indexes
-- ============================================================

-- Composite: all questions for an assessment ordered (question delivery)
CREATE INDEX IF NOT EXISTS assessment_questions_assessment_order_idx
    ON assessment_questions (assessment_id, "order");

-- Composite: section-scoped question delivery
CREATE INDEX IF NOT EXISTS assessment_questions_section_order_idx
    ON assessment_questions (section_id, "order")
    WHERE section_id IS NOT NULL;

-- ============================================================
-- 3. assessment_settings — published assessment must have settings
-- ============================================================

-- Index supporting validation: find assessments missing a settings row
CREATE INDEX IF NOT EXISTS assessment_settings_grading_mode_idx
    ON assessment_settings (grading_mode);

CREATE INDEX IF NOT EXISTS assessment_settings_feedback_policy_idx
    ON assessment_settings (feedback_policy);

-- ============================================================
-- 4. assessment_deadlines — active deadline lookup optimisation
-- ============================================================

-- Composite: backend deadline-status query per student (covers extend lookup)
CREATE INDEX IF NOT EXISTS assessment_deadlines_assessment_student_active_idx
    ON assessment_deadlines (assessment_id, student_id, is_active);

-- ============================================================
-- 5. assessment_attempts — lifecycle status transitions
-- ============================================================

-- Add constraint: expires_at must be after started_at when set
ALTER TABLE assessment_attempts
    ADD CONSTRAINT IF NOT EXISTS assessment_attempts_expires_after_start_check
        CHECK (expires_at IS NULL OR expires_at > started_at);

-- Composite: active in-progress attempts per student (resume lookup)
CREATE INDEX IF NOT EXISTS assessment_attempts_student_status_idx
    ON assessment_attempts (student_id, status)
    WHERE status IN ('started', 'in_progress');

-- Composite: graded attempts per assessment (result-history queries)
CREATE INDEX IF NOT EXISTS assessment_attempts_assessment_graded_idx
    ON assessment_attempts (assessment_id, status)
    WHERE status = 'graded';

-- ============================================================
-- 6. assessment_attempt_answers — submission lookup
-- ============================================================

-- Composite: all answers for an attempt (grading service bulk-fetch)
CREATE INDEX IF NOT EXISTS assessment_attempt_answers_attempt_id_idx
    ON assessment_attempt_answers (attempt_id);

-- ============================================================
-- 7. assessment_results — cross-table result-history queries
-- ============================================================

-- Composite: student result history paged by graded_at DESC
CREATE INDEX IF NOT EXISTS assessment_results_student_graded_at_idx
    ON assessment_results (student_id, graded_at DESC);

-- Composite: per-assessment result aggregation (admin analytics)
CREATE INDEX IF NOT EXISTS assessment_results_assessment_passed_idx
    ON assessment_results (assessment_id, passed);

-- ============================================================
-- 8. assessment_result_breakdowns — feedback service query
-- ============================================================

-- Composite: all breakdown rows for a result ordered by section
CREATE INDEX IF NOT EXISTS assessment_result_breakdowns_result_section_idx
    ON assessment_result_breakdowns (result_id, section_id NULLS LAST);

-- ============================================================
-- 9. deadline_events — per-deadline event timeline
-- ============================================================

-- Already has deadline_id+occurred_at index from P10-015.
-- Add: fast lookup of most-recent event per deadline (status derivation)
CREATE INDEX IF NOT EXISTS deadline_events_deadline_latest_idx
    ON deadline_events (deadline_id, occurred_at DESC);

-- ============================================================
-- 10. assessment_audit_logs — composite actor+entity lookup
-- ============================================================

CREATE INDEX IF NOT EXISTS assessment_audit_logs_actor_entity_idx
    ON assessment_audit_logs (actor_id, entity_type, occurred_at DESC);
