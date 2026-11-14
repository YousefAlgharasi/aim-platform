-- Improve "recovery loop":
--  1. skill_group_map: every curriculum skill belongs to one of the 6 main skills the student sees.
--     pronunciation + functional_language fold into speaking; the placement reading-comprehension skill
--     (filed under vocabulary) belongs to reading. Editable data, not code: new skills fall back to their domain.
--  2. recovery_questions: AI-written retry questions that belong to ONE student. They live in question_bank
--     with status 'draft' (so no lesson, practice or placement query ever serves them to anyone else) and
--     are tied to the student here, which is the only thing that lets that student's attempt resolve them.
-- student_id holds the sign-in id (like lesson_attempts.student_id), so there is no foreign key.

CREATE TABLE IF NOT EXISTS skill_group_map (
  skill_key  text PRIMARY KEY,
  group_key  text NOT NULL CHECK (group_key IN ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO skill_group_map (skill_key, group_key)
SELECT s.key,
       CASE
         WHEN s.key = 'placement.vocabulary.reading_comp' THEN 'reading'
         WHEN s.domain IN ('pronunciation', 'functional_language') THEN 'speaking'
         ELSE s.domain
       END
  FROM skills s
 WHERE s.domain IN ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking', 'pronunciation', 'functional_language')
ON CONFLICT (skill_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS recovery_questions (
  question_id uuid PRIMARY KEY REFERENCES question_bank(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL,
  skill_key   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS recovery_questions_student_skill_idx ON recovery_questions (student_id, skill_key);

ALTER TABLE skill_group_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_questions ENABLE ROW LEVEL SECURITY;
