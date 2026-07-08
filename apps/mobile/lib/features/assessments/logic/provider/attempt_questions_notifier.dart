// AttemptQuestionsNotifier — loads the question list for an active
// assessment attempt. Flutter never computes correctness or scoring;
// questions and options are displayed verbatim from the backend.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';

class AttemptQuestionsNotifier extends AppStateNotifier<List<AttemptQuestion>> {
  AttemptQuestionsNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> load({
    required String bearerToken,
    required String attemptId,
  }) async {
    setLoading();
    try {
      final result = await _repository.getAttemptQuestions(
        bearerToken: bearerToken,
        attemptId: attemptId,
      );
      setSuccess(result);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load questions',
        code: 'LOAD_QUESTIONS_FAILED',
      );
    }
  }
}

class SubmitAnswerNotifier extends AppStateNotifier<SubmittedAnswer> {
  SubmitAnswerNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> submit({
    required String bearerToken,
    required String attemptId,
    required String assessmentQuestionLinkId,
    required String responseValue,
  }) async {
    setLoading();
    try {
      final result = await _repository.submitAnswer(
        bearerToken: bearerToken,
        attemptId: attemptId,
        assessmentQuestionLinkId: assessmentQuestionLinkId,
        responseValue: responseValue,
      );
      setSuccess(result);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to submit answer',
        code: 'SUBMIT_ANSWER_FAILED',
      );
    }
  }
}
