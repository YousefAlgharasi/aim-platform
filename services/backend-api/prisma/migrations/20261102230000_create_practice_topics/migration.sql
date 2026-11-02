-- Practice Speaking + Write a Paragraph: admin-managed topics and the student's attempts.
--
--   practice_topics              one row per topic; kind = 'speaking' | 'writing'
--   practice_topic_translations  per-locale title/description (en + ar), same shape as
--                                course/lesson/chapter translations; readers fall back to 'en'
--   practice_attempts            one row per student try: a speaking session or a submitted paragraph
--
-- Design rules:
--   - ai_prompt is backend-only (the AI teacher's role for speaking, extra marking hints for
--     writing). It is never returned to students.
--   - XP is the only reward. practice_attempts.xp_awarded is added to the student's XP total by
--     the engagement queries; the AI score (0-100) is shown to the student but is NOT a mastery,
--     level or difficulty signal and is never read by the AIM Engine.
--   - Backend authority: RLS on, no policies (never client-writable), like every backend-owned table.

CREATE TABLE IF NOT EXISTS practice_topics (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  kind                TEXT         NOT NULL,
  level_code          TEXT         NULL,
  xp_reward           INTEGER      NOT NULL DEFAULT 20,
  -- Speaking: max talking time. Writing: max writing time. NULL = untimed.
  time_limit_seconds  INTEGER      NULL,
  -- Writing only: shortest paragraph accepted.
  min_words           INTEGER      NULL,
  ai_prompt           TEXT         NOT NULL DEFAULT '',
  sort_order          INTEGER      NOT NULL DEFAULT 0,
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT practice_topics_kind_check CHECK (kind IN ('speaking', 'writing')),
  CONSTRAINT practice_topics_xp_check CHECK (xp_reward BETWEEN 0 AND 1000),
  CONSTRAINT practice_topics_time_check CHECK (time_limit_seconds IS NULL OR time_limit_seconds BETWEEN 30 AND 7200),
  CONSTRAINT practice_topics_min_words_check CHECK (min_words IS NULL OR min_words BETWEEN 1 AND 1000)
);

CREATE INDEX IF NOT EXISTS idx_practice_topics_kind_active ON practice_topics (kind, is_active, sort_order);

CREATE TABLE IF NOT EXISTS practice_topic_translations (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id     UUID         NOT NULL REFERENCES practice_topics(id) ON DELETE CASCADE,
  locale       VARCHAR(10)  NOT NULL,
  title        TEXT         NOT NULL,
  description  TEXT         NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT practice_topic_translations_topic_locale_key UNIQUE (topic_id, locale),
  CONSTRAINT practice_topic_translations_locale_format_check
    CHECK (locale ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$')
);

CREATE TABLE IF NOT EXISTS practice_attempts (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id      UUID         NOT NULL REFERENCES practice_topics(id) ON DELETE CASCADE,
  kind          TEXT         NOT NULL,
  status        TEXT         NOT NULL DEFAULT 'started',
  -- Writing: the submitted paragraph, the 0-100 score and the AI's corrections (JSON).
  answer_text   TEXT         NULL,
  score         INTEGER      NULL,
  feedback      JSONB        NULL,
  xp_awarded    INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ  NULL,

  CONSTRAINT practice_attempts_kind_check CHECK (kind IN ('speaking', 'writing')),
  CONSTRAINT practice_attempts_status_check CHECK (status IN ('started', 'completed')),
  CONSTRAINT practice_attempts_score_check CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  CONSTRAINT practice_attempts_xp_check CHECK (xp_awarded >= 0)
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_student ON practice_attempts (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_student_topic ON practice_attempts (student_id, topic_id);

CREATE OR REPLACE FUNCTION set_practice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS practice_topics_set_updated_at ON practice_topics;
CREATE TRIGGER practice_topics_set_updated_at
BEFORE UPDATE ON practice_topics
FOR EACH ROW EXECUTE FUNCTION set_practice_updated_at();

DROP TRIGGER IF EXISTS practice_topic_translations_set_updated_at ON practice_topic_translations;
CREATE TRIGGER practice_topic_translations_set_updated_at
BEFORE UPDATE ON practice_topic_translations
FOR EACH ROW EXECUTE FUNCTION set_practice_updated_at();

COMMENT ON TABLE practice_topics IS
  'Admin-managed Practice Speaking / Write a Paragraph topics. ai_prompt is backend-only.';
COMMENT ON TABLE practice_topic_translations IS
  'Per-locale topic title/description. One row per (topic_id, locale); readers fall back to en.';
COMMENT ON TABLE practice_attempts IS
  'A student try at a practice topic. xp_awarded counts toward XP; score is display-only.';

ALTER TABLE practice_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_topic_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_attempts ENABLE ROW LEVEL SECURITY;
