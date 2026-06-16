-- P3-026: Create questions table (supplementary to question_bank)
-- Creates the questions table for reusable question bank items.
-- Does NOT implement placement or practice flows (Phase 4+).

CREATE TABLE IF NOT EXISTS questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT UNIQUE,
  type          TEXT NOT NULL CHECK (type IN (
                  'multiple_choice',
                  'true_false',
                  'fill_in_blank',
                  'matching',
                  'ordering',
                  'short_answer'
                )),
  difficulty    TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  prompt        TEXT NOT NULL CHECK (trim(prompt) <> ''),
  explanation   TEXT,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
                  'draft', 'in_review', 'approved', 'published', 'archived'
                )),
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question_choices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label         TEXT NOT NULL CHECK (trim(label) <> ''),
  is_correct    BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS question_skill_links (
  question_id   UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  skill_key     TEXT NOT NULL,
  PRIMARY KEY (question_id, skill_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_status   ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_type     ON questions(type);
CREATE INDEX IF NOT EXISTS idx_questions_key      ON questions(key) WHERE key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_qskill_skill_key   ON question_skill_links(skill_key);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_questions_updated_at();