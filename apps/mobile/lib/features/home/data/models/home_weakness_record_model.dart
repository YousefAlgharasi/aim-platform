// Phase 6 — P6-059
// HomeWeaknessRecordModel — data-layer model for HomeWeaknessRecord.
//
// Parses WeaknessRecordEntry items from WeaknessRecordsReadResponse
// (GET /aim/students/:studentId/weakness-records).
//
// [severity] is backend-computed. Flutter must never compute or infer it.

import '../../logic/entity/home_weakness_record.dart';

class HomeWeaknessRecordModel extends HomeWeaknessRecord {
  const HomeWeaknessRecordModel({
    required super.weaknessId,
    required super.skillId,
    required super.severity,
    required super.status,
    required super.triggerAttemptIds,
    required super.detectedAt,
    super.resolvedAt,
    required super.updatedAt,
  });

  factory HomeWeaknessRecordModel.fromJson(Map<String, dynamic> json) {
    return HomeWeaknessRecordModel(
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
