-- Placement test timer enforcement + WRITING/SPEAKING question types +
-- AI grading columns + first-login placement decision gate.
--
-- Scope: Placement Test system only. No AIM Engine runtime changes.
--
-- Security rules (mirrors existing placement migrations):
-- - Backend is the sole authority for attempt timing, grading scores, and
--   the placement decision flag. Clients never set these directly.
-- - No secrets, service-role keys, or privileged config here.

-- ============================================================
-- 1. Attempts: server-enforced timer
-- ============================================================

ALTER TABLE placement_attempts
  ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 2700, -- 45 minutes default
  ADD COLUMN expires_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN placement_attempts.duration_seconds IS
  'Total time budget for the whole attempt, in seconds. Backend-owned; set at attempt start.';

COMMENT ON COLUMN placement_attempts.expires_at IS
  'started_at + duration_seconds, computed and stored at attempt start. '
  'Backend rejects/auto-completes answer submission once now() passes this timestamp. '
  'Client renders its countdown from this timestamp, never from a client-local timer alone.';

-- Backfill expires_at for any pre-existing attempts using their duration default.
UPDATE placement_attempts
SET expires_at = started_at + (duration_seconds || ' seconds')::interval
WHERE expires_at IS NULL;

-- ============================================================
-- 2. Questions: new WRITING / SPEAKING types
-- ============================================================

ALTER TABLE placement_questions
  DROP CONSTRAINT placement_questions_type_check;

ALTER TABLE placement_questions
  ADD CONSTRAINT placement_questions_type_check
    CHECK (question_type IN (
      'multiple_choice', 'true_false', 'fill_blank', 'listening_choice',
      'writing', 'speaking'
    ));

-- writing/speaking questions are prompt-graded by AI, not by a fixed
-- correct_answer key; store a non-scoring placeholder so the existing
-- NOT NULL / non-empty constraint on correct_answer still holds without
-- meaning "the right answer" for these two types.
COMMENT ON COLUMN placement_questions.correct_answer IS
  'Server-side answer key for objectively-scored question types. Never exposed to '
  'students or clients. For question_type = writing/speaking this column is not used '
  'for scoring (AI-graded instead) and holds a placeholder value only.';

-- ============================================================
-- 3. Answers: writing/speaking submission + AI grading results
-- ============================================================

ALTER TABLE placement_answers
  ADD COLUMN audio_asset_ref TEXT NULL,
  ADD COLUMN transcript TEXT NULL,
  ADD COLUMN ai_score NUMERIC(4, 2) NULL,
  ADD COLUMN ai_feedback TEXT NULL,
  ADD COLUMN graded_at TIMESTAMPTZ NULL;

ALTER TABLE placement_answers
  ADD CONSTRAINT placement_answers_ai_score_range
    CHECK (ai_score IS NULL OR (ai_score >= 0 AND ai_score <= 10));

COMMENT ON COLUMN placement_answers.audio_asset_ref IS
  'Storage reference for a speaking answer''s recorded audio (mirrors '
  'voice-teacher''s VoiceAudioAsset pattern). Null for non-speaking answers.';

COMMENT ON COLUMN placement_answers.transcript IS
  'STT transcript of a speaking answer''s audio_asset_ref, produced by the same '
  'STT pipeline used for voice teacher. Null for non-speaking answers.';

COMMENT ON COLUMN placement_answers.ai_score IS
  'AI-graded score 0-10 for writing/speaking answers. Null for objectively-scored '
  'question types and until grading completes.';

COMMENT ON COLUMN placement_answers.ai_feedback IS
  'Brief AI-generated feedback text for writing/speaking answers. Never exposed with '
  'internal mastery/weighting data -- student-safe text only.';

COMMENT ON COLUMN placement_answers.graded_at IS
  'Timestamp AI grading completed for this answer. Null until graded.';

-- skill_code was previously constrained to the 4 MCQ-era skills; writing and
-- speaking answers are tagged with their own skill codes.
ALTER TABLE placement_answers
  DROP CONSTRAINT placement_answers_skill_code_check;

ALTER TABLE placement_answers
  ADD CONSTRAINT placement_answers_skill_code_check
    CHECK (skill_code IN ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'));

-- ============================================================
-- 4. First-login placement decision gate
-- ============================================================

ALTER TABLE student_profiles
  ADD COLUMN placement_decision TEXT NULL
    CHECK (placement_decision IS NULL OR placement_decision IN ('take_placement', 'start_from_scratch'));

COMMENT ON COLUMN student_profiles.placement_decision IS
  'Records the student''s one-time choice on first login between taking the '
  'placement test and starting from scratch (level 1 / default curriculum). '
  'Null until the student makes a choice; once set it is never shown again.';
