// Phase 6 — P6-061
// HomeData — aggregated home screen data entity.
//
// Holds all four backend-sourced data sets for the home screen.
// All AIM values (band, masteryLevel, severity, priority, action, reason)
// are backend-computed. Flutter renders them verbatim; no local computation.

import 'package:aim_mobile/features/home/data/models/home_models.dart';

/// Aggregated home screen data loaded from the backend.
///
/// A single [HomeData] instance drives the entire home page UI.
/// Backend is the sole authority for all AIM values contained within.
class HomeData {
  const HomeData({
    required this.skillStates,
    required this.weaknessRecords,
    required this.reviewSchedules,
    required this.recommendations,
  });

  /// Backend-computed skill state summary cards.
  final List<HomeSkillStateModel> skillStates;

  /// Backend-computed weakness strip entries.
  final List<HomeWeaknessRecordModel> weaknessRecords;

  /// Backend-computed review schedule reminders.
  final List<HomeReviewScheduleModel> reviewSchedules;

  /// Backend-computed recommendation cards.
  /// Never generated or rewritten by Flutter.
  final List<HomeRecommendationModel> recommendations;

  /// True when all four lists are empty (backend returned no data yet).
  bool get isEmpty =>
      skillStates.isEmpty &&
      weaknessRecords.isEmpty &&
      reviewSchedules.isEmpty &&
      recommendations.isEmpty;
}
