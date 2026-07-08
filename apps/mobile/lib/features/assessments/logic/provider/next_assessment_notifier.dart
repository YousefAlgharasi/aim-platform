// NextAssessmentNotifier — the single "current" assessment shown on Home.
// All data is backend-supplied; Flutter never computes eligibility/unlock
// state locally (see GET /student/assessments/next).

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/repository/assessment_repository.dart';

class NextAssessmentNotifier extends AppStateNotifier<AssessmentListItem?> {
  NextAssessmentNotifier({required AssessmentRepository repository})
      : _repository = repository;

  final AssessmentRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final item = await _repository.getNextAssessment(bearerToken: bearerToken);
      setSuccess(item);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load current assessment',
        code: 'NEXT_ASSESSMENT_LOAD_FAILED',
      );
    }
  }
}
