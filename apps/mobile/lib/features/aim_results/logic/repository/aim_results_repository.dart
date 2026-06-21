// Phase 6 — P6-096
// AimResultsRepository — abstract interface (logic layer).
//
// Read-only. Flutter NEVER computes mastery, weakness, difficulty,
// recommendations, or review schedule. All values come from the backend.

import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';

abstract class AimResultsRepository {
  Future<List<AimSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  });

  Future<List<AimWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  });

  Future<List<AimRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  });

  Future<List<AimReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  });
}
