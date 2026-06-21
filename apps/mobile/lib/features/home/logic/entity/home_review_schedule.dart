// Phase 6 — P6-059
// HomeReviewSchedule — domain entity for a review reminder entry on the
// home screen.
//
// [priority] is backend-computed via the AIM review-schedule algorithm.
// Flutter must never compute or reorder items by locally-derived priority.

/// Domain entity representing a single review-schedule reminder
/// returned by GET /aim/students/:studentId/review-schedules.
///
/// Backend is the sole authority for [dueAt] and [priority].
class HomeReviewSchedule {
  const HomeReviewSchedule({
    required this.topic,
    required this.dueAt,
    required this.priority,
  });

  /// Subject / curriculum topic identifier.
  final String topic;

  /// ISO-8601 datetime at which the review is due. Backend-supplied.
  final String dueAt;

  /// AIM-computed review priority value. Backend-computed.
  final String priority;
}
