// Phase 6 — P6-085
// AttemptResult — domain entity for the backend attempt response.
//
// Maps to SubmitAttemptResponse from POST /sessions/:sessionId/attempt.
//
// CRITICAL SECURITY RULES:
// - is_correct is intentionally NOT returned during an active session to
//   prevent answer-leaking. Flutter NEVER evaluates correctness locally.
// - overallScore MUST NEVER be persisted or computed by Flutter.
// - All AIM-owned values (mastery, difficulty, weakness) are withheld.

class AttemptResult {
  const AttemptResult({
    required this.attemptId,
    required this.answerId,
    required this.submittedAt,
    required this.aimPipelineTriggered,
    required this.aimOutcome,
  });

  /// Backend-issued attempt UUID.
  final String attemptId;

  /// Backend-issued answer UUID.
  final String answerId;

  /// ISO-8601 UTC timestamp when the backend recorded the submission.
  final String submittedAt;

  /// Whether the AIM analysis pipeline was triggered for this attempt.
  final bool aimPipelineTriggered;

  /// AIM pipeline outcome: 'ok' or 'deferred'.
  final String aimOutcome;
}
