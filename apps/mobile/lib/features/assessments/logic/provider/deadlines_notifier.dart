// P10-053: DeadlinesNotifier — manages student deadlines screen state.
// Deadline grouping (upcoming/active/late/missed/closed) is backend-derived.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';

class DeadlinesNotifier extends AppStateNotifier<StudentDeadlines> {
  DeadlinesNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final deadlines =
          await _repository.getDeadlines(bearerToken: bearerToken);
      setSuccess(deadlines);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load deadlines',
        code: 'DEADLINES_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({required String bearerToken}) =>
      load(bearerToken: bearerToken);
}
