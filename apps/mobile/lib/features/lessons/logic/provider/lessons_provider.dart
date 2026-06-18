// Phase 6 — P6-072
// lessons_provider.dart — Riverpod providers for the lessons feature.
//
// Scope: Lessons / curriculum browser only.
//
// Registers:
//   lessonsRemoteDatasourceProvider — datasource
//   lessonsRepositoryProvider        — repository (use this in notifiers/UI)
//
// Security rules:
// - Uses authenticatedBackendApiClientProvider so bearer token is injected
//   automatically; never stored in the datasource or repository.
// - levelId and chapterId are always sourced from prior backend responses;
//   never from user input.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lessons_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lessons_remote_datasource_impl.dart';
import 'package:aim_mobile/features/lessons/data/repository/repo_impl/lessons_repository_impl.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

/// Provides the concrete [LessonsRemoteDatasource].
/// Consumers should depend on [lessonsRepositoryProvider] instead.
final lessonsRemoteDatasourceProvider =
    Provider<LessonsRemoteDatasource>((ref) {
  return LessonsRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Provides the [LessonsRepository] used by notifiers and pages.
///
/// Security: all IDs (levelId, chapterId) passed to repository methods must
/// come from prior backend responses — never from user input.
final lessonsRepositoryProvider = Provider<LessonsRepository>((ref) {
  return LessonsRepositoryImpl(
    datasource: ref.watch(lessonsRemoteDatasourceProvider),
  );
});
