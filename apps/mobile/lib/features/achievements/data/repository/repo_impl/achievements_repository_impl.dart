// Phase 13 — TASK-13
// AchievementsRepositoryImpl — data-layer implementation.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/achievements/data/datasources/achievements_remote_datasource.dart';
import 'package:aim_mobile/features/achievements/data/models/achievement_model.dart';
import 'package:aim_mobile/features/achievements/logic/repository/achievements_repository.dart';

class AchievementsRepositoryImpl implements AchievementsRepository {
  const AchievementsRepositoryImpl({
    required AchievementsRemoteDatasource datasource,
  }) : _datasource = datasource;

  final AchievementsRemoteDatasource _datasource;

  @override
  Future<List<AchievementModel>> getAchievements({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getAchievements(bearerToken: bearerToken));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
