-- P9-020: Create Voice Audio Assets Table
-- Branch: phase9/P9-020-voice-audio-assets-migration
-- Dependency: P9-019 (Create Voice Messages Table — Done)
-- Scope: Persists metadata for backend-managed voice audio (TTS-synthesized
--        reply audio) per voice_messages row, per
--        docs/phase-9/voice-privacy-policy.md's Voice Storage Rules: raw
--        audio bytes live only in backend-managed storage (object storage),
--        access-controlled per student; this table stores the metadata
--        record that lets the backend resolve a turn's opaque `audioRef`
--        (this row's id) to the right storage location, owner, and basic
--        playback metadata. Flutter only ever receives the opaque
--        `audioRef`; it never receives or supplies a storage key/path
--        directly (docs/phase-9/voice-session-contract.md).
--
-- Authority boundary rules enforced at this migration layer:
--   - message_id is a backend-resolved FK to voice_messages(id); never
--     accepted from the client without ownership validation.
--   - student_id is denormalized from the owning message/session for fast
--     per-student ownership checks on audio retrieval
--     (docs/phase-9/voice-api-map.md endpoint 3 — audio stream endpoint).
--   - storage_key is an internal backend-managed storage reference (e.g. an
--     object storage key); it is never returned to the client as-is — only
--     this row's id (the opaque audioRef) crosses the API boundary.
--   - No raw audio bytes are stored in this table; only metadata about
--     audio that lives in backend-managed storage.
--   - No mastery, level, weakness, difficulty, recommendation, or
--     review-schedule columns exist in this table; those remain AIM Engine
--     authority.
--   - No STT/TTS/AI provider keys, Supabase service-role keys, or secrets
--     are stored here.
--
-- Scope guard:
--   - No transcript-only storage (separate P9-021 migration).
--   - No provider log storage (separate P9-022 migration).
--   - No safety event storage (separate P9-023 migration).
--   - No feedback storage (separate P9-024 migration).
--   - No payment, parent dashboard, admin dashboard, or Student Web App
--     tables.
--   - No client authority introduced.

-- ============================================================
-- Table: voice_audio_assets
-- ============================================================

CREATE TABLE voice_audio_assets (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID        NOT NULL
                                REFERENCES voice_messages (id)
                                ON DELETE CASCADE,
    student_id      UUID        NOT NULL,

    storage_key     TEXT        NOT NULL,
    content_type    TEXT        NOT NULL,
    duration_ms     INTEGER,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT voice_audio_assets_storage_key_not_empty_check
        CHECK (char_length(trim(storage_key)) > 0),

    CONSTRAINT voice_audio_assets_content_type_not_empty_check
        CHECK (char_length(trim(content_type)) > 0),

    CONSTRAINT voice_audio_assets_duration_ms_non_negative_check
        CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

COMMENT ON TABLE voice_audio_assets IS
    'Backend-written metadata for voice turn reply audio that lives in backend-managed storage (docs/phase-9/voice-privacy-policy.md Voice Storage Rules). One row per synthesized audio asset for a voice_messages turn. This row''s id is the opaque audioRef returned to the client; raw audio bytes are never stored in this table.';

COMMENT ON COLUMN voice_audio_assets.id IS
    'Primary key. Backend-issued UUID; this is the opaque audioRef value returned to the client and resolved via the audio stream endpoint.';

COMMENT ON COLUMN voice_audio_assets.message_id IS
    'FK to voice_messages(id). Backend-resolved after turn ownership validation. Cascades on message deletion.';

COMMENT ON COLUMN voice_audio_assets.student_id IS
    'Denormalized student FK for fast ownership checks on audio retrieval (only the owning student may resolve this audioRef). Backend-resolved from the owning message/session; never taken from client payload.';

COMMENT ON COLUMN voice_audio_assets.storage_key IS
    'Internal backend-managed storage reference (e.g. object storage key) for the raw audio bytes. Never returned to the client; only this row''s id (the audioRef) crosses the API boundary.';

COMMENT ON COLUMN voice_audio_assets.content_type IS
    'MIME type of the stored audio (e.g. audio/mpeg). Used for serving the correct Content-Type on the audio stream endpoint.';

COMMENT ON COLUMN voice_audio_assets.duration_ms IS
    'Duration of the audio in milliseconds, if known. Playback metadata only; not a learning-decision value.';

COMMENT ON COLUMN voice_audio_assets.created_at IS
    'ISO-8601 UTC timestamp when the backend persisted this audio asset row.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE UNIQUE INDEX voice_audio_assets_message_id_key
    ON voice_audio_assets (message_id);

CREATE INDEX voice_audio_assets_student_id_created_at_idx
    ON voice_audio_assets (student_id, created_at DESC);
