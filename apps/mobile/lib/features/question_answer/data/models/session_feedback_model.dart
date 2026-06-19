// Phase 6 — P6-091
// SessionFeedbackModel — data-layer model for SessionFeedback.
//
// Parses GET /aim/students/:studentId/sessions/:sessionId/state response
// (SessionStateReadResponse from session-state-read.service.ts).
//
// CRITICAL SECURITY RULE:
// - No per-question is_correct field exists in this model.
//   itemsCorrect is a session aggregate only.

import '../../logic/entity/session_feedback.dart';

class SessionFeedbackModel extends SessionFeedback {
  const SessionFeedbackModel({
    required super.sessionId,
    required super.found,
    super.itemsAttempted,
    super.itemsCorrect,
    super.skillsTouched,
    super.overallMasteryShift,
    super.closedOutAt,
    super.updatedAt,
  });

  factory SessionFeedbackModel.fromJson(Map<String, dynamic> json) {
    return SessionFeedbackModel(
      sessionId: json['sessionId'] as String,
      found: json['found'] as bool,
      itemsAttempted: json['itemsAttempted'] as int?,
      itemsCorrect: json['itemsCorrect'] as int?,
      skillsTouched: (json['skillsTouched'] as List<dynamic>?)
          ?.whereType<String>()
          .toList(),
      overallMasteryShift: json['overallMasteryShift'] as String?,
      closedOutAt: json['closedOutAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }
}
