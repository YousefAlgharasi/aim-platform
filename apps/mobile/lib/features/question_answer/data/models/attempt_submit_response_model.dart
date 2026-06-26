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
  });

  factory AttemptSubmitResponseModel.fromJson(Map<String, dynamic> json) {
    return AttemptSubmitResponseModel(
      attemptId: json['attemptId'] as String,
      answerId: json['answerId'] as String,
      submittedAt: json['submittedAt'] as String,
      aimPipelineTriggered: json['aimPipelineTriggered'] as bool,
      aimOutcome: json['aimOutcome'] as String,
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
