// P10-053: AssessmentDetailNotifier — manages assessment detail screen state.
// All data is backend-supplied; Flutter displays as-is.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';

class AssessmentDetailNotifier extends AppStateNotifier<AssessmentDetail> {
  AssessmentDetailNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> load({
    required String bearerToken,
    required String assessmentId,
  }) async {
    setLoading();
    try {
      final detail = await _repository.getAssessmentDetail(
        bearerToken: bearerToken,
        assessmentId: assessmentId,
      );
      setSuccess(detail);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load assessment detail',
        code: 'ASSESSMENT_DETAIL_LOAD_FAILED',
      );
    }
  }
}
