// P10-053: AssessmentListNotifier — manages assessment list screen state.
// All data is backend-supplied; Flutter never computes deadline status.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';

class AssessmentListNotifier extends AppStateNotifier<List<AssessmentListItem>> {
  AssessmentListNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final items = await _repository.getAssessments(bearerToken: bearerToken);
      setSuccess(items);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load assessments',
        code: 'ASSESSMENTS_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({required String bearerToken}) =>
      load(bearerToken: bearerToken);
}
