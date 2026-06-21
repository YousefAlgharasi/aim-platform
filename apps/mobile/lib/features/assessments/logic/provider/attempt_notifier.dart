// P10-053: AttemptNotifier — manages attempt lifecycle state.
// Start, resume, submit are backend operations. Flutter never computes
// scoring, correctness, or attempt eligibility.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';

class StartAttemptNotifier extends AppStateNotifier<StartAttemptResult> {
  StartAttemptNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> start({
    required String bearerToken,
    required String assessmentId,
  }) async {
    setLoading();
    try {
      final result = await _repository.startAttempt(
        bearerToken: bearerToken,
        assessmentId: assessmentId,
      );
      setSuccess(result);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to start attempt',
        code: 'START_ATTEMPT_FAILED',
      );
    }
  }
}

class ResumeAttemptNotifier extends AppStateNotifier<ResumeAttemptResult> {
  ResumeAttemptNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> resume({
    required String bearerToken,
    required String attemptId,
  }) async {
    setLoading();
    try {
      final result = await _repository.resumeAttempt(
        bearerToken: bearerToken,
        attemptId: attemptId,
      );
      setSuccess(result);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to resume attempt',
        code: 'RESUME_ATTEMPT_FAILED',
      );
    }
  }
}

class SubmitAttemptNotifier extends AppStateNotifier<SubmitAttemptResult> {
  SubmitAttemptNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> submit({
    required String bearerToken,
    required String attemptId,
  }) async {
    setLoading();
    try {
      final result = await _repository.submitAttempt(
        bearerToken: bearerToken,
        attemptId: attemptId,
      );
      setSuccess(result);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to submit attempt',
        code: 'SUBMIT_ATTEMPT_FAILED',
      );
    }
  }
}
