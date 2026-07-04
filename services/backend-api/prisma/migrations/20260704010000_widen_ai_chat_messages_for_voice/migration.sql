-- P21-006: Widen ai_chat_messages to carry unified text+voice conversation
-- turns. Scope: ai_chat_messages only. Does not touch or drop
-- voice_sessions/voice_messages/voice_transcripts — those remain as
-- historical/read-only tables (see P21-021 for their long-term fate).

ALTER TABLE ai_chat_messages
  ADD COLUMN channel          TEXT    NOT NULL DEFAULT 'text',
  ADD COLUMN audio_ref        TEXT    NULL,
  ADD COLUMN audio_duration_ms INTEGER NULL,
  ADD COLUMN is_greeting      BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE ai_chat_messages
  ADD CONSTRAINT ai_chat_messages_channel_check
    CHECK (channel IN ('text', 'voice'));

COMMENT ON COLUMN ai_chat_messages.channel IS
  'Origin channel of this turn: ''text'' (typed in AI Teacher chat) or ''voice'' (spoken in Voice Teacher). A non-null audio_ref is the actual signal that voice playback is available for a turn, regardless of its origin channel.';

COMMENT ON COLUMN ai_chat_messages.audio_ref IS
  'Reference to the synthesized TTS audio asset for this message, if any. Null when audio has not been synthesized (e.g. a text turn the student never asked to hear, or a greeting whose TTS call failed).';

COMMENT ON COLUMN ai_chat_messages.audio_duration_ms IS
  'Duration of the audio at audio_ref, in milliseconds. Null when audio_ref is null.';

COMMENT ON COLUMN ai_chat_messages.is_greeting IS
  'True for the single auto-generated opening assistant message created the moment a new ai_chat_sessions row is created (P21-008). False for every other message.';
