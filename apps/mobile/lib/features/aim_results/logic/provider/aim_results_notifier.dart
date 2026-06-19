// Phase 6 — P6-096
// AimResultsNotifier — loads all four AIM result categories in parallel.
//
// Flutter NEVER computes any AIM value. All are backend outputs.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/repository/aim_results_repository.dart';

class AimResultsNotifier extends AppStateNotifier<AimResultsData> {
  AimResultsNotifier({required AimResultsRepository repository})
      : _repository = repository;

  final AimResultsRepository _repository;

  Future<void> load({
    required String bearerToken,
    required String studentId,
  }) async {
    setLoading();
    try {
      final results = await Future.wait<Object>([
        _repository.getSkillStates(
            bearerToken: bearerToken, studentId: studentId),
        _repository.getWeaknessRecords(
            bearerToken: bearerToken, studentId: studentId),
        _repository.getRecommendations(
            bearerToken: bearerToken, studentId: studentId),
        _repository.getReviewSchedules(
            bearerToken: bearerToken, studentId: studentId),
      ]);

      setSuccess(AimResultsData(
        skillStates: results[0] as List<AimSkillStateModel>,
        weaknessRecords: results[1] as List<AimWeaknessRecordModel>,
        recommendations: results[2] as List<AimRecommendationModel>,
        reviewSchedules: results[3] as List<AimReviewScheduleModel>,
      ));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load AIM results',
        code: 'AIM_RESULTS_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({
    required String bearerToken,
    required String studentId,
  }) =>
      load(bearerToken: bearerToken, studentId: studentId);

  void clear() => reset();
}
