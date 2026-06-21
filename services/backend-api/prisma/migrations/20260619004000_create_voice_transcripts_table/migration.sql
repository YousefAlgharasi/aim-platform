-- P9-021: Create Voice Transcripts Table
-- Branch: phase9/P9-021-voice-transcripts-migration
-- Dependency: P9-019 (Create Voice Messages Table — Done)
-- Scope: Stores the detailed STT transcript record for each voice turn,
--        separate from the summary transcript column on voice_messages.
--        Each row holds the full structured output from the STT Gateway
--        (per docs/phase-9/stt-output-contract.md): the mapped,
--        already safety-filtered transcript text, plus metadata such as
--        detected language, confidence, and word-level segments if
--        available. Designed for observability, quality review, and
--        future STT provider switching — not for mastery/AIM decisions.
--        All rows are backend-written; Flutter never writes directly.
--
-- Authority boundary rules enforced at this migration layer:
--   - message_id is a backend-resolved FK to voice_messages(id); never
--     accepted from the client without session/message ownership
--     validation.
--   - session_id is denormalised from the owning voice_message for fast
--     per-session queries; backend-resolved, never client-supplied.
--   - transcript_text stores the STT Gateway's mapped, already
--     safety-filtered text only; never raw provider response bodies,
--     confidence score arrays, or internal prompt content.
--   - language_code is the STT Gateway's detected/confirmed language tag
--     (e.g. ar, en); it is an observability field only and carries no
--     mastery, level, weakness, difficulty, recommendation, or
--     review-schedule semantics.
--   - confidence is a 0–1 float from the STT provider; advisory quality
--     signal only, never a mastery or difficulty decision.
--   - segments is a JSONB column for optional word/phrase-level timing
--     data returned by the STT provider and mapped by the STT Gateway;
--     stored only after safety filtering and provider-response mapping.
--     Never contains raw provider response payloads, API keys, or
--     internal AIM Engine fields.
--   - provider_ref is an opaque reference to the STT provider call that
--     produced this transcript; links to voice_provider_logs(id) for
--     observability — never a provider API key or credential.
--   - No STT/TTS/AI provider keys, Supabase service-role keys, or
--     secrets are stored here.
--
-- Scope guard:
--   - No voice message content/lifecycle storage (separate P9-019).
--   - No voice audio asset storage (separate P9-020).
--   - No voice provider call metadata storage (separate P9-022).
--   - No voice safety event storage (separate P9-023).
--   - No voice feedback storage (separate P9-024).
--   - No payment, parent dashboard, admin dashboard, or Student Web App
--     tables.
--   - No client authority introduced.

-- ============================================================
-- Table: voice_transcripts
-- ============================================================

CREATE TABLE voice_transcripts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID        NOT NULL
                                REFERENCES voice_messages (id)
                                ON DELETE CASCADE,
    session_id      UUID        NOT NULL
                                REFERENCES voice_sessions (id)
                                ON DELETE CASCADE,

    transcript_text TEXT        NOT NULL,
    language_code   TEXT,
    confidence      NUMERIC(4,3),
    segments        JSONB,
    provider_ref    UUID,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One transcript row per voice message turn
    CONSTRAINT voice_transcripts_message_id_unique
        UNIQUE (message_id),

    CONSTRAINT voice_transcripts_confidence_range_check
        CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

COMMENT ON TABLE voice_transcripts IS
    'Backend-written detailed STT transcript records for AI Teacher Voice Mode turns. Each row holds the full structured STT Gateway output (mapped, safety-filtered) for one voice turn. Observability/quality data only; never feeds into AIM Engine mastery, level, weakness, difficulty, recommendation, or review-schedule decisions. Flutter never writes directly to this table.';

COMMENT ON COLUMN voice_transcripts.id IS
    'Primary key. Backend-issued UUID for this transcript record.';

COMMENT ON COLUMN voice_transcripts.message_id IS
    'FK to voice_messages(id). Links this transcript to its voice turn. Backend-resolved after session/message ownership validation. Cascades on message deletion. Enforced unique: one transcript row per turn.';

COMMENT ON COLUMN voice_transcripts.session_id IS
    'FK to voice_sessions(id). Denormalised from the referenced voice_message for efficient per-session queries. Backend-resolved; never accepted from a client-supplied field. Cascades on session deletion.';

COMMENT ON COLUMN voice_transcripts.transcript_text IS
    'Full mapped, safety-filtered transcript text from the STT Gateway, per docs/phase-9/stt-output-contract.md. Never contains raw provider response bodies, confidence arrays, or internal prompt content.';

COMMENT ON COLUMN voice_transcripts.language_code IS
    'BCP-47 language tag detected or confirmed by the STT Gateway (e.g. ar, en-US). Observability field only; carries no mastery, level, weakness, difficulty, recommendation, or review-schedule semantics.';

COMMENT ON COLUMN voice_transcripts.confidence IS
    'Overall STT confidence score in range [0, 1], as reported by the provider and mapped by the STT Gateway. Advisory quality signal only; never used as a mastery, level, or difficulty decision.';

COMMENT ON COLUMN voice_transcripts.segments IS
    'Optional JSONB array of word- or phrase-level timing segments returned by the STT provider and mapped/filtered by the STT Gateway. NULL if the provider did not return segment data or the gateway did not map it. Never contains raw provider response payloads, API keys, or AIM Engine internals.';

COMMENT ON COLUMN voice_transcripts.provider_ref IS
    'Opaque UUID reference to the voice_provider_logs(id) row for the STT call that produced this transcript. Backend-resolved for observability linkage only; never a provider API key or credential.';

COMMENT ON COLUMN voice_transcripts.created_at IS
    'ISO-8601 UTC timestamp when the backend recorded this transcript.';

-- ============================================================
-- Indexes
-- ============================================================

-- Most common query: all transcripts for a session ordered by recency
CREATE INDEX voice_transcripts_session_id_created_at_idx
    ON voice_transcripts (session_id, created_at ASC);

-- Filter/join by language code for quality review and analytics
CREATE INDEX voice_transcripts_language_code_idx
    ON voice_transcripts (language_code)
    WHERE language_code IS NOT NULL;

-- Link to provider logs for observability
CREATE INDEX voice_transcripts_provider_ref_idx
    ON voice_transcripts (provider_ref)
    WHERE provider_ref IS NOT NULL;
