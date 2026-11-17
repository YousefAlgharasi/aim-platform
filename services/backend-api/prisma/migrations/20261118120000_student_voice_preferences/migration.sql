-- Students choose the AI Teacher's voice (Groq Orpheus voices: English + Arabic only).
-- NULL = use the platform default voice for that language.
CREATE TABLE IF NOT EXISTS student_voice_preferences (
  student_id  UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  en_voice    TEXT,
  ar_voice    TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One short sample per (language, voice) so a student can listen before choosing.
-- Generated once on first request and reused (the Groq Arabic quota is small).
CREATE TABLE IF NOT EXISTS voice_preview_audio (
  language     TEXT        NOT NULL CHECK (language IN ('en', 'ar')),
  voice        TEXT        NOT NULL,
  audio        BYTEA       NOT NULL,
  content_type TEXT        NOT NULL DEFAULT 'audio/wav',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (language, voice)
);
