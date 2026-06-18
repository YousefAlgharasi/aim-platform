/// Domain entity for a submitted placement answer (student-safe fields only).
///
/// is_correct is never returned to the student during the attempt.
/// Flutter must not cache or infer correctness — it must wait for the
/// result endpoint after attempt completion.
///
/// Scope: Phase 4 — Placement Test only.
class PlacementAnswer {
  const PlacementAnswer({
    required this.id,
    required this.placementAttemptId,
    required this.placementQuestionId,
    required this.answerValue,
    required this.createdAt,
  });

  /// Backend-generated UUID.
  final String id;

  /// Foreign key to placement_attempts.
  final String placementAttemptId;

  /// Foreign key to placement_questions.
  final String placementQuestionId;

  /// The student's submitted answer value (format depends on question type).
  final String answerValue;

  /// Set by backend on creation.
  final String createdAt;

  // Note: is_correct and skill_code are intentionally excluded.
  // is_correct must not be revealed during the attempt.
  // skill_code is internal and never exposed to students.
}
