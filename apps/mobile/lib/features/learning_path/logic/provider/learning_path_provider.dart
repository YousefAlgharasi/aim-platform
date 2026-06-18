// Phase 6 — P6-066
// Learning path feature Riverpod providers.
//
// Scope: Learning path screen only.
//
// Registers:
//   learningPathRemoteDatasourceProvider — datasource
//   learningPathRepositoryProvider        — repository (use this in
//                                            notifiers/UI)
//
// Security rules:
// - Uses authenticatedBackendApiClientProvider so bearer token is injected
//   automatically; never stored in the datasource.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/learning_path/data/datasources/learning_path_remote_datasource.dart';
import 'package:aim_mobile/features/learning_path/data/datasources/learning_path_remote_datasource_impl.dart';
import 'package:aim_mobile/features/learning_path/data/repository/repo_impl/learning_path_repository_impl.dart';
import 'package:aim_mobile/features/learning_path/logic/repository/learning_path_repository.dart';

/// Provides the concrete [LearningPathRemoteDatasource].
/// Consumers should depend on [learningPathRepositoryProvider] instead.
final learningPathRemoteDatasourceProvider =
    Provider<LearningPathRemoteDatasource>((ref) {
  return LearningPathRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Provides the [LearningPathRepository] used by notifiers and pages.
final learningPathRepositoryProvider = Provider<LearningPathRepository>((ref) {
  return LearningPathRepositoryImpl(
    datasource: ref.watch(learningPathRemoteDatasourceProvider),
  );
});
