import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

/// Manages login form state and the sign-in submission flow.
///
/// Responsibilities:
/// - Validate email/password input.
/// - Call the backend's `POST /auth/login` to obtain a session — the
///   backend is the sole auth authority; this client never talks to
///   Supabase (or any identity provider) directly.
/// - Sync (bootstrap) and load the current user via the backend on success.
/// - Persist the session via [SessionStore] so the user stays signed in.
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
    required AuthRepository repository,
    required Ref ref,
  })  : _repository = repository,
        _ref = ref,
        super(const AppFormState());

  final AuthRepository _repository;
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
  /// 1. Calls the backend's `POST /auth/login` → access/refresh token pair.
  /// 2. Calls backend sync-user (bootstrap) + me via [AuthContextNotifier].
  /// 3. Persists the session to [SessionStore].
  /// 4. Transitions [AuthFlowNotifier] to signedIn.
  Future<void> submit() async {
    if (!state.isValid || state.isSubmitting) return;

    state = state.copyWith(isSubmitting: true, clearError: true);

    try {
      final login = await _repository.login(
        email: _email,
        password: _password,
      );

      final didLoadContext = await _ref
          .read(authContextProvider.notifier)
          .syncAndLoadUser(login.accessToken);

      if (!didLoadContext) {
        final contextState = _ref.read(authContextProvider);
        final errorMessage = contextState is AppAsyncFailure<AuthContextModel>
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
            accessToken: login.accessToken,
            refreshToken: login.refreshToken,
            expiresAt: login.expiresAt,
            email: _email,
          );

      _ref.read(authFlowProvider.notifier).signIn(
            _email,
            accessToken: login.accessToken,
          );

      // State stays isSubmitting=true after success; the UI navigates away.
    } on AppException catch (e) {
      state = state.copyWith(isSubmitting: false, errorMessage: e.message);
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: 'Sign in failed. Please try again.',
      );
    }
  }

  /// Signs in as a fixed student/admin/parent test account via
  /// `POST /auth/test-login`, then follows the exact same post-login flow
  /// as [submit] (sync + load context, persist session, transition
  /// [authFlowProvider]). The backend only serves this route outside
  /// production, so this is a dead end in production builds.
  Future<void> submitTestLogin(String role) async {
    if (state.isSubmitting) return;

    state = state.copyWith(isSubmitting: true, clearError: true);

    try {
      final login = await _repository.loginAsTestUser(role: role);

      final didLoadContext = await _ref
          .read(authContextProvider.notifier)
          .syncAndLoadUser(login.accessToken);

      if (!didLoadContext) {
        final contextState = _ref.read(authContextProvider);
        final errorMessage = contextState is AppAsyncFailure<AuthContextModel>
            ? contextState.message
            : 'Test login failed. Please try again.';
        state = state.copyWith(
          isSubmitting: false,
          errorMessage: errorMessage,
        );
        return;
      }

      await _ref.read(sessionStoreProvider).save(
            accessToken: login.accessToken,
            refreshToken: login.refreshToken,
            expiresAt: login.expiresAt,
            email: login.userEmail,
          );

      _ref.read(authFlowProvider.notifier).signIn(
            login.userEmail,
            accessToken: login.accessToken,
          );
    } on AppException catch (e) {
      state = state.copyWith(isSubmitting: false, errorMessage: e.message);
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: 'Test login failed. Please try again.',
      );
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}
