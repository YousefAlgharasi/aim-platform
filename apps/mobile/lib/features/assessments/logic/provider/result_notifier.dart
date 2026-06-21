// P10-053: ResultNotifier — manages attempt result and history state.
// All grading data is backend-authoritative; Flutter displays as-is.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';

class AttemptResultNotifier extends AppStateNotifier<AttemptResultDetail> {
  AttemptResultNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> load({
    required String bearerToken,
    required String attemptId,
  }) async {
    setLoading();
    try {
      final result = await _repository.getAttemptResult(
        bearerToken: bearerToken,
        attemptId: attemptId,
      );
      setSuccess(result);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load result',
        code: 'RESULT_LOAD_FAILED',
      );
    }
  }
}

class ResultHistoryNotifier extends AppStateNotifier<ResultHistory> {
  ResultHistoryNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> load({
    required String bearerToken,
    required String assessmentId,
  }) async {
    setLoading();
    try {
      final history = await _repository.getResultHistory(
        bearerToken: bearerToken,
        assessmentId: assessmentId,
      );
      setSuccess(history);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load result history',
        code: 'RESULT_HISTORY_LOAD_FAILED',
      );
    }
  }
}
