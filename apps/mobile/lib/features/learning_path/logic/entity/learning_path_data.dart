// Phase 6 — P6-067
// LearningPathData — aggregated learning path screen data entity.
//
// Holds all three backend-sourced data sets for the learning path screen.
// All AIM values (band, masteryLevel, coveragePercent, severity,
// recommendedFocus, action, reason) are backend-computed.
// Flutter renders them verbatim; no local computation.

import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

/// Aggregated learning path screen data loaded from the backend.
///
/// A single [LearningPathData] instance drives the entire learning path page.
/// Backend is the sole authority for all AIM values contained within.
class LearningPathData {
  const LearningPathData({
    required this.skillStates,
    required this.weaknessRecords,
    required this.recommendations,
  });

  /// Backend-computed AIM skill state summary cards.
  final List<LearningPathSkillStateModel> skillStates;

  /// Backend-computed weakness record entries.
  final List<LearningPathWeaknessRecordModel> weaknessRecords;

  /// Backend-computed recommendation cards.
  /// Never generated or rewritten by Flutter.
  final List<LearningPathRecommendationModel> recommendations;

  /// True when all three lists are empty (backend returned no data yet).
  bool get isEmpty =>
      skillStates.isEmpty &&
      weaknessRecords.isEmpty &&
      recommendations.isEmpty;
}
