// Phase 6 — P6-085
// AttemptResult — domain entity for the backend attempt response.
//
// Maps to RecordLessonAttemptResponse from POST /sessions/:sessionId/attempt.
//
// CRITICAL SECURITY RULES:
// - isCorrect is backend-computed — Flutter NEVER evaluates this locally.
// - Flutter receives isCorrect ONLY to display feedback after submission.
// - Flutter NEVER uses isCorrect to compute scores, mastery, or rankings.
// - overallScore MUST NEVER be persisted or computed by Flutter.
// - All feedback shown to the student (correct/incorrect) comes from this
//   entity verbatim — never inferred from the student's selected answer.

class AttemptResult {
  const AttemptResult({
    required this.attemptId,
    required this.answerId,
    required this.attemptNumberForItem,
    required this.isCorrect,
    required this.submittedAt,
  });

  /// Backend-issued attempt UUID.
  final String attemptId;

  /// Backend-issued answer UUID.
  final String answerId;

  /// Backend-counted attempt number for this item.
  /// Flutter never computes or increments this value.
  final int attemptNumberForItem;

  /// Backend-evaluated correctness.
  /// ONLY used to display feedback to the student.
  /// Flutter NEVER uses this to compute scores, mastery, or grades.
  final bool isCorrect;

  /// ISO-8601 UTC timestamp when the backend recorded the submission.
  final String submittedAt;
}
