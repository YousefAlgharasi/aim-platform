// Phase 6 — P6-110 (skeleton) / P6-111 (placeholder UI)
// Phase 13 — TASK-13 (real backend wiring)
// Achievements feature barrel.
//
// Backend authority: achievement unlocking, badge criteria, XP, streaks,
// and milestone tracking are never computed in Flutter.

export 'data/datasources/achievements_remote_datasource.dart';
export 'data/datasources/achievements_remote_datasource_impl.dart';
export 'data/models/achievement_model.dart';
export 'data/repository/repo_impl/achievements_repository_impl.dart';
export 'logic/entity/achievement.dart';
export 'logic/provider/achievements_notifier.dart';
export 'logic/provider/achievements_provider.dart';
export 'logic/repository/achievements_repository.dart';
export 'ui/pages/achievements_page.dart';
