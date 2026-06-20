-- P10-015: Create Deadline Events Table
-- Branch: phase10/P10-015-deadline-events-table
-- Dependency: P10-010 (assessment_deadlines table)
-- Scope: Immutable audit log of state transitions for assessment deadlines:
--        opened, closed, late, extended, submitted, missed, expired.
--        Per docs/phase-10/assessment-domain-map.md §6 (Deadline Event).
--
-- Backend authority rules (enforced at this migration layer):
--   - Rows in this table are INSERT-only from backend services; no UPDATE
--     or DELETE path is ever exposed to clients or Flutter.
--   - Flutter does not consume deadline_events directly. They feed backend
--     audit trails and deadline-status derivation only.
--   - metadata JSONB stores safe, non-sensitive contextual data only
--     (e.g. actor id, reason label). It must never contain secrets,
--     credentials, correct answers, score thresholds, or grading policy.
--   - occurred_at is set by the backend at the moment of the transition;
--     no client-supplied timestamp is accepted.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: deadline_events
-- ============================================================

CREATE TABLE deadline_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The deadline whose state changed
    deadline_id     UUID        NOT NULL,

    -- Type of transition recorded
    -- opened     : deadline window became active
    -- closed     : standard close window passed
    -- late       : submission received within the late window
    -- extended   : admin granted an extension (extended_closes_at set)
    -- submitted  : a student attempt was submitted within this deadline window
    -- missed     : window closed with no submission from the student
    -- expired    : late window also passed with no submission
    event_type      TEXT        NOT NULL,

    -- UTC timestamp when the backend recorded this transition.
    -- Set by backend; never accepted from a client payload.
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Safe, non-sensitive contextual metadata (JSON object).
    -- Allowed fields: actor_id (UUID), reason (label string),
    --   student_id (UUID, for per-student events), attempt_id (UUID).
    -- Must NEVER contain: secrets, credentials, correct answers,
    --   score thresholds, grading policy, or raw personal data beyond UUIDs.
    metadata        JSONB       NOT NULL DEFAULT '{}',

    CONSTRAINT deadline_events_deadline_fk
        FOREIGN KEY (deadline_id)
        REFERENCES assessment_deadlines (id)
        ON DELETE CASCADE,

    CONSTRAINT deadline_events_event_type_check
        CHECK (event_type IN (
            'opened',
            'closed',
            'late',
            'extended',
            'submitted',
            'missed',
            'expired'
        )),

    CONSTRAINT deadline_events_metadata_is_object_check
        CHECK (jsonb_typeof(metadata) = 'object')
);

COMMENT ON TABLE deadline_events IS
    'Immutable append-only audit log of deadline state transitions. '
    'Rows are INSERT-only from backend services; no client write path exists. '
    'Flutter does not consume this table directly. '
    'See docs/phase-10/assessment-domain-map.md §6 (Deadline Event).';

COMMENT ON COLUMN deadline_events.deadline_id IS
    'FK to assessment_deadlines.id. Each event belongs to exactly one deadline.';

COMMENT ON COLUMN deadline_events.event_type IS
    'Type of deadline state transition: opened, closed, late, extended, '
    'submitted, missed, or expired. Backend-set; no client write path.';

COMMENT ON COLUMN deadline_events.occurred_at IS
    'UTC timestamp of the transition, set by the backend. '
    'Never accepted from a client payload.';

COMMENT ON COLUMN deadline_events.metadata IS
    'Safe, non-sensitive JSONB context for the event '
    '(e.g. actor_id, reason, student_id, attempt_id). '
    'Must never contain secrets, credentials, correct answers, '
    'score thresholds, grading policy, or raw personal data beyond UUIDs.';

-- ============================================================
-- Indexes
-- ============================================================

-- Primary backend lookup: all events for a given deadline (chronological)
CREATE INDEX deadline_events_deadline_id_idx
    ON deadline_events (deadline_id, occurred_at);

-- Backend query: find all events of a specific type across deadlines
CREATE INDEX deadline_events_event_type_idx
    ON deadline_events (event_type);

-- Backend query: recent events within a time range (scheduled jobs / dashboards)
CREATE INDEX deadline_events_occurred_at_idx
    ON deadline_events (occurred_at);
