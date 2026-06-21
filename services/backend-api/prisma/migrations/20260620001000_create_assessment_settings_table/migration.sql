-- P10-009: Create Assessment Settings Table
-- Branch: phase10/P10-009-assessment-settings-table
-- Dependency: P10-006 (assessments table on main)
-- Scope: Per-assessment behaviour settings owned exclusively by the backend.
--        Controls duration, max attempts, randomization, grading mode, and
--        visibility rules so Flutter never hard-codes or derives these values.
--
-- Backend authority rules (enforced at this migration layer):
--   - Every column in this table is backend-read-only from the Flutter
--     perspective. Flutter receives only the informational subset exposed
--     through the assessment-detail API (GET /assessments/:id).
--   - pass_threshold, section_weight, late_penalty_percent, and
--     grading_mode are NEVER returned to Flutter clients.
--   - feedback_policy controls whether correctness may appear in result
--     breakdown; the backend enforces the policy, not the client.
--   - allow_retake and max_attempts are backend-evaluated at attempt-start;
--     Flutter must not compute eligibility from these values locally.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_settings
-- ============================================================

CREATE TABLE assessment_settings (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Parent assessment (1-to-1)
    assessment_id           UUID            NOT NULL UNIQUE,

    -- Time control
    -- NULL means no time limit enforced by the backend.
    time_limit_seconds      INTEGER         NULL,

    -- Attempt control (backend-evaluated only; never returned to Flutter raw)
    max_attempts            INTEGER         NOT NULL DEFAULT 1,
    allow_retake            BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Question delivery
    randomize_questions     BOOLEAN         NOT NULL DEFAULT FALSE,
    randomize_options       BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Grading policy (backend-only; never returned to Flutter)
    grading_mode            TEXT            NOT NULL DEFAULT 'auto',
    pass_threshold          NUMERIC(5, 2)   NOT NULL DEFAULT 60.00,

    -- Late-submission policy (backend-evaluated only; never returned to Flutter)
    -- NULL means no late submissions accepted.
    late_submission_window_seconds  INTEGER NULL,
    late_penalty_percent    NUMERIC(5, 2)   NOT NULL DEFAULT 0.00,

    -- Result visibility (backend-controlled; governs what the result API returns)
    -- immediate: result is returned as soon as grading completes
    -- after_deadline: result is withheld until the deadline window closes
    -- manual: result is released manually by an admin
    result_visibility       TEXT            NOT NULL DEFAULT 'immediate',

    -- Feedback policy (backend-controlled; governs isCorrect in result breakdown)
    -- none: no per-question feedback is ever returned to Flutter
    -- after_submission: per-question correctness is returned after the attempt submits
    -- after_deadline: per-question correctness is withheld until deadline closes
    -- after_review: per-question correctness released only after manual admin review
    feedback_policy         TEXT            NOT NULL DEFAULT 'none',

    -- Visibility / publish window (backend-controlled)
    -- NULL means always visible while published.
    visible_from            TIMESTAMPTZ     NULL,
    visible_until           TIMESTAMPTZ     NULL,

    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT assessment_settings_assessment_fk
        FOREIGN KEY (assessment_id)
        REFERENCES assessments (id)
        ON DELETE CASCADE,

    CONSTRAINT assessment_settings_time_limit_positive_check
        CHECK (time_limit_seconds IS NULL OR time_limit_seconds > 0),

    CONSTRAINT assessment_settings_max_attempts_positive_check
        CHECK (max_attempts >= 1),

    CONSTRAINT assessment_settings_pass_threshold_range_check
        CHECK (pass_threshold >= 0 AND pass_threshold <= 100),

    CONSTRAINT assessment_settings_late_penalty_range_check
        CHECK (late_penalty_percent >= 0 AND late_penalty_percent <= 100),

    CONSTRAINT assessment_settings_late_window_positive_check
        CHECK (
            late_submission_window_seconds IS NULL
            OR late_submission_window_seconds > 0
        ),

    CONSTRAINT assessment_settings_grading_mode_check
        CHECK (grading_mode IN ('auto', 'manual')),

    CONSTRAINT assessment_settings_result_visibility_check
        CHECK (result_visibility IN ('immediate', 'after_deadline', 'manual')),

    CONSTRAINT assessment_settings_feedback_policy_check
        CHECK (feedback_policy IN ('none', 'after_submission', 'after_deadline', 'after_review')),

    CONSTRAINT assessment_settings_visible_window_check
        CHECK (
            visible_from IS NULL
            OR visible_until IS NULL
            OR visible_from < visible_until
        )
);

COMMENT ON TABLE assessment_settings IS
    'Backend-owned per-assessment settings: duration, attempt limits, randomization, grading mode, late policy, and visibility. '
    'Flutter never receives grading mode, pass threshold, late penalty, or raw attempt-eligibility fields. '
    'See docs/phase-10/assessment-authority-rules.md.';

COMMENT ON COLUMN assessment_settings.assessment_id IS
    'One-to-one FK to assessments.id. Each assessment has exactly one settings row.';

COMMENT ON COLUMN assessment_settings.time_limit_seconds IS
    'Time allowed for the attempt in seconds, backend-enforced. NULL = no limit. '
    'The backend returns this to Flutter as an informational field only; Flutter must not enforce it locally.';

COMMENT ON COLUMN assessment_settings.max_attempts IS
    'Maximum number of attempts a student may make. Backend-evaluated at attempt-start; '
    'Flutter must not compute eligibility from this value.';

COMMENT ON COLUMN assessment_settings.allow_retake IS
    'Whether students may attempt again after a passing result. Backend-evaluated only.';

COMMENT ON COLUMN assessment_settings.randomize_questions IS
    'Whether the backend randomizes question order on each delivery.';

COMMENT ON COLUMN assessment_settings.randomize_options IS
    'Whether the backend randomizes option order within each question on delivery.';

COMMENT ON COLUMN assessment_settings.grading_mode IS
    'auto: backend grades immediately on submission. manual: backend grades after admin review. '
    'NEVER returned to Flutter.';

COMMENT ON COLUMN assessment_settings.pass_threshold IS
    'Minimum score percentage for a passing result. Backend-enforced grading policy. '
    'NEVER returned to Flutter.';

COMMENT ON COLUMN assessment_settings.late_submission_window_seconds IS
    'Seconds after deadline close during which late submissions are still accepted (with penalty). '
    'NULL = no late submissions. Backend-evaluated only; NEVER returned to Flutter.';

COMMENT ON COLUMN assessment_settings.late_penalty_percent IS
    'Score deduction applied to late submissions (0–100). Backend-applied during grading. '
    'NEVER returned to Flutter.';

COMMENT ON COLUMN assessment_settings.result_visibility IS
    'Controls when the backend exposes the graded result to Flutter: '
    'immediate (on grading), after_deadline (when deadline closes), manual (admin-released).';

COMMENT ON COLUMN assessment_settings.feedback_policy IS
    'Controls when the backend includes isCorrect in result breakdown responses: '
    'none, after_submission, after_deadline, or after_review. Backend-enforced; '
    'Flutter must not show correctness when isCorrect is absent from the response.';

COMMENT ON COLUMN assessment_settings.visible_from IS
    'Optional timestamp from which this assessment is visible to students. Backend-evaluated.';

COMMENT ON COLUMN assessment_settings.visible_until IS
    'Optional timestamp after which this assessment is hidden from students. Backend-evaluated.';

-- ============================================================
-- Indexes
-- ============================================================

-- Used by backend when looking up settings for a specific assessment
CREATE INDEX assessment_settings_assessment_id_idx
    ON assessment_settings (assessment_id);

-- Used by backend to find assessments currently in their visibility window
CREATE INDEX assessment_settings_visible_window_idx
    ON assessment_settings (visible_from, visible_until)
    WHERE visible_from IS NOT NULL OR visible_until IS NOT NULL;
