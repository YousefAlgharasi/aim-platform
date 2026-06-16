/// Domain entity for a placement test attempt (student-safe fields only).
///
/// All status transitions are backend-controlled. Flutter triggers transitions
/// via dedicated endpoints — it never sets status directly.
///
/// Scope: Phase 4 — Placement Test only.
class PlacementAttempt {
  const PlacementAttempt({
    required this.id,
    required this.placementTestId,
    required this.status,
    required this.startedAt,
    this.submittedAt,
    this.completedAt,
  });

  /// Backend-generated UUID.
  final String id;

  /// Foreign key to placement_tests.
  final String placementTestId;

  /// One of: active, submitted, completed, abandoned.
  /// Never set directly by Flutter — backend controls all transitions.
  final String status;

  /// Set by backend on attempt start.
  final String startedAt;

  /// Set by backend on attempt submission. Null until submitted.
  final String? submittedAt;

  /// Set by backend on attempt completion. Null until completed.
  final String? completedAt;

  bool get isActive => status == 'active';
  bool get isSubmitted => status == 'submitted';
  bool get isCompleted => status == 'completed';
  bool get isAbandoned => status == 'abandoned';

  /// True if the result is available (attempt is completed).
  bool get resultAvailable => isCompleted;
}
