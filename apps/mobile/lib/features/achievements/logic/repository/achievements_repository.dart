// Phase 13 — TASK-13
// AchievementsRepository — abstract interface (logic layer).
//
// Read-only. Flutter NEVER computes achievement unlock criteria, XP, or
// milestone tracking. All values come from the backend.

import 'package:aim_mobile/features/achievements/data/models/achievement_model.dart';

abstract class AchievementsRepository {
  Future<List<AchievementModel>> getAchievements({
    required String bearerToken,
  });
}
