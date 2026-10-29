-- Allow listening_choice questions in question_bank.
--
-- Production already accepts this type (the constraint was widened outside
-- the migration history), and chapter quizzes / final exams use it. Without
-- this migration a fresh database rejects those questions.

ALTER TABLE question_bank DROP CONSTRAINT IF EXISTS question_bank_type_check;

ALTER TABLE question_bank
  ADD CONSTRAINT question_bank_type_check
  CHECK (type = ANY (ARRAY[
    'multiple_choice', 'multiple_select', 'true_false', 'fill_in_the_blank',
    'short_answer', 'ordering', 'matching', 'listening_choice'
  ]));
