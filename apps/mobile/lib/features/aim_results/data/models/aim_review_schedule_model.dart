// Phase 6 — P6-094
// AimReviewScheduleModel — data-layer model for AimReviewSchedule.
//
// Parses ReviewScheduleEntry items from ReviewScheduleReadResponse
// (GET /aim/students/:studentId/review-schedules).

import '../../logic/entity/aim_review_schedule.dart';

class AimReviewScheduleModel extends AimReviewSchedule {
  const AimReviewScheduleModel({
    required super.scheduleId,
    required super.skillId,
    required super.dueAt,
    required super.intervalDays,
    required super.repetitionCount,
    required super.status,
    required super.basedOnAttemptId,
    required super.scheduledAt,
    required super.updatedAt,
  });

  factory AimReviewScheduleModel.fromJson(Map<String, dynamic> json) {
    return AimReviewScheduleModel(
      scheduleId: json['scheduleId'] as String,
      skillId: json['skillId'] as String,
      dueAt: json['dueAt'] as String,
      intervalDays: (json['intervalDays'] as num).toDouble(),
      repetitionCount: json['repetitionCount'] as int,
      status: json['status'] as String,
      basedOnAttemptId: json['basedOnAttemptId'] as String,
      scheduledAt: json['scheduledAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
