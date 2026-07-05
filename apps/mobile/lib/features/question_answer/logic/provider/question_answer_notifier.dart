// Phase 6 — P6-089
// QuestionAnswerNotifier.
//
// Scope: Question/answer session only.
//
// Responsibilities:
//   1. Load a question from the backend.
//   2. Collect the student's answer selection/input locally.
//   3. Submit the attempt to the backend.
//   4. Expose backend acknowledgement to the UI.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes correctness, mastery, difficulty, or any AIM value.
// - selectedOptionId / writtenAnswer are collected and submitted verbatim.
// - attemptResult carries no is_correct field — backend withholds it.
// - sessionId and questionId must come from backend-supplied session state;
//   never from raw user input.
// - Bearer token sourced from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/question_session_state.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';

class QuestionAnswerNotifier extends StateNotifier<QuestionSessionState> {
  QuestionAnswerNotifier({required QuestionAnswerRepository repository})
      : _repository = repository,
        super(const QuestionSessionState());

  final QuestionAnswerRepository _repository;

  /// Load question [questionId] from the backend.
  /// [itemShownAt] is set to now so the backend can compute responseTimeMs.
  Future<void> loadQuestion({
    required String bearerToken,
    required String questionId,
    required String itemShownAt,
  }) async {
    state = state.copyWith(
      isLoadingQuestion: true,
      questionError: null,
      clearSelectedOption: true,
      writtenAnswer: '',
      submitStatus: QuestionSubmitStatus.idle,
      submitError: null,
      itemShownAt: itemShownAt,
    );
    try {
      final question = await _repository.getQuestion(
        bearerToken: bearerToken,
        questionId: questionId,
      );
      state = state.copyWith(
        question: question,
        isLoadingQuestion: false,
      );
    } on AppException catch (e) {
      state = state.copyWith(
        isLoadingQuestion: false,
        questionError: e.message,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingQuestion: false,
        questionError: 'Failed to load question',
      );
    }
  }

  /// Present an already-delivered question (from the session question
  /// delivery endpoint) without a second network fetch. [question] must be
  /// backend-supplied verbatim; [itemShownAt] is recorded so the backend can
  /// compute responseTimeMs.
  void presentQuestion({
    required QuestionModel question,
    required String itemShownAt,
  }) {
    state = QuestionSessionState(
      question: question,
      itemShownAt: itemShownAt,
    );
  }

  /// Record the student's option tap for MCQ / true_false questions.
  /// Never evaluated locally — stored only for submission.
  void selectOption(String optionId) {
    if (state.isSubmitted || state.isSubmitting) return;
    state = state.copyWith(selectedOptionId: optionId, writtenAnswer: '');
  }

  /// Update free-text input for fill_blank / free_text questions.
  void updateWrittenAnswer(String value) {
    if (state.isSubmitted || state.isSubmitting) return;
    state = state.copyWith(
      writtenAnswer: value,
      clearSelectedOption: true,
    );
  }

  /// Submit the student's answer to the backend.
  ///
  /// [sessionId] must be a backend-issued UUID from the session start call.
  /// The response is a safe acknowledgement — it contains no is_correct field.
  Future<void> submitAnswer({
    required String bearerToken,
    required String sessionId,
  }) async {
    if (!state.canSubmit) return;

    final question = state.question!;
    final answerValue = state.selectedOptionId ?? state.writtenAnswer;
    final startedAt = state.itemShownAt ?? DateTime.now().toIso8601String();

    state = state.copyWith(
      submitStatus: QuestionSubmitStatus.submitting,
      submitError: null,
    );

    try {
      final result = await _repository.submitAttempt(
        bearerToken: bearerToken,
        sessionId: sessionId,
        request: AttemptSubmitRequestModel(
          itemId: question.id,
          answerValue: answerValue,
          startedAt: startedAt,
        ),
      );
      state = state.copyWith(
        submitStatus: QuestionSubmitStatus.submitted,
        attemptResult: result,
      );
    } on AppException catch (e) {
      state = state.copyWith(
        submitStatus: QuestionSubmitStatus.failed,
        submitError: e.message,
      );
    } catch (e) {
      state = state.copyWith(
        submitStatus: QuestionSubmitStatus.failed,
        submitError: 'Failed to submit answer',
      );
    }
  }

  /// Reset state — call before loading a new question.
  void reset() => state = const QuestionSessionState();
}
