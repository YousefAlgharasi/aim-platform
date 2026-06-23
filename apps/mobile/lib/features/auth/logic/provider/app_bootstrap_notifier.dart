import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

/// Represents the state of the app bootstrap / session-restore check.
enum AppBootstrapStatus { checking, done }

/// How long before [SessionData.expiresAt] we proactively refresh, so a
/// request made right after bootstrap doesn't race against expiry.
const _refreshSkewSeconds = 5 * 60;

/// Drives the initial session-restore check on app launch.
///
/// On creation the notifier reads any persisted session from [SessionStore].
/// - If the persisted access token is still valid (more than
///   [_refreshSkewSeconds] from expiry) → sign in directly with it.
/// - If the persisted access token is expired or close to expiring → call
///   the backend's `POST /auth/refresh` with the stored refresh token.
///   - On success: persist the new tokens and sign in.
///   - On failure: clear the session and fall back to signed-out.
/// - If no session is found → [AuthFlowNotifier.completeBootstrap]
///   transitions to signedOut and the auth gate routes to the sign-in page.
///
/// The backend (NestJS, services/backend-api) is the sole auth authority;
/// this notifier never talks to Supabase or any other identity provider.
///
/// Security:
/// - The notifier reads tokens from [SessionStore] (OS-level secure
///   storage — Keychain on iOS, EncryptedSharedPreferences on Android).
/// - Tokens are passed to [authFlowProvider] only; never logged or exposed
///   to any other layer.
/// - No credentials are hardcoded here.
class AppBootstrapNotifier extends StateNotifier<AppBootstrapStatus> {
  AppBootstrapNotifier(this._ref) : super(AppBootstrapStatus.checking) {
    checkSession();
  }

  final Ref _ref;

  /// Performs the session-restore check.
  ///
  /// Overridable in tests to inject deterministic outcomes without touching
  /// device storage.
  Future<void> checkSession() async {
    try {
      final store = _ref.read(sessionStoreProvider);
      final session = await store.read();
      if (!mounted) return;

      if (session == null || session.accessToken.isEmpty) {
        // No persisted session — go to sign-in.
        _ref.read(authFlowProvider.notifier).completeBootstrap();
        return;
      }

      final nowSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      final isExpiringSoon =
          session.expiresAt - nowSeconds <= _refreshSkewSeconds;

      if (!isExpiringSoon) {
        // Token still has plenty of life left — restore directly.
        _ref.read(authFlowProvider.notifier).signIn(
              session.email,
              accessToken: session.accessToken,
            );
        return;
      }

      // Token is expired or about to expire — attempt a refresh.
      if (session.refreshToken.isEmpty) {
        await store.clear();
        if (!mounted) return;
        _ref.read(authFlowProvider.notifier).completeBootstrap();
        return;
      }

      try {
        final datasource = _ref.read(authRemoteDatasourceProvider);
        final refreshed =
            await datasource.refresh(refreshToken: session.refreshToken);

        await store.save(
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          expiresAt: refreshed.expiresAt,
          email: session.email,
        );
        if (!mounted) return;

        _ref.read(authFlowProvider.notifier).signIn(
              session.email,
              accessToken: refreshed.accessToken,
            );
      } catch (_) {
        // Refresh failed — the session is no longer valid.
        await store.clear();
        if (!mounted) return;
        _ref.read(authFlowProvider.notifier).completeBootstrap();
      }
    } catch (_) {
      if (!mounted) return;
      // Any storage error must not block the user — fall back to sign-in.
      _ref.read(authFlowProvider.notifier).completeBootstrap();
    } finally {
      if (mounted) {
        state = AppBootstrapStatus.done;
      }
    }
  }
}
