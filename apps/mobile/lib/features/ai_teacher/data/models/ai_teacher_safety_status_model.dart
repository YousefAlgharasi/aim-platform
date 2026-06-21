// Phase 18 — P18-064
// AiTeacherSafetyStatusModel — data-layer model for AiTeacherSafetyStatus.
//
// Parses the response of GET /ai-teacher/sessions/:id/safety-status.

import '../../logic/entity/ai_teacher_safety_status.dart';

class AiTeacherSafetyStatusModel extends AiTeacherSafetyStatus {
  const AiTeacherSafetyStatusModel({
    required super.sessionId,
    required super.status,
    required super.lastCheckedAt,
  });

  factory AiTeacherSafetyStatusModel.fromJson(Map<String, dynamic> json) {
    return AiTeacherSafetyStatusModel(
      sessionId: json['sessionId'] as String,
      status: json['status'] as String,
      lastCheckedAt: json['lastCheckedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'sessionId': sessionId,
        'status': status,
        'lastCheckedAt': lastCheckedAt,
      };
}
