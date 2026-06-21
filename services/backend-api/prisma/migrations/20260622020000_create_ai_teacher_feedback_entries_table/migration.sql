-- P18-018: Create AI teacher feedback table
-- Student-submitted feedback on AI Teacher responses, with an escalation
-- flag for safety/quality review. This table never stores mastery,
-- weakness, or progress data.
--
-- Named ai_teacher_feedback_entries (not ai_teacher_feedback) to avoid
-- colliding with the pre-existing ai_teacher_feedback table (P8-023) which
-- has a different, simpler helpful/not_helpful schema for the legacy AI
-- chat pipeline.

CREATE TABLE IF NOT EXISTS ai_teacher_feedback_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  message_id UUID NOT NULL
    REFERENCES ai_teacher_messages (id) ON DELETE CASCADE,

  student_id UUID NOT NULL
    REFERENCES users (id),

  rating SMALLINT NOT NULL,
  comment TEXT,
  escalation_flag BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_teacher_feedback_entries_rating_check
    CHECK (rating IN (-1, 0, 1))
);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_feedback_entries_message
  ON ai_teacher_feedback_entries (message_id);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_feedback_entries_student
  ON ai_teacher_feedback_entries (student_id);
