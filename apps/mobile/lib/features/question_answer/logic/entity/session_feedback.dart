// Phase 6 — P6-091
// SessionFeedback — domain entity for the backend-approved AIM session
// state returned by GET /aim/students/:studentId/sessions/:sessionId/state.
//
// This is the ONLY way correctness-related information ever reaches Flutter —
// as an aggregate, backend-computed, post-attempt summary. Flutter never
// receives per-question is_correct or computes any value locally.
//
// CRITICAL SECURITY RULES:
// - All fields are backend-computed. Flutter renders them verbatim.
// - itemsCorrect is an aggregate count only — never used by Flutter to
//   derive correctness for a specific answer or compute mastery.
// - overallMasteryShift is an opaque string from the AIM Engine via the
//   backend. Flutter displays it verbatim; never parses or acts on it.
// - Flutter never writes to or mutates these values.

class SessionFeedback {
  const SessionFeedback({
    required this.sessionId,
    required this.found,
    this.itemsAttempted,
    this.itemsCorrect,
    this.skillsTouched,
    this.overallMasteryShift,
    this.closedOutAt,
    this.updatedAt,
  });

  final String sessionId;

  /// False when the backend has not yet persisted a session summary
  /// (AIM pipeline still running or session not closed).
  final bool found;

  /// Backend-counted total items attempted this session.
  final int? itemsAttempted;

  /// Backend-counted items graded correct this session (aggregate only).
  /// Flutter never uses this to infer individual question correctness.
  final int? itemsCorrect;

  /// Backend-resolved skill keys touched this session.
  final List<String>? skillsTouched;

  /// AIM Engine-computed mastery shift label. Opaque string; Flutter
  /// displays verbatim.
  final String? overallMasteryShift;

  final String? closedOutAt;
  final String? updatedAt;
}
