// Phase 6 — P6-066
// LearningPathRepository — abstract interface (logic layer).
//
// Scope: Learning path screen only.
//
// Security rules:
// - Flutter never calculates band, masteryLevel, coveragePercent, severity,
//   recommendedFocus, action, or reason. All AIM values come from the
//   backend verbatim.
// - studentId is resolved from the JWT on the backend — passed as a URL
//   path parameter sourced from authContextProvider, never from user input.
// - Bearer token is passed from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.

import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

abstract class LearningPathRepository {
  /// Fetch AIM skill states for the learning path screen.
  /// [band], [masteryLevel], and [coveragePercent] are backend-computed.
  Future<List<LearningPathSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch weakness records for the learning path screen.
  /// [severity] and [recommendedFocus] are backend-computed.
  Future<List<LearningPathWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch recommendation cards for the learning path screen.
  /// [action] and [reason] are backend-computed; never generated locally.
  Future<List<LearningPathRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  });
}
