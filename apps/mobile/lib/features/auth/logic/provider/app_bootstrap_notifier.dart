import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_flow_provider.dart';

/// Represents the state of the app bootstrap / session-restore check.
///
/// The app starts in [AppBootstrapStatus.checking] while it determines
/// whether a prior session is still valid.  Once resolved it transitions to
/// [AppBootstrapStatus.done] and [authFlowProvider] is updated accordingly.
enum AppBootstrapStatus { checking, done }

/// Drives the initial session-restore check on app launch.
///
/// On creation the notifier immediately begins the async session check.
/// When the check finishes it calls [AuthFlowNotifier.completeBootstrap]
/// (no session found) or [AuthFlowNotifier.signIn] (session restored).
///
/// Phase 6 MVP: Supabase session persistence is not yet integrated.
/// The notifier performs a short async delay to simulate the check and then
/// transitions to signedOut.  When the Supabase Flutter SDK is added in a
/// later phase, replace [checkSession] with a real token-refresh call.
///
/// Security:
/// - The notifier never decides authorisation — it only restores an existing
///   Supabase session token and hands it to [authFlowProvider].
/// - No credentials are stored or logged here.
class AppBootstrapNotifier extends StateNotifier<AppBootstrapStatus> {
  AppBootstrapNotifier(this._ref) : super(AppBootstrapStatus.checking) {
    checkSession();
  }

  final Ref _ref;

  /// Performs the session-restore check.
  ///
  /// Overridable in tests to inject deterministic outcomes without async delays.
  Future<void> checkSession() async {
    try {
      // Phase 6 MVP stub: no Supabase SDK persistence yet.
      // A real implementation would call
      //   await Supabase.instance.client.auth.refreshSession()
      // and, on success, call authFlowProvider.notifier.signIn(email, accessToken: token).
      // For now we complete the bootstrap immediately with no session.
      await Future<void>.microtask(() {});
      _ref.read(authFlowProvider.notifier).completeBootstrap();
    } catch (_) {
      // Any unexpected error still resolves the gate to signedOut so the
      // user is not stuck on the splash screen.
      _ref.read(authFlowProvider.notifier).completeBootstrap();
    } finally {
      if (mounted) {
        state = AppBootstrapStatus.done;
      }
    }
  }
}
