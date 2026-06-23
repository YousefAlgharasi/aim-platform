import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/config/app_config_provider.dart';
import 'package:aim_mobile/core/networking/networking.dart';
import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

/// Builds the [AuthInterceptor] used by the authenticated [BackendApiClient].
///
/// Wires [AuthInterceptor.onUnauthorized] to the backend's `POST
/// /auth/refresh`: on any 401, [BackendApiClient] calls this once with the
/// session's stored refresh token. On success the new tokens are persisted
/// and the new access token is returned so the original request can be
/// retried. On failure (or no stored refresh token) the session is cleared
/// and the user is signed out — the original 401 then surfaces normally.
final authTokenInterceptorProvider = Provider<AuthInterceptor>((ref) {
  return AuthInterceptor(
    () => ref.read(authFlowProvider).accessToken,
    onUnauthorized: () => _refreshSession(ref),
  );
});

Future<String?> _refreshSession(Ref ref) async {
  final store = ref.read(sessionStoreProvider);

  try {
    final session = await store.read();
    if (session == null || session.refreshToken.isEmpty) {
      await _signOut(ref);
      return null;
    }

    final datasource = ref.read(authRemoteDatasourceProvider);
    final refreshed =
        await datasource.refresh(refreshToken: session.refreshToken);

    await store.save(
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      expiresAt: refreshed.expiresAt,
      email: session.email,
    );

    ref.read(authFlowProvider.notifier).signIn(
          session.email,
          accessToken: refreshed.accessToken,
        );

    return refreshed.accessToken;
  } catch (_) {
    await _signOut(ref);
    return null;
  }
}

Future<void> _signOut(Ref ref) async {
  try {
    await ref.read(sessionStoreProvider).clear();
  } catch (_) {
    // Storage failure must not block local auth state cleanup.
  }
  ref.read(authContextProvider.notifier).clearCurrentUser();
  ref.read(authFlowProvider.notifier).signOut();
}

final authenticatedBackendApiClientProvider =
    Provider<BackendApiClient>((ref) {
  return BackendApiClient(
    config: ref.watch(appConfigProvider),
    authInterceptor: ref.watch(authTokenInterceptorProvider),
  );
});
