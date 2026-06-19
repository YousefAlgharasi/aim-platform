// Phase 8 — P8-081
// AiTeacherFeedbackModel — data-layer model for AiTeacherFeedback.
//
// Parses the response of POST /ai-teacher/messages/:id/feedback
// (SubmitTeacherFeedbackResult, ai-teacher-feedback-submit.types.ts).

import '../../logic/entity/ai_teacher_feedback.dart';

class AiTeacherFeedbackModel extends AiTeacherFeedback {
  const AiTeacherFeedbackModel({
    required super.feedbackId,
    required super.messageId,
    required super.rating,
    required super.createdAt,
  });

  factory AiTeacherFeedbackModel.fromJson(Map<String, dynamic> json) {
    return AiTeacherFeedbackModel(
      feedbackId: json['feedbackId'] as String,
      messageId: json['messageId'] as String,
      rating: json['rating'] as String,
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'feedbackId': feedbackId,
        'messageId': messageId,
        'rating': rating,
        'createdAt': createdAt,
      };
}
