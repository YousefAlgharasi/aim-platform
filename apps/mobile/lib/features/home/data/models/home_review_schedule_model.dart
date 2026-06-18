// Phase 6 — P6-059
// HomeReviewScheduleModel — data-layer model for HomeReviewSchedule.
//
// Parses the student-safe API response from
// GET /aim/students/:studentId/review-schedules.
//
// [dueAt] and [priority] are backend-computed.
// Flutter must never compute, reorder, or infer schedule priority locally.

import '../../logic/entity/home_review_schedule.dart';

/// Data-layer model for [HomeReviewSchedule].
class HomeReviewScheduleModel extends HomeReviewSchedule {
  const HomeReviewScheduleModel({
    required super.topic,
    required super.dueAt,
    required super.priority,
  });

  factory HomeReviewScheduleModel.fromJson(Map<String, dynamic> json) {
    return HomeReviewScheduleModel(
      topic: json['topic'] as String,
      dueAt: json['dueAt'] as String,
      priority: json['priority'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'topic': topic,
        'dueAt': dueAt,
        'priority': priority,
      };
}
