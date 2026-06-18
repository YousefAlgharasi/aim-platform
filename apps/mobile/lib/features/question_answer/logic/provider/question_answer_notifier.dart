// Phase 6 — P6-088
// QuestionAnswerNotifier — manages question/answer screen state.
//
// Scope: Q/A session screen only.
//
// State machine:
//   idle → loading (loadQuestion) → success(question) → submitting
//   → success(result) or error
//
// Security rules:
// - questionId and sessionId are always backend-supplied.
// - Flutter never evaluates isCorrect locally.
// - isCorrect in AttemptResult is for display only — never for scoring.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/attempt_result.dart';
import 'package:aim_mobile/features/question_answer/logic/entity/question.dart';
import 'package:aim_mobile/features/question_answer/logic/repository/question_answer_repository.dart';

sealed class QuestionAnswerScreenState {}
class QAIdle extends QuestionAnswerScreenState {}
class QALoadingQuestion extends QuestionAnswerScreenState {}
class QAQuestionLoaded extends QuestionAnswerScreenState {
  QAQuestionLoaded(this.question);
  final Question question;
}
class QASubmitting extends QuestionAnswerScreenState {
  QASubmitting(this.question);
  final Question question;
}
class QAResultReceived extends QuestionAnswerScreenState {
  QAResultReceived({required this.question, required this.result});
  final Question question;
  final AttemptResult result;
}
class QAError extends QuestionAnswerScreenState {
  QAError({required this.message, this.code});
  final String message;
  final String? code;
}

class QuestionAnswerNotifier
    extends AppStateNotifier<QuestionAnswerScreenState> {
  QuestionAnswerNotifier({required QuestionAnswerRepository repository})
      : _repository = repository {
    state = AppAsyncState.success(QAIdle());
  }

  final QuestionAnswerRepository _repository;

  Future<void> loadQuestion({
    required String bearerToken,
    required String questionId,
  }) async {
    setSuccess(QALoadingQuestion());
    try {
      final question = await _repository.getQuestion(
        bearerToken: bearerToken,
        questionId: questionId,
      );
      setSuccess(QAQuestionLoaded(question));
    } on AppException catch (e) {
      setSuccess(QAError(message: e.message, code: e.code));
    } catch (e) {
      setSuccess(QAError(message: 'Failed to load question', code: 'QUESTION_LOAD_FAILED'));
    }
  }

  Future<void> submitAnswer({
    required String bearerToken,
    required String sessionId,
    required String itemId,
    required String answerValue,
    required String startedAt,
    required Question question,
  }) async {
    setSuccess(QASubmitting(question));
    try {
      final result = await _repository.submitAttempt(
        bearerToken: bearerToken,
        sessionId: sessionId,
        request: AttemptSubmitRequestModel(
          itemId: itemId,
          answerValue: answerValue,
          startedAt: startedAt,
        ),
      );
      setSuccess(QAResultReceived(question: question, result: result));
    } on AppException catch (e) {
      setSuccess(QAError(message: e.message, code: e.code));
    } catch (e) {
      setSuccess(QAError(message: 'Failed to submit answer', code: 'ATTEMPT_SUBMIT_FAILED'));
    }
  }

  void reset() => setSuccess(QAIdle());
}
