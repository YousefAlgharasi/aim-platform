// Phase 6 — P6-095
// AimResultsRemoteDatasource — abstract interface for all backend AIM result
// read APIs (P5-068..P5-072).
//
// Scope: Read-only AIM outputs — skill states, weakness records,
// recommendations, and review schedules for the authenticated student.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER calls the AIM Engine. All data comes from backend-persisted
//   read endpoints that surface last-validated AIM outputs only.
// - studentId is JWT-resolved by the backend. Flutter passes it as sourced
//   from authContextProvider; never from user input.
// - All returned values are read-only AIM Engine outputs. Flutter never
//   mutates them.
// - Bearer token injected from provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.

import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';

abstract class AimResultsRemoteDatasource {
  /// GET /aim/students/:studentId/skill-states (P5-069)
  Future<List<AimSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  });

  /// GET /aim/students/:studentId/weakness-records (P5-070)
  Future<List<AimWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  });

  /// GET /aim/students/:studentId/recommendations (P5-071)
  Future<List<AimRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  });

  /// GET /aim/students/:studentId/review-schedules (P5-072)
  Future<List<AimReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  });
}
