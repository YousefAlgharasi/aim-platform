// Phase 13 — TASK-13
// AchievementsNotifier — manages the achievements screen state.
//
// Scope: Achievements screen only.
//
// Security rules:
// - studentId is resolved server-side from the JWT; Flutter never passes it.
// - Flutter never computes achievement unlock criteria, XP, or milestones.
// - Bearer token sourced from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/achievements/data/models/achievement_model.dart';
import 'package:aim_mobile/features/achievements/logic/repository/achievements_repository.dart';

class AchievementsNotifier extends AppStateNotifier<List<AchievementModel>> {
  AchievementsNotifier({required AchievementsRepository repository})
      : _repository = repository;

  final AchievementsRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final achievements =
          await _repository.getAchievements(bearerToken: bearerToken);
      setSuccess(achievements);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load achievements',
        code: 'ACHIEVEMENTS_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({required String bearerToken}) =>
      load(bearerToken: bearerToken);
}
