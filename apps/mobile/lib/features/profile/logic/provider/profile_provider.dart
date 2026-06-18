import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/logic/provider/auth_token_interceptor_provider.dart';
import '../../../../core/state/app_async_state.dart';
import '../../data/datasources/profile_remote_datasource.dart';
import '../../data/datasources/profile_remote_datasource_impl.dart';
import '../../data/models/profile_me_response_model.dart';
import '../../data/repository/repo_impl/profile_repository_impl.dart';
import '../repository/profile_repository.dart';
import 'profile_notifier.dart';

final profileRemoteDatasourceProvider =
    Provider<ProfileRemoteDatasource>((ref) {
  return ProfileRemoteDatasourceImpl(
    apiClient: ref.watch(authenticatedBackendApiClientProvider),
  );
});

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  return ProfileRepositoryImpl(
    datasource: ref.watch(profileRemoteDatasourceProvider),
  );
});

final profileProvider = StateNotifierProvider<ProfileNotifier,
    AppAsyncState<ProfileMeResponseModel>>(
  (ref) => ProfileNotifier(
    repository: ref.watch(profileRepositoryProvider),
  ),
);
