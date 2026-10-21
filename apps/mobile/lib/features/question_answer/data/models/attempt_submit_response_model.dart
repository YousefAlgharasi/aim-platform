// Phase 6 — P6-085
// AttemptSubmitResponseModel — parses the backend response from
// POST /sessions/:sessionId/attempt (SubmitAttemptResponse).
//
// CRITICAL SECURITY RULES:
// - is_correct is intentionally NOT returned during an active session.
// - Flutter NEVER evaluates correctness locally.
// - overallScore MUST NEVER be persisted or computed by Flutter.

import '../../logic/entity/attempt_result.dart';

/// Data-layer model for the attempt submission response.
class AttemptSubmitResponseModel extends AttemptResult {
  const AttemptSubmitResponseModel({
    required super.attemptId,
    required super.answerId,
    required super.submittedAt,
    required super.aimPipelineTriggered,
    required super.aimOutcome,
    super.isCorrect,
  });

  factory AttemptSubmitResponseModel.fromJson(Map<String, dynamic> json) {
    final rawIsCorrect = json['isCorrect'] ?? json['is_correct'];
    return AttemptSubmitResponseModel(
      attemptId: (json['attemptId'] ?? json['attempt_id'] ?? '').toString(),
      answerId: (json['answerId'] ?? json['answer_id'] ?? '').toString(),
      submittedAt: (json['submittedAt'] ?? json['submitted_at'] ?? '').toString(),
      aimPipelineTriggered:
          json['aimPipelineTriggered'] == true || json['aim_pipeline_triggered'] == true,
      aimOutcome: (json['aimOutcome'] ?? json['aim_outcome'] ?? 'deferred').toString(),
      isCorrect: rawIsCorrect is bool
          ? rawIsCorrect
          : (rawIsCorrect != null
              ? rawIsCorrect.toString().toLowerCase() == 'true'
              : null),
    );
  }

  Map<String, dynamic> toJson() => {
        'attemptId': attemptId,
        'answerId': answerId,
        'submittedAt': submittedAt,
        'aimPipelineTriggered': aimPipelineTriggered,
        'aimOutcome': aimOutcome,
      };
}
