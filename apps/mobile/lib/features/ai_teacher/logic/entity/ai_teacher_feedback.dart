// Phase 8 — P8-081
// AiTeacherFeedback — read-only entity for a recorded student rating of
// an AI Teacher reply.
//
// Mirrors SubmitTeacherFeedbackResult (ai-teacher-feedback-submit.types.ts,
// POST /ai-teacher/messages/:id/feedback). Feedback is advisory only — it
// is never read by the AIM Engine and never affects mastery, level,
// weakness, difficulty, recommendations, or review schedule.

class AiTeacherFeedback {
  const AiTeacherFeedback({
    required this.feedbackId,
    required this.messageId,
    required this.rating,
    required this.createdAt,
  });

  final String feedbackId;
  final String messageId;

  /// 'helpful' | 'not_helpful'.
  final String rating;

  final String createdAt;
}
