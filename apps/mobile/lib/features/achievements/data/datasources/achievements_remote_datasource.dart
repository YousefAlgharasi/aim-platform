// Phase 13 — TASK-13
// AchievementsRemoteDatasource — abstract interface for the backend
// achievements read API.
//
// Scope: Read-only achievement summaries for the authenticated student.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes achievement unlock criteria, badge logic, XP, or
//   milestone tracking. All data comes from the backend-persisted read
//   endpoint.
// - studentId is JWT-resolved by the backend; the endpoint takes no
//   path/query parameters.
// - Bearer token injected from provider layer; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.

import 'package:aim_mobile/features/achievements/data/models/achievement_model.dart';

abstract class AchievementsRemoteDatasource {
  /// GET /student/achievements
  Future<List<AchievementModel>> getAchievements({
    required String bearerToken,
  });
}
