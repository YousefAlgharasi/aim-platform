-- P9-019: Create Voice Messages Table
-- Branch: phase9/P9-019-voice-messages-migration
-- Dependency: P9-018 (Create Voice Sessions Table — Done)
-- Scope: Persists AI Teacher Voice Mode turns (one row per student
--        utterance / AI Teacher reply pair) per session, matching the Turn
--        Contract shape fixed in docs/phase-9/voice-session-contract.md.
--        Each row progresses through the lifecycle described in
--        docs/phase-9/voice-request-lifecycle.md and tracked by
--        VoiceTurnStatus (services/backend-api/src/features/voice-teacher/
--        voice-teacher.constants.ts): pending -> transcribed -> replied ->
--        synthesized, or failed at any step. All rows are backend-written;
--        Flutter never writes directly to this table. Mirrors the Phase 8
--        ai_chat_messages migration (P8-019), adapted for voice mode.
--
-- Authority boundary rules enforced at this migration layer:
--   - session_id is a backend-resolved FK to voice_sessions(id); never
--     accepted from the client without session ownership validation.
--   - student_id is denormalized from the owning session for fast
--     per-student queries; the backend always resolves it from the
--     authenticated JWT, never from a client-supplied field.
--   - transcript stores the STT Gateway's mapped, already safety-filtered
--     transcript text only (per docs/phase-9/stt-output-contract.md); reply
--     stores the AI Teacher's already output-safety-filtered text only.
--     Neither column stores provider raw responses, internal prompt
--     content, or AIM Engine raw fields.
--   - audio_ref is an opaque reference only; never a raw file path,
--     provider audio URL, or filesystem location
--     (docs/phase-9/voice-privacy-policy.md).
--   - status is restricted to the VoiceTurnStatus enum values; it is a
--     lifecycle flag only, never a mastery, level, weakness, difficulty,
--     recommendation, or review-schedule decision.
--   - No STT/TTS/AI provider keys, Supabase service-role keys, or secrets
--     are stored here.
--
-- Scope guard:
--   - No voice audio asset byte/path storage (separate P9-020 migration).
--   - No voice transcript-only storage (separate P9-021 migration).
--   - No voice provider log storage (separate P9-022 migration).
--   - No voice safety event storage (separate P9-023 migration).
--   - No voice feedback storage (separate P9-024 migration).
--   - No payment, parent dashboard, admin dashboard, or Student Web App
--     tables.
--   - No client authority introduced.

-- ============================================================
-- Table: voice_messages
-- ============================================================

CREATE TABLE voice_messages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL
                                REFERENCES voice_sessions (id)
                                ON DELETE CASCADE,
    student_id      UUID        NOT NULL,

    transcript      TEXT,
    reply           TEXT,
    audio_ref       TEXT,

    status          TEXT        NOT NULL DEFAULT 'pending',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT voice_messages_status_check
        CHECK (status IN ('pending', 'transcribed', 'replied', 'synthesized', 'failed'))
);

COMMENT ON TABLE voice_messages IS
    'Backend-written AI Teacher Voice Mode turns per session, matching the Turn Contract in docs/phase-9/voice-session-contract.md. Each row is one voice turn (student utterance + AI Teacher reply). transcript/reply/audio_ref are populated progressively as the turn moves through its lifecycle and may be NULL until their producing step completes. Flutter never writes directly to this table.';

COMMENT ON COLUMN voice_messages.id IS
    'Primary key. Backend-issued UUID returned to the client as turnId.';

COMMENT ON COLUMN voice_messages.session_id IS
    'FK to voice_sessions(id). Backend-resolved after session ownership validation. Cascades on session deletion.';

COMMENT ON COLUMN voice_messages.student_id IS
    'Denormalized student FK for fast per-student queries. Backend-resolved from the owning session; never taken from client payload.';

COMMENT ON COLUMN voice_messages.transcript IS
    'STT Gateway output for this turn: the mapped, already safety-filtered transcript text. NULL until the transcription step completes. Never contains provider raw response data, confidence scores, or internal prompt content.';

COMMENT ON COLUMN voice_messages.reply IS
    'AI Teacher reply for this turn: already output-safety-filtered text. NULL until the AI Teacher reply step completes. Never contains provider raw response data or AIM Engine internals.';

COMMENT ON COLUMN voice_messages.audio_ref IS
    'Opaque reference to the synthesized reply audio, resolved via the audio stream endpoint. NULL until TTS synthesis completes or if the turn ends without audio. Never a raw file path, provider audio URL, or filesystem location.';

COMMENT ON COLUMN voice_messages.status IS
    'Turn lifecycle status, matching VoiceTurnStatus. One of: pending, transcribed, replied, synthesized, failed. A lifecycle flag only; carries no mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';

COMMENT ON COLUMN voice_messages.created_at IS
    'ISO-8601 UTC timestamp when the backend created this turn row.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX voice_messages_session_id_created_at_idx
    ON voice_messages (session_id, created_at ASC);

CREATE INDEX voice_messages_student_id_created_at_idx
    ON voice_messages (student_id, created_at DESC);

CREATE INDEX voice_messages_session_id_status_idx
    ON voice_messages (session_id, status);
