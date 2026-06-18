import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/session/session.dart';
import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

/// Represents the state of the app bootstrap / session-restore check.
enum AppBootstrapStatus { checking, done }

/// Drives the initial session-restore check on app launch.
///
/// On creation the notifier reads any persisted session from [SessionStore].
/// - If a token is found → [AuthFlowNotifier.signIn] is called so the user
///   is taken directly to the main shell without re-authenticating.
/// - If no token is found → [AuthFlowNotifier.completeBootstrap] transitions
///   to signedOut and the auth gate routes to the sign-in page.
///
/// A real Supabase token refresh (to verify the persisted token is still
/// valid) can be added inside [checkSession] when the Supabase Flutter SDK
/// is integrated.
///
/// Security:
/// - The notifier reads the token from [SessionStore] (OS-level secure
///   storage — Keychain on iOS, EncryptedSharedPreferences on Android).
/// - The token is passed to [authFlowProvider] only; it is never logged
///   or exposed to any other layer.
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

      if (session != null && session.accessToken.isNotEmpty) {
        // Restore the prior session — navigate directly to main shell.
        _ref.read(authFlowProvider.notifier).signIn(
              session.email,
              accessToken: session.accessToken,
            );
      } else {
        // No persisted session — go to sign-in.
        _ref.read(authFlowProvider.notifier).completeBootstrap();
      }
    } catch (_) {
      // Any storage error must not block the user — fall back to sign-in.
      _ref.read(authFlowProvider.notifier).completeBootstrap();
    } finally {
      if (mounted) {
        state = AppBootstrapStatus.done;
      }
    }
  }
}
