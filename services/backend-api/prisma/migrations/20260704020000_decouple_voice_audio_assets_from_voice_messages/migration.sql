-- P21-021b: Decouple voice_audio_assets from the legacy voice_messages
-- table. As of P21-007/P21-010, new voice conversations create their
-- session/turn rows in ai_chat_sessions/ai_chat_messages, not
-- voice_sessions/voice_messages. voice_audio_assets.message_id still had a
-- hard NOT NULL FK to voice_messages, so AudioUploadService had to keep
-- inserting a placeholder voice_messages row on every new voice submission
-- just to satisfy that FK -- the last live write path into a table Phase 21
-- otherwise intended to be historical-only.
--
-- This migration adds a second, nullable FK to ai_chat_messages so new
-- voice_audio_assets rows can anchor there instead, and makes message_id
-- nullable so historical rows (still pointing at voice_messages) are
-- undisturbed. Exactly one of the two must be set per row -- enforced by
-- a check constraint, not left to application code alone.
--
-- No backfill of existing rows: every existing voice_audio_assets row keeps
-- its original message_id (voice_messages) reference; only new rows
-- (written by the updated AudioUploadService) will use ai_chat_message_id.

ALTER TABLE voice_audio_assets
  ALTER COLUMN message_id DROP NOT NULL;

ALTER TABLE voice_audio_assets
  ADD COLUMN ai_chat_message_id UUID NULL REFERENCES ai_chat_messages(id) ON DELETE CASCADE;

ALTER TABLE voice_audio_assets
  ADD CONSTRAINT voice_audio_assets_exactly_one_message_ref_check
    CHECK (
      (message_id IS NOT NULL AND ai_chat_message_id IS NULL)
      OR
      (message_id IS NULL AND ai_chat_message_id IS NOT NULL)
    );

COMMENT ON COLUMN voice_audio_assets.message_id IS
  'Legacy FK to voice_messages(id). Null on every row created after P21-021b -- kept only for historical rows written before this migration. Exactly one of message_id/ai_chat_message_id is set per row (see voice_audio_assets_exactly_one_message_ref_check).';

COMMENT ON COLUMN voice_audio_assets.ai_chat_message_id IS
  'FK to ai_chat_messages(id) -- the placeholder student-turn row AudioUploadService creates for a new voice submission (P21-021b). Exactly one of message_id/ai_chat_message_id is set per row.';

CREATE UNIQUE INDEX voice_audio_assets_ai_chat_message_id_key ON voice_audio_assets (ai_chat_message_id);
