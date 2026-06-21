// Phase 10 — P10-060
// AnswerDraft — temporary UI-only draft answer before submission.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER grades or evaluates answers — only collects them.
// - selectedOptionId and textAnswer are collected locally and submitted
//   verbatim to the backend. No correctness logic exists here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.

/// A single draft answer for one question within an assessment attempt.
class AnswerDraft {
  const AnswerDraft({
    required this.questionLinkId,
    this.selectedOptionId,
    this.textAnswer,
    required this.answeredAt,
  });

  /// The question-link id this draft answer belongs to.
  final String questionLinkId;

  /// The option id the student tapped (MCQ / true_false).
  /// Collected locally; never evaluated — submitted verbatim.
  final String? selectedOptionId;

  /// Free-text input for fill_blank / free_text questions.
  /// Collected locally; never evaluated — submitted verbatim.
  final String? textAnswer;

  /// Timestamp when the student last changed this draft answer.
  final DateTime answeredAt;

  AnswerDraft copyWith({
    String? questionLinkId,
    String? selectedOptionId,
    bool clearSelectedOptionId = false,
    String? textAnswer,
    bool clearTextAnswer = false,
    DateTime? answeredAt,
  }) {
    return AnswerDraft(
      questionLinkId: questionLinkId ?? this.questionLinkId,
      selectedOptionId: clearSelectedOptionId
          ? null
          : selectedOptionId ?? this.selectedOptionId,
      textAnswer: clearTextAnswer ? null : textAnswer ?? this.textAnswer,
      answeredAt: answeredAt ?? this.answeredAt,
    );
  }
}

/// Holds all draft answers for a single assessment attempt.
class AnswerDraftState {
  const AnswerDraftState({
    required this.attemptId,
    this.drafts = const {},
  });

  /// The assessment attempt these drafts belong to.
  final String attemptId;

  /// Draft answers keyed by questionLinkId.
  final Map<String, AnswerDraft> drafts;

  AnswerDraftState copyWith({
    String? attemptId,
    Map<String, AnswerDraft>? drafts,
  }) {
    return AnswerDraftState(
      attemptId: attemptId ?? this.attemptId,
      drafts: drafts ?? this.drafts,
    );
  }
}
