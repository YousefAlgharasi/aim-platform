// Phase 4 — P4-067
// PlacementQuestionNotifier.
//
// Scope: Placement Test phase only — question page only.
//
// Responsibility:
//   1. Load questions for the current placement section.
//   2. Track the current question index and the student's selected answer.
//   3. Submit each answer to the backend via the repository.
//   4. Advance to the next question after each submission.
//
// Security rules:
// - Flutter NEVER evaluates is_correct or computes any correctness signal.
// - is_correct is NEVER included in any request or response Flutter handles.
// - correct_answer is NEVER in the question model — backend-controlled only.
// - answerValue is the only student-supplied field; it is validated format-only
//   in this notifier (non-empty). Correctness validation is backend-only.
// - student_id is resolved from the JWT on the backend; never sent by Flutter.
// - No scoring, CEFR level, mastery, weakness map, or AIM Engine logic here.
// - No secrets, service-role keys, database credentials, or privileged config.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/placement/data/models/placement_question_model.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

sealed class PlacementQuestionState {
  const PlacementQuestionState();
}

/// Initial — questions not yet loaded.
final class PlacementQuestionIdle extends PlacementQuestionState {
  const PlacementQuestionIdle();
}

/// Loading questions from the backend.
final class PlacementQuestionLoading extends PlacementQuestionState {
  const PlacementQuestionLoading();
}

/// Questions loaded — student is answering.
final class PlacementQuestionReady extends PlacementQuestionState {
  const PlacementQuestionReady({
    required this.questions,
    required this.currentIndex,
    required this.attemptId,
    this.selectedAnswer,
    this.isSubmitting = false,
  });

  final List<PlacementQuestionModel> questions;
  final int currentIndex;
  final String attemptId;

  /// The student's currently selected (but not yet submitted) answer.
  /// Null means no selection yet.
  final String? selectedAnswer;

  /// True while the answer is being submitted to the backend.
  final bool isSubmitting;

  PlacementQuestionModel get currentQuestion => questions[currentIndex];
  bool get isLastQuestion => currentIndex >= questions.length - 1;
  int get totalQuestions => questions.length;
  int get displayIndex => currentIndex + 1;
  bool get canSubmit => selectedAnswer != null && !isSubmitting;

  PlacementQuestionReady copyWith({
    int? currentIndex,
    String? selectedAnswer,
    bool clearSelectedAnswer = false,
    bool? isSubmitting,
  }) {
    return PlacementQuestionReady(
      questions: questions,
      currentIndex: currentIndex ?? this.currentIndex,
      attemptId: attemptId,
      selectedAnswer:
          clearSelectedAnswer ? null : (selectedAnswer ?? this.selectedAnswer),
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}

/// All questions answered — section complete.
final class PlacementQuestionSectionComplete extends PlacementQuestionState {
  const PlacementQuestionSectionComplete({required this.attemptId});
  final String attemptId;
}

/// An error occurred.
final class PlacementQuestionError extends PlacementQuestionState {
  const PlacementQuestionError({required this.message, this.code});
  final String message;
  final String? code;
}

// ---------------------------------------------------------------------------
// Notifier
// ---------------------------------------------------------------------------

class PlacementQuestionNotifier
    extends StateNotifier<PlacementQuestionState> {
  PlacementQuestionNotifier({required PlacementRepository repository})
      : _repository = repository,
        super(const PlacementQuestionIdle());

  final PlacementRepository _repository;

  /// Load all questions for the given [sectionId].
  Future<void> loadQuestions(
    String bearerToken, {
    required String sectionId,
    required String attemptId,
  }) async {
    state = const PlacementQuestionLoading();
    try {
      final questions = await _repository.getQuestionsForSection(
        bearerToken,
        sectionId: sectionId,
      );

      if (questions.isEmpty) {
        state = const PlacementQuestionError(
          message: 'No questions found for this section.',
          code: 'NO_QUESTIONS',
        );
        return;
      }

      state = PlacementQuestionReady(
        questions: questions,
        currentIndex: 0,
        attemptId: attemptId,
      );
    } catch (e) {
      state = PlacementQuestionError(
        message: e is Exception
            ? e.toString()
            : 'Failed to load questions',
        code: 'QUESTIONS_LOAD_FAILED',
      );
    }
  }

  /// Update the student's selected answer for the current question.
  /// Does NOT submit to backend — submission happens in [submitCurrentAnswer].
  void selectAnswer(String answerValue) {
    final current = state;
    if (current is! PlacementQuestionReady || current.isSubmitting) return;
    state = current.copyWith(selectedAnswer: answerValue);
  }

  /// Submit the current answer to the backend, then advance to the next question.
  ///
  /// Rules:
  /// - Sends only placementQuestionId and answerValue to backend (P4-012).
  /// - is_correct is NEVER evaluated or returned here.
  /// - On success: advances to next question or transitions to SectionComplete.
  Future<void> submitCurrentAnswer(String bearerToken) async {
    final current = state;
    if (current is! PlacementQuestionReady) return;
    if (!current.canSubmit) return;

    state = current.copyWith(isSubmitting: true);

    try {
      await _repository.submitAnswer(
        bearerToken,
        attemptId: current.attemptId,
        payload: PlacementSubmitAnswerPayload(
          placementAttemptId: current.attemptId,
          placementQuestionId: current.currentQuestion.id,
          answerValue: current.selectedAnswer!,
        ),
      );

      // Advance — no correctness check here, backend evaluates after submission.
      if (current.isLastQuestion) {
        state = PlacementQuestionSectionComplete(attemptId: current.attemptId);
      } else {
        state = current.copyWith(
          currentIndex: current.currentIndex + 1,
          clearSelectedAnswer: true,
          isSubmitting: false,
        );
      }
    } catch (e) {
      // Reset submitting flag so student can retry.
      state = current.copyWith(isSubmitting: false);
      // Re-throw so the UI can show an error.
      rethrow;
    }
  }
}
