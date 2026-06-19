// Phase 6 — P6-085
// AttemptSubmitResponseModel — parses the backend response from
// POST /sessions/:sessionId/attempt (RecordLessonAttemptResponse).
//
// CRITICAL SECURITY RULES:
// - isCorrect is backend-evaluated and received verbatim.
// - Flutter ONLY uses isCorrect to show the student feedback.
// - Flutter NEVER uses isCorrect to compute scores, mastery, or rankings.
// - overallScore MUST NEVER be persisted or computed by Flutter.

import '../../logic/entity/attempt_result.dart';

/// Data-layer model for the attempt submission response.
class AttemptSubmitResponseModel extends AttemptResult {
  const AttemptSubmitResponseModel({
    required super.attemptId,
    required super.answerId,
    required super.attemptNumberForItem,
    required super.isCorrect,
    required super.submittedAt,
  });

  factory AttemptSubmitResponseModel.fromJson(Map<String, dynamic> json) {
    return AttemptSubmitResponseModel(
      attemptId: json['attemptId'] as String,
      answerId: json['answerId'] as String,
      attemptNumberForItem: (json['attemptNumberForItem'] as num).toInt(),
      isCorrect: json['isCorrect'] as bool,
      submittedAt: json['submittedAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'attemptId': attemptId,
        'answerId': answerId,
        'attemptNumberForItem': attemptNumberForItem,
        'isCorrect': isCorrect,
        'submittedAt': submittedAt,
      };
}
