import 'dart:developer';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:url_launcher/url_launcher.dart';

import 'package:aim_mobile/core/config/app_config_provider.dart';
import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/logging/app_logger.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';

import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
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

  static final RegExp _emailRegex = RegExp(
    r'^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$',
  );

  static bool isValidEmail(String email) {
    final trimmed = email.trim();
    if (trimmed.isEmpty) return false;
    return _emailRegex.hasMatch(trimmed);
  }

  void setEmail(String value) {
    _email = value.trim();
    _revalidate();
  }

  void setPassword(String value) {
    _password = value;
    _revalidate();
  }

  void _revalidate() {
    final isValid = isValidEmail(_email) && _password.length >= 6;
    final updatedFieldErrors = Map<String, String>.from(state.fieldErrors);
    if (_email.isNotEmpty && !isValidEmail(_email)) {
      updatedFieldErrors['email'] = 'invalid_email';
    } else {
      updatedFieldErrors.remove('email');
    }
    if (_password.isNotEmpty && _password.length < 6) {
      updatedFieldErrors['password'] = 'too_short';
    } else {
      updatedFieldErrors.remove('password');
    }
    state = state.copyWith(
      isValid: isValid,
      clearError: true,
      fieldErrors: updatedFieldErrors,
    );
  }

  /// Submits the login form.
  ///
  /// 1. Validates email structure and password length.
  /// 2. Calls the backend's `POST /auth/login` → access/refresh token pair.
  /// 3. Calls backend sync-user (bootstrap) + me via [AuthContextNotifier].
  /// 4. Persists the session to [SessionStore].
  /// 5. Transitions [AuthFlowNotifier] to signedIn.
  Future<void> submit(AppLocalizations l10n) async {
    final fieldErrors = <String, String>{};
    if (_email.isEmpty) {
      fieldErrors['email'] = l10n.authEmailRequired;
    } else if (!isValidEmail(_email)) {
      fieldErrors['email'] = l10n.authEmailInvalid;
    }

    if (_password.isEmpty) {
      fieldErrors['password'] = l10n.authPasswordRequired;
    } else if (_password.length < 6) {
      fieldErrors['password'] = l10n.authPasswordMinSix;
    }

    if (fieldErrors.isNotEmpty) {
      state = state.copyWith(
        fieldErrors: fieldErrors,
        isSubmitting: false,
      );
      return;
    }

    if (state.isSubmitting) return;

    state = state.copyWith(
      isSubmitting: true,
      clearError: true,
      clearFieldErrors: true,
    );

    try {
      final login = await _repository.login(
        email: _email,
        password: _password,
      );

      final didLoadContext = await _ref
          .read(authContextProvider.notifier)
          .syncAndLoadUser(login.accessToken, l10n: l10n);

      if (!didLoadContext) {
        final contextState = _ref.read(authContextProvider);
        final errorMessage = contextState is AppAsyncFailure<AuthContext>
            ? contextState.message
            : l10n.authSignInFailedGeneric;
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
      log('Login failed: ${e.message}');
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.message,
      );
    } catch (e) {
      log('Login failed: Unknown error');
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: l10n.authSignInFailedGeneric,
      );
    }
  }

  /// Signs in as a fixed student/admin/parent test account via
  /// `POST /auth/test-login`, then follows the exact same post-login flow
  /// as [submit] (sync + load context, persist session, transition
  /// [authFlowProvider]). The backend only serves this route outside
  /// production, so this is a dead end in production builds.
  Future<void> submitTestLogin(String role, AppLocalizations l10n) async {
    if (state.isSubmitting) return;

    state = state.copyWith(isSubmitting: true, clearError: true);

    try {
      final login = await _repository.loginAsTestUser(role: role);

      final didLoadContext = await _ref
          .read(authContextProvider.notifier)
          .syncAndLoadUser(login.accessToken, l10n: l10n);

      if (!didLoadContext) {
        final contextState = _ref.read(authContextProvider);
        final errorMessage = contextState is AppAsyncFailure<AuthContext>
            ? contextState.message
            : l10n.authTestLoginFailedGeneric;
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
        errorMessage: l10n.authTestLoginFailedGeneric,
      );
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true, clearFieldErrors: true);
  }

  /// Triggers real Google Sign-In SDK, gets ID token, calls `POST /auth/google`,
  /// bootstraps user context, saves session, and transitions to signedIn state.
  /// If native Google Sign-In fails or is unavailable on the platform, opens
  /// Supabase OAuth directly in the browser.
  Future<void> submitGoogleLogin(
    AppLocalizations l10n, {
    GoogleSignIn? googleSignInOverride,
  }) async {
    if (state.isSubmitting) return;

    state = state.copyWith(isSubmitting: true, clearError: true, clearFieldErrors: true);

    try {
      final config = _ref.read(appConfigProvider);
      final serverClientId = config.googleServerClientId?.trim();
      final googleSignIn = googleSignInOverride ??
          GoogleSignIn(
            scopes: ['email', 'profile'],
            serverClientId:
                (serverClientId != null && serverClientId.isNotEmpty)
                    ? serverClientId
                    : null,
          );

      GoogleSignInAccount? googleUser;
      try {
        googleUser = await googleSignIn.signIn();
      } catch (signInErr) {
        if (googleSignInOverride != null) rethrow;
        AppLogger.w(
          'LoginNotifier',
          'Native GoogleSignIn encountered an error: $signInErr. Launching Supabase OAuth fallback.',
        );
        await _launchSupabaseOAuth(config.supabaseUrl, l10n);
        return;
      }

      if (googleUser == null) {
        // User cancelled Google Sign-In flow
        AppLogger.i('LoginNotifier', 'User cancelled Google Sign-In dialog.');
        state = state.copyWith(isSubmitting: false);
        return;
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null || idToken.isEmpty) {
        if (googleSignInOverride != null) {
          state = state.copyWith(
            isSubmitting: false,
            errorMessage: l10n.authSignInFailedGeneric,
          );
          return;
        }
        AppLogger.w(
          'LoginNotifier',
          'Google Sign-In returned empty idToken. Attempting Supabase browser OAuth fallback...',
        );
        await _launchSupabaseOAuth(config.supabaseUrl, l10n);
        return;
      }

      final login = await _repository.loginWithGoogle(idToken: idToken);

      final didLoadContext = await _ref
          .read(authContextProvider.notifier)
          .syncAndLoadUser(login.accessToken, l10n: l10n);

      if (!didLoadContext) {
        final contextState = _ref.read(authContextProvider);
        final errorMessage = contextState is AppAsyncFailure<AuthContext>
            ? contextState.message
            : l10n.authSignInFailedGeneric;
        state = state.copyWith(
          isSubmitting: false,
          errorMessage: errorMessage,
        );
        return;
      }

      final userEmail =
          login.userEmail.isNotEmpty ? login.userEmail : googleUser.email;

      await _ref.read(sessionStoreProvider).save(
            accessToken: login.accessToken,
            refreshToken: login.refreshToken,
            expiresAt: login.expiresAt,
            email: userEmail,
          );

      _ref.read(authFlowProvider.notifier).signIn(
            userEmail,
            accessToken: login.accessToken,
          );
    } on AppException catch (e, st) {
      AppLogger.e('LoginNotifier', 'Google Login failed with AppException: ${e.message}', e, st);
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.message,
      );
    } catch (e, st) {
      AppLogger.e('LoginNotifier', 'Google Login failed with unknown error', e, st);
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: l10n.authSignInFailedGeneric,
      );
    }
  }

  Future<void> _launchSupabaseOAuth(String supabaseUrl, AppLocalizations l10n) async {
    try {
      final authorizeUri = Uri.parse(
        '$supabaseUrl/auth/v1/authorize?provider=google&redirect_to=aimapp://login-callback',
      );
      final launched = await launchUrl(
        authorizeUri,
        mode: LaunchMode.externalApplication,
      );
      if (!launched) {
        state = state.copyWith(
          isSubmitting: false,
          errorMessage: l10n.authSignInFailedGeneric,
        );
      }
    } catch (e, st) {
      AppLogger.e('LoginNotifier', 'Failed to launch Supabase OAuth browser flow: $e', e, st);
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: l10n.authSignInFailedGeneric,
      );
    }
  }
}


