// Phase 6 — P6-096
// AimResultsData — aggregated AIM results screen entity.
//
// All fields are backend-computed. Flutter renders verbatim.

import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';

class AimResultsData {
  const AimResultsData({
    required this.skillStates,
    required this.weaknessRecords,
    required this.recommendations,
    required this.reviewSchedules,
  });

  final List<AimSkillStateModel> skillStates;
  final List<AimWeaknessRecordModel> weaknessRecords;
  final List<AimRecommendationModel> recommendations;
  final List<AimReviewScheduleModel> reviewSchedules;

  bool get isEmpty =>
      skillStates.isEmpty &&
      weaknessRecords.isEmpty &&
      recommendations.isEmpty &&
      reviewSchedules.isEmpty;
}
