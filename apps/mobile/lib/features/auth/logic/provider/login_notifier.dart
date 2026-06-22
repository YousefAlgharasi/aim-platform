import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/features/auth/data/datasources/supabase_auth_datasource.dart';
import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

/// Manages login form state and the sign-in submission flow.
///
/// Responsibilities:
/// - Validate email/password input.
/// - Call Supabase Auth to get a bearer token.
/// - Sync and load the current user via the backend on success.
/// - Persist the token via [SessionStore] so the user stays signed in.
/// - Transition the global [authFlowProvider] to signedIn on success.
///
/// Backend is the final authority for identity, roles, and permissions.
/// This notifier only initiates the auth flow; it never decides
/// authorization itself.
///
/// Security:
/// - The token is written to the OS-level secure store only after the
///   backend has confirmed the identity via [syncAndLoadUser].
/// - No service-role keys, JWT secrets, or AI provider keys are handled here.
class LoginNotifier extends StateNotifier<AppFormState> {
  LoginNotifier({
    required SupabaseAuthDatasource supabaseDatasource,
    required Ref ref,
  })  : _supabaseDatasource = supabaseDatasource,
        _ref = ref,
        super(const AppFormState());

  final SupabaseAuthDatasource _supabaseDatasource;
  final Ref _ref;

  String _email = '';
  String _password = '';

  void setEmail(String value) {
    _email = value.trim();
    _revalidate();
  }

  void setPassword(String value) {
    _password = value;
    _revalidate();
  }

  void _revalidate() {
    final isValid =
        _email.contains('@') && _email.length > 3 && _password.length >= 6;
    state = state.copyWith(isValid: isValid, clearError: true);
  }

  /// Submits the login form.
  ///
  /// 1. Signs in with Supabase Auth → gets bearer token.
  /// 2. Calls backend sync-user + me via [AuthContextNotifier].
  /// 3. Persists the token to [SessionStore].
  /// 4. Transitions [AuthFlowNotifier] to signedIn.
  Future<void> submit() async {
    if (!state.isValid || state.isSubmitting) return;

    state = state.copyWith(isSubmitting: true, clearError: true);

    try {
      final token = await _supabaseDatasource.signInWithEmailPassword(
        email: _email,
        password: _password,
      );

      final didLoadContext =
          await _ref.read(authContextProvider.notifier).syncAndLoadUser(token);

      if (!didLoadContext) {
        final contextState = _ref.read(authContextProvider);
        final errorMessage = contextState is AppAsyncFailure
            ? contextState.message
            : 'Sign in failed. Please try again.';
        state = state.copyWith(
          isSubmitting: false,
          errorMessage: errorMessage,
        );
        return;
      }

      // Persist session so the user stays signed in across app restarts.
      await _ref.read(sessionStoreProvider).save(
            accessToken: token,
            email: _email,
          );

      _ref.read(authFlowProvider.notifier).signIn(
            _email,
            accessToken: token,
          );

      // State stays isSubmitting=true after success; the UI navigates away.
    } on AppException catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.message,
      );
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: 'Sign in failed. Please try again.',
      );
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}
