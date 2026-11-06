-- Learner tools: saved words (spaced-repetition flashcards), study plan (onboarding), resolved mistakes.
-- student_id columns hold users.id (the internal user id), like lesson_attempts.student_id.

CREATE TABLE IF NOT EXISTS saved_words (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word           text        NOT NULL CHECK (char_length(btrim(word)) BETWEEN 1 AND 60),
  meaning        text        CHECK (meaning IS NULL OR char_length(meaning) <= 200),
  context        text        CHECK (context IS NULL OR char_length(context) <= 300),
  source         text        NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'chat', 'lesson', 'voice')),
  -- Leitner box 1..6; next_review_at drives the daily review queue.
  box            smallint    NOT NULL DEFAULT 1 CHECK (box BETWEEN 1 AND 6),
  next_review_at timestamptz NOT NULL DEFAULT now(),
  last_reviewed_at timestamptz,
  times_correct  integer     NOT NULL DEFAULT 0,
  times_wrong    integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS saved_words_student_word_uq ON saved_words (student_id, lower(btrim(word)));
CREATE INDEX IF NOT EXISTS saved_words_due_idx ON saved_words (student_id, next_review_at);

CREATE TABLE IF NOT EXISTS study_plans (
  student_id     uuid        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  goal           text        NOT NULL CHECK (goal IN ('work', 'study', 'travel', 'fun', 'other')),
  daily_minutes  smallint    NOT NULL CHECK (daily_minutes BETWEEN 5 AND 180),
  reminder_time  time,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mistake_resolutions (
  student_id  uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id     uuid        NOT NULL,
  resolved_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, item_id)
);

ALTER TABLE saved_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistake_resolutions ENABLE ROW LEVEL SECURITY;
