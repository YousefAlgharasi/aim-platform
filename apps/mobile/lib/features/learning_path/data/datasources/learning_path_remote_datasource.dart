// Phase 6 — P6-065
// LearningPathRemoteDatasource — abstract interface (data layer).
//
// Scope: Learning path screen only.
//
// Fetches AIM learning path data from the backend. All values (band,
// masteryLevel, coveragePercent, severity, recommendedFocus, action, reason)
// are backend-computed. Flutter must never calculate or infer these locally.
//
// Security rules:
// - studentId is resolved from the JWT on the backend — passed as a URL
//   path parameter only; never constructed from user input.
// - Bearer token is injected by the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';

abstract class LearningPathRemoteDatasource {
  /// GET /aim/students/:studentId/skill-states
  ///
  /// Returns backend-computed AIM skill states for the learning path screen.
  /// [band], [masteryLevel], and [coveragePercent] are never calculated locally.
  Future<List<LearningPathSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  });

  /// GET /aim/students/:studentId/weakness-records
  ///
  /// Returns backend-computed weakness records for the learning path screen.
  /// [severity] and [recommendedFocus] are never calculated locally.
  Future<List<LearningPathWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  });

  /// GET /aim/students/:studentId/recommendations
  ///
  /// Returns backend-computed recommendation cards.
  /// [action] and [reason] are never generated locally.
  Future<List<LearningPathRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  });
}
