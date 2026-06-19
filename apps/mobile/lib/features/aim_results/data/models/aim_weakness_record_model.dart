// Phase 6 — P6-094
// AimWeaknessRecordModel — data-layer model for AimWeaknessRecord.
//
// Parses WeaknessRecordEntry items from WeaknessRecordsReadResponse
// (GET /aim/students/:studentId/weakness-records).

import '../../logic/entity/aim_weakness_record.dart';

class AimWeaknessRecordModel extends AimWeaknessRecord {
  const AimWeaknessRecordModel({
    required super.weaknessId,
    required super.skillId,
    required super.severity,
    required super.status,
    required super.triggerAttemptIds,
    required super.detectedAt,
    required super.updatedAt,
    super.resolvedAt,
  });

  factory AimWeaknessRecordModel.fromJson(Map<String, dynamic> json) {
    return AimWeaknessRecordModel(
      weaknessId: json['weaknessId'] as String,
      skillId: json['skillId'] as String,
      severity: json['severity'] as String,
      status: json['status'] as String,
      triggerAttemptIds: (json['triggerAttemptIds'] as List<dynamic>)
          .whereType<String>()
          .toList(),
      detectedAt: json['detectedAt'] as String,
      resolvedAt: json['resolvedAt'] as String?,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
