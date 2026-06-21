-- P10-016: Create Assessment Audit Log Table Migration
-- Branch: phase10/P10-016-assessment-audit-table
-- Dependency: P10-011 (Assessment Attempts Table Migration),
--             P10-013 (Assessment Results Table Migration)
-- Scope: Safe, backend-written record of assessment-related events
--        (attempt started/submitted/graded, deadline extended, etc.) for
--        traceability, per the Audit Log entity in
--        docs/phase-10/assessment-domain-map.md (§12).
--
-- Backend authority rules (enforced at this migration layer):
--   - entity_id is stored as a plain UUID, not a foreign key, so an audit
--     record survives even if the referenced assessment/attempt/deadline/
--     result row is later deleted. This is intentional for traceability.
--   - metadata must contain safe fields only. No secrets, service-role
--     keys, database credentials, AI provider keys, or full sensitive
--     answer payloads may be stored, per the domain map's "What It Is Not"
--     rule for this entity. Enforcement of payload content happens in the
--     backend audit-logging service, not at the schema layer.
--   - This table is backend-write-only. No client write path exists, and
--     Flutter does not read this table in Phase 10 (reviewer/backend use
--     only).
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: assessment_audit_logs
-- ============================================================

CREATE TABLE assessment_audit_logs (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type   TEXT            NOT NULL,
    entity_id     UUID            NOT NULL,
    event_type    TEXT            NOT NULL,
    actor_id      UUID            NULL,
    occurred_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    metadata      JSONB           NOT NULL DEFAULT '{}',

    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT assessment_audit_logs_entity_type_check
        CHECK (entity_type IN ('assessment', 'attempt', 'deadline', 'result'))
);

COMMENT ON TABLE assessment_audit_logs IS
    'Backend-owned, write-only audit trail per docs/phase-10/assessment-domain-map.md (Audit Log entity). Reviewer/backend use only; Flutter does not read this table in Phase 10. metadata must contain safe fields only — no secrets, credentials, or full sensitive answer payloads.';

COMMENT ON COLUMN assessment_audit_logs.id IS
    'Backend-generated primary key.';

COMMENT ON COLUMN assessment_audit_logs.entity_type IS
    'Domain entity this event concerns: assessment, attempt, deadline, or result.';

COMMENT ON COLUMN assessment_audit_logs.entity_id IS
    'UUID of the referenced entity. Stored without a foreign key so the audit record survives deletion of the referenced row.';

COMMENT ON COLUMN assessment_audit_logs.event_type IS
    'Backend-defined event name (e.g. attempt_started, attempt_submitted, attempt_graded, deadline_extended).';

COMMENT ON COLUMN assessment_audit_logs.actor_id IS
    'Backend-resolved id of the user who triggered the event, if any. Null for system-triggered events.';

COMMENT ON COLUMN assessment_audit_logs.occurred_at IS
    'Backend-set timestamp of when the event occurred.';

COMMENT ON COLUMN assessment_audit_logs.metadata IS
    'Safe, non-sensitive event metadata only. Must never contain secrets, service-role keys, database credentials, AI provider keys, or full sensitive answer payloads.';

COMMENT ON COLUMN assessment_audit_logs.created_at IS
    'Backend-set on persistence. This table is append-only; rows are never updated.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX assessment_audit_logs_entity_type_entity_id_idx
    ON assessment_audit_logs (entity_type, entity_id);

CREATE INDEX assessment_audit_logs_event_type_idx
    ON assessment_audit_logs (event_type);

CREATE INDEX assessment_audit_logs_actor_id_idx
    ON assessment_audit_logs (actor_id);

CREATE INDEX assessment_audit_logs_occurred_at_idx
    ON assessment_audit_logs (occurred_at);
