import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/config/app_config_provider.dart';
import 'package:aim_mobile/core/networking/networking.dart';
import 'auth_flow_provider.dart';

final authTokenInterceptorProvider = Provider<AuthInterceptor>((ref) {
  return AuthInterceptor(() => ref.read(authFlowProvider).accessToken);
});

final authenticatedBackendApiClientProvider =
    Provider<BackendApiClient>((ref) {
  return BackendApiClient(
    config: ref.watch(appConfigProvider),
    authInterceptor: ref.watch(authTokenInterceptorProvider),
  );
});
