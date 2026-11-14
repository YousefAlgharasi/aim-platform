-- Stories: one illustrated reading story per course, told in scenes by the four friends (Sarah, Adam, Yasmin, Tariq),
-- with comprehension + language questions after every scene.
--  - stories.status draft -> published is the review gate; students only ever see published stories.
--  - story questions are ordinary question_bank rows that STAY 'draft' (tags story, story-only), so no lesson,
--    practice or Improve query can serve them out of context. They are answerable only through a published story
--    (see SessionQuestionsService.resolveItemForAttempt).
--  - reading progress is derived from the student's real answers (lesson_attempts), so there is no progress table.

CREATE TABLE IF NOT EXISTS stories (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid        NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
  title      text        NOT NULL CHECK (char_length(btrim(title)) > 0),
  title_ar   text,
  summary    text        NOT NULL CHECK (char_length(btrim(summary)) > 0),
  summary_ar text,
  status     text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_scenes (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   uuid    NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  position   integer NOT NULL CHECK (position >= 0),
  setting    text    NOT NULL,
  setting_ar text,
  -- [{ "speaker": "narrator" | "sarah" | "adam" | "yasmin" | "tariq", "text": "..." }]
  lines      jsonb   NOT NULL CHECK (jsonb_typeof(lines) = 'array'),
  UNIQUE (story_id, position)
);

CREATE TABLE IF NOT EXISTS story_scene_questions (
  scene_id    uuid    NOT NULL REFERENCES story_scenes(id) ON DELETE CASCADE,
  question_id uuid    NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  position    integer NOT NULL CHECK (position >= 0),
  PRIMARY KEY (scene_id, question_id)
);
CREATE INDEX IF NOT EXISTS story_scene_questions_question_idx ON story_scene_questions (question_id);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_scene_questions ENABLE ROW LEVEL SECURITY;
