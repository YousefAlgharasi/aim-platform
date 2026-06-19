// Phase 6 — P6-096
// AIM results Riverpod providers.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_token_interceptor_provider.dart';
import 'package:aim_mobile/features/aim_results/data/datasources/aim_results_remote_datasource.dart';
import 'package:aim_mobile/features/aim_results/data/datasources/aim_results_remote_datasource_impl.dart';
import 'package:aim_mobile/features/aim_results/data/repository/repo_impl/aim_results_repository_impl.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/repository/aim_results_repository.dart';
import 'aim_results_notifier.dart';

final aimResultsRemoteDatasourceProvider =
    Provider<AimResultsRemoteDatasource>((ref) {
  return AimResultsRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final aimResultsRepositoryProvider =
    Provider<AimResultsRepository>((ref) {
  return AimResultsRepositoryImpl(
    datasource: ref.watch(aimResultsRemoteDatasourceProvider),
  );
});

final aimResultsProvider =
    StateNotifierProvider<AimResultsNotifier, AppAsyncState<AimResultsData>>(
  (ref) => AimResultsNotifier(
    repository: ref.watch(aimResultsRepositoryProvider),
  ),
);
