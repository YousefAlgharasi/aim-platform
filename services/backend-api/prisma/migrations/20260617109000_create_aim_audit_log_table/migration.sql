-- P5-041: Create AIM Audit Log Migration
-- Branch: phase5/P5-041-aim-audit-log-migration
-- Dependency: P5-008 (AIM Integration Error Handling Policy)
-- Scope: Backend-controlled, append-only metadata log for every AIM Engine
-- integration step (request, response, validation, persistence, failure).
--
-- Backend authority rules (enforced at this migration layer):
--   - Append-only. Application code must not UPDATE or DELETE rows.
--   - Metadata only by default per docs/phase-5/aim-error-handling-policy.md:
--     no request body, no response body, no service tokens, no AI provider
--     keys, no database credentials. The payload column exists only for the
--     rare, explicitly-documented exception case and is never populated with
--     secrets or full sensitive payloads.
--   - This table is written only by the backend AIM adapter and pipeline
--     (features/aim). The AIM Engine never writes here directly. Clients
--     never write here.
--   - outcome and integration_error_code map to the failure taxonomy and
--     error code catalog defined by P5-008 and P5-018.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: aim_audit_log
-- ============================================================

CREATE TABLE aim_audit_log (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    request_id              UUID            NOT NULL,
    backend_request_id      UUID            NOT NULL,

    endpoint                TEXT            NOT NULL,
    pipeline_stage          TEXT            NOT NULL,
    outcome                 TEXT            NOT NULL,
    integration_error_code  TEXT            NULL,

    student_id              UUID            NULL,
    session_id              UUID            NULL,
    attempt_id              UUID            NULL,

    attempt_number          SMALLINT        NULL,
    duration_ms             INTEGER         NULL,

    metadata                JSONB           NOT NULL DEFAULT '{}'::jsonb,

    occurred_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT aim_audit_log_pipeline_stage_check
        CHECK (pipeline_stage IN (
            'client_entry',
            'pipeline_trigger',
            'state_assembly',
            'aim_engine_call',
            'response_validation',
            'persistence',
            'result_emission',
            'fallback',
            'audit_close_out'
        )),

    CONSTRAINT aim_audit_log_outcome_check
        CHECK (outcome IN (
            'success',
            'transient',
            'non_retryable',
            'validation_failed',
            'contract_violation',
            'breaker_open',
            'persistence_failed',
            'authorization_denied'
        )),

    CONSTRAINT aim_audit_log_attempt_number_positive_check
        CHECK (attempt_number IS NULL OR attempt_number >= 1),

    CONSTRAINT aim_audit_log_duration_nonneg_check
        CHECK (duration_ms IS NULL OR duration_ms >= 0),

    CONSTRAINT aim_audit_log_metadata_is_object_check
        CHECK (jsonb_typeof(metadata) = 'object')
);

COMMENT ON TABLE aim_audit_log IS
    'Append-only metadata log for every AIM Engine integration step (request, response, validation, persistence, failure) per docs/phase-5/aim-error-handling-policy.md. Application code must not UPDATE or DELETE rows. Written only by the backend features/aim module; the AIM Engine and clients never write here.';

COMMENT ON COLUMN aim_audit_log.request_id IS
    'Backend-issued correlation id (X-Request-Id) for this AIM Engine call.';

COMMENT ON COLUMN aim_audit_log.backend_request_id IS
    'Backend-issued idempotency key (backendRequestId) carried through the AIM request/response envelope.';

COMMENT ON COLUMN aim_audit_log.endpoint IS
    'AIM Engine endpoint involved, e.g. /aim/v1/analysis or /health, per docs/phase-5/aim-engine-api-map.md.';

COMMENT ON COLUMN aim_audit_log.pipeline_stage IS
    'Backend pipeline stage this entry records, per the nine stages in docs/phase-5/backend-aim-pipeline-map.md.';

COMMENT ON COLUMN aim_audit_log.outcome IS
    'Outcome category for this entry, per the failure taxonomy in docs/phase-5/aim-error-handling-policy.md.';

COMMENT ON COLUMN aim_audit_log.integration_error_code IS
    'Stable integration error code from the P5-018 catalog. Null on success outcomes.';

COMMENT ON COLUMN aim_audit_log.student_id IS
    'Backend-resolved student id for this call, when applicable. No FK by design, consistent with other AIM-output tables.';

COMMENT ON COLUMN aim_audit_log.session_id IS
    'Session id this call relates to, when applicable.';

COMMENT ON COLUMN aim_audit_log.attempt_id IS
    'Attempt id this call relates to, when applicable.';

COMMENT ON COLUMN aim_audit_log.attempt_number IS
    'Retry attempt number for this call (1 = first attempt), when applicable.';

COMMENT ON COLUMN aim_audit_log.duration_ms IS
    'Elapsed time in milliseconds for this pipeline stage, when applicable.';

COMMENT ON COLUMN aim_audit_log.metadata IS
    'Additional safe metadata as a JSON object. Never contains request/response bodies, service tokens, AI provider keys, or database credentials. Any sensitive field stored here requires explicit justification documented at the log call site per docs/phase-5/aim-error-handling-policy.md.';

COMMENT ON COLUMN aim_audit_log.occurred_at IS
    'When this audit entry was recorded.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX aim_audit_log_backend_request_id_idx
    ON aim_audit_log (backend_request_id);

CREATE INDEX aim_audit_log_student_id_idx
    ON aim_audit_log (student_id);

CREATE INDEX aim_audit_log_session_id_idx
    ON aim_audit_log (session_id);

CREATE INDEX aim_audit_log_outcome_idx
    ON aim_audit_log (outcome);

CREATE INDEX aim_audit_log_occurred_at_idx
    ON aim_audit_log (occurred_at);

CREATE INDEX aim_audit_log_pipeline_stage_idx
    ON aim_audit_log (pipeline_stage);
