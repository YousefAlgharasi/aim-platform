-- P8-021: Create AI Provider Logs Migration
-- Branch: phase8/P8-021-ai-teacher-provider-logs-migration
-- Dependency: P8-019 (Create AI Chat Messages Table)
-- Scope: Stores AI provider call metadata (Group F — AI Provider Gateway)
--        for observability (latency, status, error category), without ever
--        storing provider secrets, raw prompts, or raw provider responses.
--
-- Authority boundary rules enforced at this migration layer:
--   - No mastery, level, weakness, difficulty, recommendation, or
--     review-schedule columns exist in this table; those remain AIM
--     Engine authority.
--   - No AI provider API keys, Supabase service-role keys, database
--     credentials, or other secrets are stored here, per
--     docs/phase-8/privacy-policy.md and
--     docs/phase-8/ai-teacher-error-policy.md.
--   - No full prompt text or full raw provider response is stored here;
--     only non-sensitive operational metadata.
--
-- Scope guard:
--   - No AI Teacher message content (separate P8-019 migration).
--   - No context snapshot content (separate P8-020 migration).
--   - No payment tables.
--   - No parent dashboard tables.
--   - No admin dashboard tables.
--   - No Student Web App tables.
--   - No client authority introduced.

-- ============================================================
-- Table: ai_provider_logs
-- ============================================================

CREATE TABLE ai_provider_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL
                                REFERENCES ai_chat_sessions (id)
                                ON DELETE CASCADE,

    provider        TEXT        NOT NULL,
    model           TEXT        NOT NULL,

    status          TEXT        NOT NULL,
    error_category  TEXT,

    latency_ms      INTEGER,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ai_provider_logs_status_check
        CHECK (status IN ('success', 'error', 'timeout')),

    CONSTRAINT ai_provider_logs_latency_ms_non_negative_check
        CHECK (latency_ms IS NULL OR latency_ms >= 0),

    CONSTRAINT ai_provider_logs_error_category_requires_non_success_check
        CHECK (error_category IS NULL OR status <> 'success')
);

COMMENT ON TABLE ai_provider_logs IS
    'Backend-owned observability log for AI Provider Gateway (Group F) calls. Stores only non-sensitive operational metadata for a single provider call; never the prompt text, the raw provider response, or any provider credential.';

COMMENT ON COLUMN ai_provider_logs.id IS
    'Primary key. Backend-issued UUID for this log entry.';

COMMENT ON COLUMN ai_provider_logs.session_id IS
    'FK to ai_chat_sessions(id). Identifies which AI Teacher session this provider call was made for. Cascades on session deletion.';

COMMENT ON COLUMN ai_provider_logs.provider IS
    'Name of the configured AI provider used for this call (e.g. the provider identifier from backend config). Never a credential or secret value.';

COMMENT ON COLUMN ai_provider_logs.model IS
    'Model identifier used for this call, read from backend config (e.g. AI_PROVIDER_MODEL). Never a credential or secret value.';

COMMENT ON COLUMN ai_provider_logs.status IS
    'Outcome of the provider call. One of: success, error, timeout.';

COMMENT ON COLUMN ai_provider_logs.error_category IS
    'Non-internal error category for a failed call (e.g. provider_timeout, provider_error, malformed_response), per docs/phase-8/ai-teacher-error-policy.md. Null when status is success. Never a stack trace, raw error body, or secret.';

COMMENT ON COLUMN ai_provider_logs.latency_ms IS
    'Observed latency of the provider call in milliseconds, for observability only.';

COMMENT ON COLUMN ai_provider_logs.created_at IS
    'ISO-8601 UTC timestamp when this log entry was recorded by the backend.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX ai_provider_logs_session_id_idx
    ON ai_provider_logs (session_id);

CREATE INDEX ai_provider_logs_status_idx
    ON ai_provider_logs (status);

CREATE INDEX ai_provider_logs_session_id_created_at_idx
    ON ai_provider_logs (session_id, created_at DESC);
