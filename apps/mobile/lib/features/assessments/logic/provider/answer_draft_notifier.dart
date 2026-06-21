// Phase 10 — P10-060
// AnswerDraftNotifier — stores temporary UI-only draft answers before
// submission.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER grades or evaluates answers — only collects them.
// - selectedOptionId and textAnswer are collected locally and submitted
//   verbatim to the backend.
// - No correctness, mastery, or AIM-owned value is computed here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/assessments/logic/entity/answer_draft.dart';

class AnswerDraftNotifier extends StateNotifier<AnswerDraftState> {
  AnswerDraftNotifier({required String attemptId})
      : super(AnswerDraftState(attemptId: attemptId));

  /// Record or update the student's draft answer for [questionLinkId].
  /// Never evaluated locally — stored only for eventual submission.
  void setAnswer(
    String questionLinkId, {
    String? selectedOptionId,
    String? textAnswer,
  }) {
    final updated = Map<String, AnswerDraft>.from(state.drafts);
    updated[questionLinkId] = AnswerDraft(
      questionLinkId: questionLinkId,
      selectedOptionId: selectedOptionId,
      textAnswer: textAnswer,
      answeredAt: DateTime.now(),
    );
    state = state.copyWith(drafts: updated);
  }

  /// Remove the draft answer for [questionLinkId].
  void clearAnswer(String questionLinkId) {
    final updated = Map<String, AnswerDraft>.from(state.drafts);
    updated.remove(questionLinkId);
    state = state.copyWith(drafts: updated);
  }

  /// Remove all draft answers.
  void clearAll() {
    state = state.copyWith(drafts: {});
  }

  /// Convert all drafts into a submission payload.
  /// The returned list is passed verbatim to the backend — Flutter adds
  /// no scoring or evaluation fields.
  List<Map<String, dynamic>> toSubmissionPayload() {
    return state.drafts.values.map((draft) {
      return <String, dynamic>{
        'questionLinkId': draft.questionLinkId,
        if (draft.selectedOptionId != null)
          'selectedOptionId': draft.selectedOptionId,
        if (draft.textAnswer != null) 'textAnswer': draft.textAnswer,
        'answeredAt': draft.answeredAt.toIso8601String(),
      };
    }).toList();
  }
}
