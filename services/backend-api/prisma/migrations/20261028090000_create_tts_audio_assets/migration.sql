-- Persistent, shareable TTS audio (placement listening questions first).
--
-- Until now generated audio lived only in backend memory, so every restart -- and every extra
-- backend instance -- paid the full TTS cost again. This migration adds the metadata table that
-- tracks audio files kept in a PRIVATE Supabase Storage bucket, plus the bucket itself.
--
-- Design rules:
--   - The audio bytes live in Storage, never in PostgreSQL. This table only records where and what.
--   - An asset is identified by (content_hash, language, voice_config_hash):
--       content_hash       sha-256 of the normalized source script
--       voice_config_hash  sha-256 of everything else that changes the generated sound
--                          (provider model, voice, output format, chunking/pipeline version)
--     Editing a script, switching language, or changing voice therefore yields a NEW asset; an old
--     file is never served for a changed input.
--   - A row is only servable when status = 'ready'. 'generating' rows double as a cross-instance
--     lease (lease_owner / lease_expires_at) so concurrent requests do not each call the TTS
--     provider; an expired lease can be taken over. 'failed' rows hold no storage_path.
--   - A ready row is a claim, not proof: callers must still confirm the Storage object exists.
--   - storage_path is deterministic and contains no student data.
--
-- Backend authority: the table is backend-owned and never client-writable (RLS on, no policies),
-- same posture as every other backend-owned table.

CREATE TABLE IF NOT EXISTS tts_audio_assets (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informational: the question that first requested this asset. Identical scripts across
  -- questions share one asset, so this is NOT part of the identity.
  question_id         UUID          NULL REFERENCES placement_questions(id) ON DELETE SET NULL,

  language            TEXT          NOT NULL,
  content_hash        TEXT          NOT NULL,
  voice_config_hash   TEXT          NOT NULL,

  status              TEXT          NOT NULL DEFAULT 'generating',
  storage_path        TEXT          NULL,
  mime_type           TEXT          NULL,
  size_bytes          BIGINT        NULL,
  duration_ms         INTEGER       NULL,

  -- Cross-instance generation lease.
  lease_owner         TEXT          NULL,
  lease_expires_at    TIMESTAMPTZ   NULL,
  attempt_count       INTEGER       NOT NULL DEFAULT 0,
  -- Error CATEGORY only (never provider bodies, keys or script text).
  last_error          TEXT          NULL,

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT tts_audio_assets_identity_unique UNIQUE (content_hash, language, voice_config_hash),
  CONSTRAINT tts_audio_assets_status_check CHECK (status IN ('generating', 'ready', 'failed')),
  CONSTRAINT tts_audio_assets_ready_has_file CHECK (
    status <> 'ready' OR (storage_path IS NOT NULL AND mime_type IS NOT NULL AND size_bytes > 0)
  ),
  CONSTRAINT tts_audio_assets_storage_path_unique UNIQUE (storage_path)
);

CREATE INDEX IF NOT EXISTS idx_tts_audio_assets_question_id ON tts_audio_assets (question_id);
-- Lets the lease takeover / stuck-job queries find expired leases cheaply.
CREATE INDEX IF NOT EXISTS idx_tts_audio_assets_generating_lease
  ON tts_audio_assets (lease_expires_at) WHERE status = 'generating';

COMMENT ON TABLE tts_audio_assets IS
  'Metadata for generated TTS audio kept in the private Supabase Storage bucket. Identity = (content_hash, language, voice_config_hash). Rows are servable only when status = ready AND the Storage object exists. Never client-writable.';

ALTER TABLE tts_audio_assets ENABLE ROW LEVEL SECURITY;

-- Private Storage bucket. Created only where Supabase Storage exists (plain Postgres in local/CI has
-- no storage schema). No storage.objects policies are added on purpose: with RLS on and no policy,
-- anon/authenticated roles cannot read or write; the backend uses the service-role key.
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('tts-audio', 'tts-audio', false, 10485760, ARRAY['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/ogg', 'audio/mp4'])
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$$;
