-- P18-018: Create AI teacher feedback table
-- Student-submitted feedback on AI Teacher responses, with an escalation
-- flag for safety/quality review. This table never stores mastery,
-- weakness, or progress data.

CREATE TABLE IF NOT EXISTS ai_teacher_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  message_id UUID NOT NULL
    REFERENCES ai_teacher_messages (id) ON DELETE CASCADE,

  student_id UUID NOT NULL
    REFERENCES users (id),

  rating SMALLINT NOT NULL,
  comment TEXT,
  escalation_flag BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT ai_teacher_feedback_rating_check
    CHECK (rating IN (-1, 0, 1))
);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_feedback_message
  ON ai_teacher_feedback (message_id);

CREATE INDEX IF NOT EXISTS idx_ai_teacher_feedback_student
  ON ai_teacher_feedback (student_id);
