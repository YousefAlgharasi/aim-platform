-- P5-036: Create Weakness Records Migration
-- Branch: phase5/P5-036-weakness-records-migration
-- Dependency: P5-013 (Weakness Record Contract)
-- Scope: Backend-controlled persistence for AIM Engine weakness outputs.
--
-- Backend authority rules (enforced at this migration layer):
--   - severity, status, detected_at (on first detection), and resolved_at are
--     exclusively AIM Engine outputs. No client writes are permitted.
--   - student_id is backend-resolved from session context; clients must never
--     submit it directly to a write path against this table.
--   - One row per weakness instance (id = AIM-issued weaknessId). A resolved
--     weakness that recurs later gets a new id; old rows are never reopened.
--   - trigger_attempt_ids accumulates across updates (append, not replace),
--     preserving full evidence history for the weakness instance.
--   - Speed and response time must never feed severity or status — those
--     signals belong to behavioral context only.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: weakness_records
-- ============================================================

CREATE TABLE weakness_records (
    id                     UUID            PRIMARY KEY,
    student_id             UUID            NOT NULL,
    skill_id               TEXT            NOT NULL,

    severity               TEXT            NOT NULL,
    status                 TEXT            NOT NULL,
    trigger_attempt_ids    JSONB           NOT NULL DEFAULT '[]'::jsonb,

    detected_at            TIMESTAMPTZ     NOT NULL,
    resolved_at            TIMESTAMPTZ     NULL,

    created_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT weakness_records_severity_check
        CHECK (severity IN (
            'emerging',
            'developing',
            'critical'
        )),

    CONSTRAINT weakness_records_status_check
        CHECK (status IN (
            'open',
            'improving',
            'resolved'
        )),

    CONSTRAINT weakness_records_trigger_attempt_ids_is_array_check
        CHECK (jsonb_typeof(trigger_attempt_ids) = 'array'),

    CONSTRAINT weakness_records_resolved_at_consistency_check
        CHECK (
            (status = 'resolved' AND resolved_at IS NOT NULL)
            OR (status IN ('open', 'improving') AND resolved_at IS NULL)
        ),

    CONSTRAINT weakness_records_resolved_at_after_detected_check
        CHECK (resolved_at IS NULL OR resolved_at >= detected_at)
);

COMMENT ON TABLE weakness_records IS
    'AIM Engine identified weaknesses: one row per weakness instance (id = AIM-issued weaknessId). Values mirror the validated AimWeaknessRecordOutput per P5-013 contract. Separate from and unmodified by the Phase 4 placement-time weakness map.';

COMMENT ON COLUMN weakness_records.id IS
    'Set equal to the AIM Engine-issued weaknessId on first persistence. Stable across updates to the same weakness instance. A recurring weakness after resolution gets a new id, never reopens an old row.';

COMMENT ON COLUMN weakness_records.student_id IS
    'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';

COMMENT ON COLUMN weakness_records.skill_id IS
    'Skill key from the curriculum skill taxonomy. Copied from the validated AimWeaknessRecordOutput.';

COMMENT ON COLUMN weakness_records.severity IS
    'Current severity tier: emerging, developing, or critical. Exclusively an AIM Engine output. critical is Phase 5 only and never produced by the Phase 4 placement snapshot.';

COMMENT ON COLUMN weakness_records.status IS
    'Lifecycle status: open, improving, or resolved. Exclusively an AIM Engine output.';

COMMENT ON COLUMN weakness_records.trigger_attempt_ids IS
    'JSONB array of attempt UUIDs that contributed evidence to this weakness. Backend appends new entries from each update rather than replacing the list, preserving full evidence history.';

COMMENT ON COLUMN weakness_records.detected_at IS
    'When this weakness instance was first detected, copied from the validated AimWeaknessRecordOutput on first persistence. Never updated after.';

COMMENT ON COLUMN weakness_records.resolved_at IS
    'Set when status transitions to resolved. Null while open or improving. Copied from the validated AimWeaknessRecordOutput on every update.';

COMMENT ON COLUMN weakness_records.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN weakness_records.updated_at IS
    'Backend-set on every persistence write for this record. Maintained by the persistence service, not by clients.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX weakness_records_student_id_idx
    ON weakness_records (student_id);

CREATE INDEX weakness_records_skill_id_idx
    ON weakness_records (skill_id);

CREATE INDEX weakness_records_student_id_status_idx
    ON weakness_records (student_id, status);

CREATE INDEX weakness_records_severity_idx
    ON weakness_records (severity);

CREATE INDEX weakness_records_detected_at_idx
    ON weakness_records (detected_at);

-- Partial index for the common "active weaknesses for a student" lookup
-- used during AIM pipeline state assembly and recommendation derivation.
CREATE INDEX weakness_records_active_student_idx
    ON weakness_records (student_id, detected_at)
    WHERE status IN ('open', 'improving');
