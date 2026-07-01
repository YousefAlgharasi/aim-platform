// Phase 13 — TASK-13
// Achievements Riverpod providers.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/achievements/data/datasources/achievements_remote_datasource.dart';
import 'package:aim_mobile/features/achievements/data/datasources/achievements_remote_datasource_impl.dart';
import 'package:aim_mobile/features/achievements/data/models/achievement_model.dart';
import 'package:aim_mobile/features/achievements/data/repository/repo_impl/achievements_repository_impl.dart';
import 'package:aim_mobile/features/achievements/logic/repository/achievements_repository.dart';
import 'achievements_notifier.dart';

final achievementsRemoteDatasourceProvider =
    Provider<AchievementsRemoteDatasource>((ref) {
  return AchievementsRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final achievementsRepositoryProvider =
    Provider<AchievementsRepository>((ref) {
  return AchievementsRepositoryImpl(
    datasource: ref.watch(achievementsRemoteDatasourceProvider),
  );
});

final achievementsProvider = StateNotifierProvider<AchievementsNotifier,
    AppAsyncState<List<AchievementModel>>>(
  (ref) => AchievementsNotifier(
    repository: ref.watch(achievementsRepositoryProvider),
  ),
);
