import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/backend_api_client_provider.dart';
import '../../../core/state/app_async_state.dart';
import '../data/datasources/auth_remote_datasource.dart';
import '../data/datasources/auth_remote_datasource_impl.dart';
import '../data/models/auth_context_model.dart';
import '../data/repository/repo_impl/auth_repository_impl.dart';
import '../logic/repository/auth_repository.dart';
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
  ),
);
