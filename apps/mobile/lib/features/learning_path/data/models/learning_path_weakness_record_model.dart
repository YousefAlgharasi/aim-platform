// Phase 6 — P6-064
// LearningPathWeaknessRecordModel — data-layer model for
// LearningPathWeaknessRecord.
//
// Parses WeaknessRecordEntry items from WeaknessRecordsReadResponse
// (GET /aim/students/:studentId/weakness-records).
//
// [severity] is backend-computed. Flutter must never compute or infer it.

import '../../logic/entity/learning_path_weakness_record.dart';

class LearningPathWeaknessRecordModel extends LearningPathWeaknessRecord {
  const LearningPathWeaknessRecordModel({
    required super.weaknessId,
    required super.skillId,
    required super.severity,
    required super.status,
    required super.triggerAttemptIds,
    required super.detectedAt,
    super.resolvedAt,
    required super.updatedAt,
  });

  factory LearningPathWeaknessRecordModel.fromJson(
      Map<String, dynamic> json) {
    return LearningPathWeaknessRecordModel(
      weaknessId: json['weaknessId'] as String,
      skillId: json['skillId'] as String,
      severity: json['severity'] as String,
      status: json['status'] as String,
      triggerAttemptIds: (json['triggerAttemptIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      detectedAt: json['detectedAt'] as String,
      resolvedAt: json['resolvedAt'] as String?,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
