// Phase 6 — P6-059
// HomeWeaknessRecordModel — data-layer model for HomeWeaknessRecord.
//
// Parses the student-safe API response from
// GET /aim/students/:studentId/weakness-records.
//
// [severity] is backend-computed. Flutter must never compute or infer it.

import '../../logic/entity/home_weakness_record.dart';

/// Data-layer model for [HomeWeaknessRecord].
class HomeWeaknessRecordModel extends HomeWeaknessRecord {
  const HomeWeaknessRecordModel({
    required super.topic,
    required super.severity,
    required super.lastUpdated,
  });

  factory HomeWeaknessRecordModel.fromJson(Map<String, dynamic> json) {
    return HomeWeaknessRecordModel(
      topic: json['topic'] as String,
      severity: json['severity'] as String,
      lastUpdated: json['lastUpdated'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'topic': topic,
        'severity': severity,
        'lastUpdated': lastUpdated,
      };
}
