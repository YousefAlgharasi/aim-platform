// Phase 6 — P6-064
// LearningPathWeaknessRecordModel — data-layer model for
// LearningPathWeaknessRecord.
//
// Parses the full API response from
// GET /aim/students/:studentId/weakness-records (learning plan variant).
//
// [severity] and [recommendedFocus] are backend-computed AIM outputs.
// Flutter must never compute or infer these fields locally.

import '../../logic/entity/learning_path_weakness_record.dart';

/// Data-layer model for [LearningPathWeaknessRecord].
class LearningPathWeaknessRecordModel extends LearningPathWeaknessRecord {
  const LearningPathWeaknessRecordModel({
    required super.topic,
    required super.severity,
    required super.recommendedFocus,
  });

  factory LearningPathWeaknessRecordModel.fromJson(
      Map<String, dynamic> json) {
    return LearningPathWeaknessRecordModel(
      topic: json['topic'] as String,
      severity: json['severity'] as String,
      recommendedFocus: json['recommendedFocus'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'topic': topic,
        'severity': severity,
        'recommendedFocus': recommendedFocus,
      };
}
