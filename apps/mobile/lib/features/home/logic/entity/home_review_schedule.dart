// Phase 6 — P6-059
// HomeReviewSchedule — domain entity for a review schedule entry.
//
// All values are backend-computed. Flutter must never compute or reorder them.

class HomeReviewSchedule {
  const HomeReviewSchedule({
    required this.scheduleId,
    required this.skillId,
    required this.dueAt,
    required this.intervalDays,
    required this.repetitionCount,
    required this.status,
    required this.basedOnAttemptId,
    required this.scheduledAt,
    required this.updatedAt,
  });

  final String scheduleId;
  final String skillId;
  final String dueAt;

  /// Backend-computed interval in days. Fractional (e.g. spaced-repetition
  /// math can produce 2.38 days) — never a whole-number assumption.
  final double intervalDays;
  final int repetitionCount;
  final String status;
  final String basedOnAttemptId;
  final String scheduledAt;
  final String updatedAt;
}
