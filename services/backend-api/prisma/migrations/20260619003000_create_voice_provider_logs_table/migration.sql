-- P9-022: Create Voice Provider Logs Table
-- Branch: phase9/P9-022-voice-provider-logs-migration
-- Dependency: P9-019 (Create Voice Messages Table — Done)
-- Scope: Stores STT Gateway and TTS Gateway call metadata (Group E/D) per
--        voice turn, for observability (latency, status, error category),
--        without ever storing provider secrets, raw audio, raw transcripts,
--        or raw provider responses. Mirrors the Phase 8 ai_provider_logs
--        migration (P8-021), extended with a provider_type column since
--        voice mode has two distinct provider call kinds (STT and TTS) per
--        turn, where AI Teacher's own provider calls remain logged in the
--        existing Phase 8 ai_provider_logs table.
--
-- Authority boundary rules enforced at this migration layer:
--   - message_id is a backend-resolved FK to voice_messages(id); never
--     accepted from the client.
--   - No mastery, level, weakness, difficulty, recommendation, or
--     review-schedule columns exist in this table; those remain AIM
--     Engine authority.
--   - No STT/TTS provider API keys, Supabase service-role keys, database
--     credentials, or other secrets are stored here, per
--     docs/phase-9/voice-privacy-policy.md and
--     docs/phase-9/voice-error-policy.md.
--   - No raw audio bytes, raw transcript text, or full raw provider
--     response is stored here; only non-sensitive operational metadata.
--
-- Scope guard:
--   - No voice message/turn content (separate P9-019 migration).
--   - No voice audio asset storage (separate P9-020 migration).
--   - No voice transcript-only storage (separate P9-021 migration).
--   - No voice safety event storage (separate P9-023 migration).
--   - No voice feedback storage (separate P9-024 migration).
--   - No payment, parent dashboard, admin dashboard, or Student Web App
--     tables.
--   - No client authority introduced.

-- ============================================================
-- Table: voice_provider_logs
-- ============================================================

CREATE TABLE voice_provider_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID        NOT NULL
                                REFERENCES voice_messages (id)
                                ON DELETE CASCADE,

    provider_type   TEXT        NOT NULL,
    provider        TEXT        NOT NULL,
    model           TEXT        NOT NULL,

    status          TEXT        NOT NULL,
    error_category  TEXT,

    latency_ms      INTEGER,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT voice_provider_logs_provider_type_check
        CHECK (provider_type IN ('stt', 'tts')),

    CONSTRAINT voice_provider_logs_status_check
        CHECK (status IN ('success', 'error', 'timeout')),

    CONSTRAINT voice_provider_logs_latency_ms_non_negative_check
        CHECK (latency_ms IS NULL OR latency_ms >= 0),

    CONSTRAINT voice_provider_logs_error_category_requires_non_success_check
        CHECK (error_category IS NULL OR status <> 'success')
);

COMMENT ON TABLE voice_provider_logs IS
    'Backend-owned observability log for STT Gateway and TTS Gateway calls made during a voice turn. Stores only non-sensitive operational metadata for a single provider call; never raw audio, raw transcript text, the raw provider response, or any provider credential.';

COMMENT ON COLUMN voice_provider_logs.id IS
    'Primary key. Backend-issued UUID for this log entry.';

COMMENT ON COLUMN voice_provider_logs.message_id IS
    'FK to voice_messages(id). Identifies which voice turn this provider call was made for. Cascades on message deletion.';

COMMENT ON COLUMN voice_provider_logs.provider_type IS
    'Which voice gateway made this call. One of: stt (Speech-to-Text Gateway), tts (Text-to-Speech Gateway).';

COMMENT ON COLUMN voice_provider_logs.provider IS
    'Name of the configured STT/TTS provider used for this call (e.g. the provider identifier from backend config). Never a credential or secret value.';

COMMENT ON COLUMN voice_provider_logs.model IS
    'Model identifier used for this call, read from backend config (e.g. STT_PROVIDER_MODEL / TTS_PROVIDER_MODEL). Never a credential or secret value.';

COMMENT ON COLUMN voice_provider_logs.status IS
    'Outcome of the provider call. One of: success, error, timeout.';

COMMENT ON COLUMN voice_provider_logs.error_category IS
    'Non-internal error category for a failed call (e.g. STT_LOW_CONFIDENCE, STT_PROVIDER_CALL_FAILED), per docs/phase-9/voice-error-policy.md. Null when status is success. Never a stack trace, raw error body, or secret.';

COMMENT ON COLUMN voice_provider_logs.latency_ms IS
    'Observed latency of the provider call in milliseconds, for observability only.';

COMMENT ON COLUMN voice_provider_logs.created_at IS
    'ISO-8601 UTC timestamp when this log entry was recorded by the backend.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX voice_provider_logs_message_id_idx
    ON voice_provider_logs (message_id);

CREATE INDEX voice_provider_logs_provider_type_idx
    ON voice_provider_logs (provider_type);

CREATE INDEX voice_provider_logs_status_idx
    ON voice_provider_logs (status);

CREATE INDEX voice_provider_logs_message_id_created_at_idx
    ON voice_provider_logs (message_id, created_at DESC);
