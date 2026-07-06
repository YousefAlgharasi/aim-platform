// Phase 6 — P6-059
// HomeReviewScheduleModel — data-layer model for HomeReviewSchedule.
//
// Parses ReviewScheduleEntry items from ReviewScheduleReadResponse
// (GET /aim/students/:studentId/review-schedules).
//
// [dueAt] and schedule priority are backend-computed.
// Flutter must never compute, reorder, or infer schedule priority locally.

import '../../logic/entity/home_review_schedule.dart';

class HomeReviewScheduleModel extends HomeReviewSchedule {
  const HomeReviewScheduleModel({
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

  factory HomeReviewScheduleModel.fromJson(Map<String, dynamic> json) {
    return HomeReviewScheduleModel(
      scheduleId: json['scheduleId'] as String,
      skillId: json['skillId'] as String,
      dueAt: json['dueAt'] as String,
      intervalDays: (json['intervalDays'] as num).toDouble(),
      repetitionCount: (json['repetitionCount'] as num).toInt(),
      status: json['status'] as String,
      basedOnAttemptId: json['basedOnAttemptId'] as String,
      scheduledAt: json['scheduledAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
