-- P5-030: Create Learning Sessions Migration
-- Branch: phase5/P5-030-learning-sessions-migration
-- Dependency: P5-009 (AIM Session Input Contract)
-- Scope: Backend-owned session lifecycle table used to assemble the
--        AimSessionInput segment of POST /aim/v1/analysis per P5-009.
--
-- Backend authority rules (enforced at this migration layer):
--   - Every field in this table is backend-owned. No client writes are
--     permitted. The session row is created and updated only by the backend
--     sessions feature module.
--   - student_id is backend-resolved from the authenticated session context;
--     clients never submit it to a write path against this table.
--   - session_type is backend-classified from client intent; never trusted
--     verbatim from a client payload.
--   - current_level, level_source, level_set_at are a snapshot of backend-
--     persisted level state at session entry. They are read-only context for
--     the AIM Engine and never set from client input.
--   - placement_result_id links to the Phase 4 placement_results table; null
--     once the AIM Engine has stable skill-state history for the student.
--   - Speed / response-time metrics live on attempts and session_events, not
--     here. The Phase 5 rule that timing must never feed mastery, level, or
--     difficulty is preserved by leaving timing fields out of this table.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: learning_sessions
-- ============================================================

CREATE TABLE learning_sessions (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id                  UUID            NOT NULL,

    session_type                TEXT            NOT NULL,
    status                      TEXT            NOT NULL DEFAULT 'active',

    started_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    last_activity_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    closed_at                   TIMESTAMPTZ     NULL,

    current_level               TEXT            NOT NULL,
    level_source                TEXT            NOT NULL,
    level_set_at                TIMESTAMPTZ     NOT NULL,

    skill_focus_ids             JSONB           NOT NULL DEFAULT '[]'::jsonb,

    placement_result_id         UUID            NULL
                                                REFERENCES placement_results (id)
                                                ON DELETE SET NULL,
    placement_completed_at      TIMESTAMPTZ     NULL,

    contract_version            TEXT            NOT NULL,

    created_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT learning_sessions_session_type_check
        CHECK (session_type IN (
            'lesson_practice',
            'review_practice',
            'placement_followup',
            'adaptive_drill'
        )),

    CONSTRAINT learning_sessions_status_check
        CHECK (status IN (
            'active',
            'closed',
            'abandoned'
        )),

    CONSTRAINT learning_sessions_level_source_check
        CHECK (level_source IN (
            'placement',
            'aim_engine'
        )),

    CONSTRAINT learning_sessions_skill_focus_ids_is_array_check
        CHECK (jsonb_typeof(skill_focus_ids) = 'array'),

    CONSTRAINT learning_sessions_activity_timestamps_check
        CHECK (started_at <= last_activity_at),

    CONSTRAINT learning_sessions_closed_at_after_started_check
        CHECK (closed_at IS NULL OR closed_at >= started_at),

    CONSTRAINT learning_sessions_placement_pair_consistency_check
        CHECK (
            (placement_result_id IS NULL AND placement_completed_at IS NULL)
            OR (placement_result_id IS NOT NULL AND placement_completed_at IS NOT NULL)
        ),

    CONSTRAINT learning_sessions_closed_status_requires_closed_at_check
        CHECK (
            (status = 'active' AND closed_at IS NULL)
            OR (status IN ('closed', 'abandoned') AND closed_at IS NOT NULL)
        )
);

COMMENT ON TABLE learning_sessions IS
    'Backend-owned learning session records. One row per session; backend assembles AimSessionInput (P5-009) from this row plus derived behavioral signals at AIM call time.';

COMMENT ON COLUMN learning_sessions.id IS
    'Primary key. Backend-issued UUID surfaced to the AIM Engine as sessionId.';

COMMENT ON COLUMN learning_sessions.student_id IS
    'Backend-resolved student id from authenticated session context. Never taken from a client payload.';

COMMENT ON COLUMN learning_sessions.session_type IS
    'Backend-classified session type per P5-009. Client intent is mapped to one of the four allowed values by the backend, never trusted verbatim.';

COMMENT ON COLUMN learning_sessions.status IS
    'Lifecycle status of the session. active until the backend closes or abandons it.';

COMMENT ON COLUMN learning_sessions.started_at IS
    'ISO-8601 UTC timestamp of when the backend opened the session.';

COMMENT ON COLUMN learning_sessions.last_activity_at IS
    'ISO-8601 UTC timestamp of the most recent backend-recorded activity in the session. Maintained by the backend session service.';

COMMENT ON COLUMN learning_sessions.closed_at IS
    'ISO-8601 UTC timestamp of when the backend closed or abandoned the session. Null while active.';

COMMENT ON COLUMN learning_sessions.current_level IS
    'Snapshot of the student backend-persisted level at session entry. Read-only context for the AIM Engine; clients never set this.';

COMMENT ON COLUMN learning_sessions.level_source IS
    'Origin of current_level. One of placement, aim_engine.';

COMMENT ON COLUMN learning_sessions.level_set_at IS
    'ISO-8601 UTC timestamp of when current_level was last set by its source.';

COMMENT ON COLUMN learning_sessions.skill_focus_ids IS
    'JSONB array of curriculum skill keys this session is associated with. Resolved by the backend from curriculum data; clients never submit raw skill keys here.';

COMMENT ON COLUMN learning_sessions.placement_result_id IS
    'Optional reference to the Phase 4 placement result that bootstrapped this students AIM state. Null once the AIM Engine has stable skill-state history.';

COMMENT ON COLUMN learning_sessions.placement_completed_at IS
    'ISO-8601 UTC timestamp when the referenced placement completed. Paired with placement_result_id by the consistency check constraint.';

COMMENT ON COLUMN learning_sessions.contract_version IS
    'The AIM contract version the backend will declare to the AIM Engine when assembling AimSessionInput for this session.';

COMMENT ON COLUMN learning_sessions.created_at IS
    'Backend-set on row creation. Never updated after.';

COMMENT ON COLUMN learning_sessions.updated_at IS
    'Backend-set on every write to this row. Maintained by the backend session service, not by clients.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX learning_sessions_student_id_idx
    ON learning_sessions (student_id);

CREATE INDEX learning_sessions_student_id_status_idx
    ON learning_sessions (student_id, status);

CREATE INDEX learning_sessions_session_type_idx
    ON learning_sessions (session_type);

CREATE INDEX learning_sessions_started_at_idx
    ON learning_sessions (started_at);

CREATE INDEX learning_sessions_last_activity_at_idx
    ON learning_sessions (last_activity_at);

CREATE INDEX learning_sessions_placement_result_id_idx
    ON learning_sessions (placement_result_id);

CREATE INDEX learning_sessions_status_active_partial_idx
    ON learning_sessions (student_id, last_activity_at)
    WHERE status = 'active';
