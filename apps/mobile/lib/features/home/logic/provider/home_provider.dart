// Phase 6 — P6-057
// Home feature Riverpod providers.
//
// Scope: Home screen only.
//
// Registers:
//   homeRemoteDatasourceProvider — datasource
//   homeRepositoryProvider        — repository (use this in notifiers/UI)
//
// HomeNotifier and homeProvider are defined in home_notifier.dart (P6-061).
//
// Security rules:
// - Uses authenticatedBackendApiClientProvider so bearer token is injected
//   automatically; never stored in the datasource.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/home/data/datasources/home_remote_datasource.dart';
import 'package:aim_mobile/features/home/data/datasources/home_remote_datasource_impl.dart';
import 'package:aim_mobile/features/home/data/repository/repo_impl/home_repository_impl.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';

/// Provides the concrete [HomeRemoteDatasource].
/// Consumers should depend on [homeRepositoryProvider] instead.
final homeRemoteDatasourceProvider = Provider<HomeRemoteDatasource>((ref) {
  return HomeRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

/// Provides the [HomeRepository] used by notifiers and pages.
final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepositoryImpl(
    datasource: ref.watch(homeRemoteDatasourceProvider),
  );
});

// Phase 6 — P6-061: HomeNotifier provider
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'home_notifier.dart';

/// App-level home data provider.
///
/// Consumers call [HomeNotifier.load] after sign-in with the studentId from
/// [authContextProvider]. Stays alive for the session so the home page does
/// not reload on every navigation event.
///
/// Security: studentId must come from authContextProvider (JWT-resolved).
final homeProvider =
    StateNotifierProvider<HomeNotifier, AppAsyncState<HomeData>>(
  (ref) => HomeNotifier(
    repository: ref.watch(homeRepositoryProvider),
  ),
);
