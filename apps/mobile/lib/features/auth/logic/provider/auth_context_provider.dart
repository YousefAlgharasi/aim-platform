import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/backend_api_client_provider.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:aim_mobile/features/auth/data/datasources/auth_remote_datasource_impl.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/repository/repo_impl/auth_repository_impl.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'auth_context_notifier.dart';

final authRemoteDatasourceProvider = Provider<AuthRemoteDatasource>((ref) {
  return AuthRemoteDatasourceImpl(
    apiClient: ref.watch(backendApiClientProvider),
  );
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    datasource: ref.watch(authRemoteDatasourceProvider),
  );
});

final authContextProvider =
    StateNotifierProvider<AuthContextNotifier, AppAsyncState<AuthContextModel>>(
  (ref) => AuthContextNotifier(
    repository: ref.watch(authRepositoryProvider),
    ref: ref,
  ),
);
