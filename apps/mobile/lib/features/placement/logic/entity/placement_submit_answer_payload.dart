/// Payload for submitting a single placement answer to the backend.
///
/// This is the only data Flutter sends — it never sets is_correct or skill_code.
/// Scope: Phase 4 — Placement Test only.
class PlacementSubmitAnswerPayload {
  const PlacementSubmitAnswerPayload({
    required this.placementAttemptId,
    required this.placementQuestionId,
    required this.answerValue,
  });

  /// Must reference an active attempt.
  final String placementAttemptId;

  /// Must reference a question in the active test.
  final String placementQuestionId;

  /// Non-empty string. Format depends on question type:
  /// - multiple_choice / listening_choice: "A", "B", "C", or "D"
  /// - true_false: "true" or "false"
  /// - fill_blank: student's written text
  final String answerValue;

  Map<String, dynamic> toJson() => {
        'placement_attempt_id': placementAttemptId,
        'placement_question_id': placementQuestionId,
        'answer_value': answerValue,
      };
}
