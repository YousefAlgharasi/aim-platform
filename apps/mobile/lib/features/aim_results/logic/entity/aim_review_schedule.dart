// Phase 6 — P6-094
// AimReviewSchedule — read-only entity for a backend-persisted AIM review
// schedule entry.
//
// Mirrors ReviewScheduleEntry (review-schedule-read.service.ts).
// dueAt, intervalDays, and repetitionCount are AIM Engine outputs.

class AimReviewSchedule {
  const AimReviewSchedule({
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

  /// When the review is due. AIM Engine output; Flutter displays verbatim.
  final String dueAt;

  /// Backend-computed interval in days. Fractional (e.g. spaced-repetition
  /// math can produce 2.38 days) — never a whole-number assumption. Display
  /// only.
  final double intervalDays;

  /// Backend-counted repetition count. Display only.
  final int repetitionCount;

  final String status;
  final String basedOnAttemptId;
  final String scheduledAt;
  final String updatedAt;
}

/// Pure display formatting of a backend-computed intervalDays value (may be
/// fractional, e.g. 2.38) — display only, never fed back into any AIM data.
String formatAimIntervalDays(double intervalDays) =>
    intervalDays == intervalDays.roundToDouble()
        ? intervalDays.toStringAsFixed(0)
        : intervalDays.toStringAsFixed(1);
