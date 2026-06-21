-- P5-031: Create Session Events Migration
-- Branch: phase5/P5-031-session-events-migration
-- Dependency: P5-030 (Learning Sessions Migration)
-- Scope: Backend-owned raw event log used to derive AimSessionBehavioralContext
--        (P5-009) at AIM call time. The AIM Engine never receives this table
--        directly; the backend aggregates rows here into the behavioral_context
--        counters it sends.
--
-- Backend authority rules (enforced at this migration layer):
--   - Every row is backend-recorded from raw client signals; the backend never
--     trusts a pre-aggregated client summary in place of this log.
--   - learning_session_id and student_id are backend-resolved, never accepted
--     verbatim as foreign client identifiers without validation.
--   - event_type is restricted to the raw signal categories that feed
--     AimSessionBehavioralContext: item_presented, item_submitted, hesitation,
--     retry, idle_gap. None of these event types represent mastery, level,
--     weakness, difficulty, recommendation, review schedule, retention, or
--     frustration; they are raw behavioral signal inputs only.
--   - response_time_ms, when present, is stored as raw behavioral data and
--     must never be read by any layer as a mastery, level, or difficulty input.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: session_events
-- ============================================================

CREATE TABLE session_events (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_session_id     UUID            NOT NULL
                                            REFERENCES learning_sessions (id)
                                            ON DELETE CASCADE,
    student_id              UUID            NOT NULL,

    event_type              TEXT            NOT NULL,
    item_id                 UUID            NULL,

    response_time_ms        INTEGER         NULL,
    payload                 JSONB           NOT NULL DEFAULT '{}'::jsonb,

    occurred_at              TIMESTAMPTZ     NOT NULL,
    recorded_at               TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT session_events_event_type_check
        CHECK (event_type IN (
            'item_presented',
            'item_submitted',
            'hesitation',
            'retry',
            'idle_gap'
        )),

    CONSTRAINT session_events_response_time_non_negative_check
        CHECK (response_time_ms IS NULL OR response_time_ms >= 0),

    CONSTRAINT session_events_payload_is_object_check
        CHECK (jsonb_typeof(payload) = 'object'),

    CONSTRAINT session_events_occurred_at_not_after_recorded_at_check
        CHECK (occurred_at <= recorded_at)
);

COMMENT ON TABLE session_events IS
    'Backend-recorded raw behavioral event log per learning session. Aggregated by the backend into AimSessionBehavioralContext (P5-009) at AIM call time. Never sent to the AIM Engine row-by-row.';

COMMENT ON COLUMN session_events.id IS
    'Primary key. Backend-issued UUID.';

COMMENT ON COLUMN session_events.learning_session_id IS
    'Foreign key to learning_sessions. Cascades on session deletion.';

COMMENT ON COLUMN session_events.student_id IS
    'Backend-resolved student id, denormalized from the owning session for fast per-student queries. Never taken from client payload without session ownership validation.';

COMMENT ON COLUMN session_events.event_type IS
    'Raw behavioral signal category. One of item_presented, item_submitted, hesitation, retry, idle_gap. Never a mastery, level, weakness, difficulty, recommendation, review-schedule, retention, or frustration value.';

COMMENT ON COLUMN session_events.item_id IS
    'Optional reference to the lesson or practice item this event relates to. Null for session-level events such as idle_gap.';

COMMENT ON COLUMN session_events.response_time_ms IS
    'Raw timing signal in milliseconds, present for item_submitted events. Behavioral context only; must never feed mastery, level, or difficulty logic in any layer.';

COMMENT ON COLUMN session_events.payload IS
    'Backend-validated JSONB payload carrying event-specific raw detail (for example answer_change_count for a hesitation event). No secrets or credentials may be stored here.';

COMMENT ON COLUMN session_events.occurred_at IS
    'ISO-8601 UTC timestamp of when the underlying client action occurred, as reported by the client and accepted by the backend after validation.';

COMMENT ON COLUMN session_events.recorded_at IS
    'ISO-8601 UTC timestamp of when the backend persisted this event row. Always at or after occurred_at.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX session_events_learning_session_id_idx
    ON session_events (learning_session_id);

CREATE INDEX session_events_learning_session_id_occurred_at_idx
    ON session_events (learning_session_id, occurred_at);

CREATE INDEX session_events_student_id_occurred_at_idx
    ON session_events (student_id, occurred_at);

CREATE INDEX session_events_event_type_idx
    ON session_events (event_type);

CREATE INDEX session_events_item_id_idx
    ON session_events (item_id);
