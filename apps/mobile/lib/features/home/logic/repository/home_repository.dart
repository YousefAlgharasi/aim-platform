// Phase 6 — P6-057
// HomeRepository — abstract interface (logic layer).
//
// Scope: Home screen only.
//
// Security rules:
// - Flutter never calculates mastery, band, severity, priority, action, or
//   reason. All AIM values come from the backend verbatim.
// - studentId is resolved from the JWT on the backend — passed as a URL path
//   parameter sourced from authContextProvider, never from user input.
// - Bearer token is passed from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.

import 'package:aim_mobile/features/home/data/models/home_models.dart';

abstract class HomeRepository {
  /// Fetch AIM skill state summary cards.
  /// All [band] and [masteryLevel] values are backend-computed.
  Future<List<HomeSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch weakness strip entries.
  /// [severity] is backend-computed.
  Future<List<HomeWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch review schedule reminders.
  /// [priority] and [dueAt] are backend-computed.
  Future<List<HomeReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  });

  /// Fetch recommendation cards.
  /// [action] and [reason] are backend-computed; never generated locally.
  Future<List<HomeRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  });
}
