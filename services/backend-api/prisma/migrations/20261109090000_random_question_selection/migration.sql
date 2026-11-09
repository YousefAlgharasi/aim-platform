-- Random question selection.
--
-- lesson_questions:  the practice pool of a lesson (lesson-specific questions, each also linked to the
--                    lesson's skills through question_skills so the AIM skill model keeps working).
-- session_questions: the questions drawn for one practice session. Stored so a page reload / resume of the
--                    same session shows the same questions, while every NEW session draws a fresh random set.
-- assessment_attempt_questions: the questions drawn for one quiz/exam attempt (a random subset of the
--                    assessment's pool, in a random order). Grading/review/delivery are scoped to it.
-- assessment_settings.questions_per_attempt: how many questions one attempt draws (NULL = the whole pool).

CREATE TABLE IF NOT EXISTS lesson_questions (
  lesson_id   uuid        NOT NULL REFERENCES lessons(id)       ON DELETE CASCADE,
  question_id uuid        NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lesson_questions_pkey PRIMARY KEY (lesson_id, question_id)
);
CREATE INDEX IF NOT EXISTS lesson_questions_question_id_idx ON lesson_questions (question_id);

CREATE TABLE IF NOT EXISTS session_questions (
  session_id  uuid        NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  lesson_id   uuid        NOT NULL REFERENCES lessons(id)           ON DELETE CASCADE,
  question_id uuid        NOT NULL REFERENCES question_bank(id)     ON DELETE CASCADE,
  position    integer     NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT session_questions_pkey PRIMARY KEY (session_id, lesson_id, question_id)
);
CREATE INDEX IF NOT EXISTS session_questions_question_id_idx ON session_questions (question_id);

CREATE TABLE IF NOT EXISTS assessment_attempt_questions (
  attempt_id                  uuid        NOT NULL REFERENCES assessment_attempts(id)  ON DELETE CASCADE,
  assessment_question_link_id uuid        NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  position                    integer     NOT NULL,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assessment_attempt_questions_pkey PRIMARY KEY (attempt_id, assessment_question_link_id)
);
CREATE INDEX IF NOT EXISTS assessment_attempt_questions_link_idx ON assessment_attempt_questions (assessment_question_link_id);

ALTER TABLE assessment_settings
  ADD COLUMN IF NOT EXISTS questions_per_attempt integer;
ALTER TABLE assessment_settings
  DROP CONSTRAINT IF EXISTS assessment_settings_questions_per_attempt_check;
ALTER TABLE assessment_settings
  ADD CONSTRAINT assessment_settings_questions_per_attempt_check
  CHECK (questions_per_attempt IS NULL OR questions_per_attempt >= 1);

ALTER TABLE lesson_questions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempt_questions  ENABLE ROW LEVEL SECURITY;
