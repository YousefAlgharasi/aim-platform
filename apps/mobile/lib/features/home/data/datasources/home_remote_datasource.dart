// Phase 6 — P6-060
// HomeRemoteDatasource — abstract interface (data layer).
//
// Scope: Home screen only.
//
// Fetches AIM home screen data from the backend. All values (masteryLevel,
// band, severity, priority, action, reason) are backend-computed. Flutter
// must never calculate or infer these fields locally.
//
// Security rules:
// - studentId is resolved from the JWT on the backend — never constructed
//   or sent as a body param. It is passed as a path parameter only.
// - Bearer token is injected by the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/home/data/models/home_models.dart';

abstract class HomeRemoteDatasource {
  /// GET /aim/students/:studentId/skill-states
  ///
  /// Returns backend-computed AIM skill state cards for the home screen.
  /// [masteryLevel] and [band] are never calculated locally.
  Future<List<HomeSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  });

  /// GET /aim/students/:studentId/weakness-records
  ///
  /// Returns backend-computed weakness strip entries.
  /// [severity] is never calculated locally.
  Future<List<HomeWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  });

  /// GET /aim/students/:studentId/review-schedules
  ///
  /// Returns backend-computed review reminders.
  /// [priority] and [dueAt] are never calculated locally.
  Future<List<HomeReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  });

  /// GET /aim/students/:studentId/recommendations
  ///
  /// Returns backend-computed recommendation cards.
  /// [action] and [reason] are never generated locally.
  Future<List<HomeRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  });
}
