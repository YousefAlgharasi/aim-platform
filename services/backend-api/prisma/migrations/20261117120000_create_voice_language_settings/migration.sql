-- Admin-controlled languages for speech-to-text and text-to-speech. Single row (id = 1).
CREATE TABLE IF NOT EXISTS voice_language_settings (
  id                   INTEGER     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  allowed_languages    TEXT[]      NOT NULL DEFAULT ARRAY['ar','en'],
  stt_default_language TEXT        NOT NULL DEFAULT 'en',
  stt_mode             TEXT        NOT NULL DEFAULT 'auto' CHECK (stt_mode IN ('auto','fixed')),
  tts_default_language TEXT        NOT NULL DEFAULT 'en',
  tts_ar_model         TEXT        NULL,
  tts_ar_voice         TEXT        NULL,
  updated_by           TEXT        NULL,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT voice_lang_allowed_check CHECK (allowed_languages <@ ARRAY['ar','en'] AND cardinality(allowed_languages) > 0),
  CONSTRAINT voice_lang_stt_default_check CHECK (stt_default_language = ANY (allowed_languages)),
  CONSTRAINT voice_lang_tts_default_check CHECK (tts_default_language = ANY (allowed_languages))
);
INSERT INTO voice_language_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
