import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'package:aim_mobile/core/config/app_config_provider.dart';
import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/logging/app_logger.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import 'auth_context_provider.dart';

import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

/// Represents the outcome after a successful registration.
enum RegisterOutcome {
  /// Account created and auto-confirmed — user is now signed in.
  signedIn,

  /// Account created but email confirmation is required before sign-in.
  awaitingEmailConfirmation,
}

/// Manages registration form state and the sign-up submission flow.
///
/// Responsibilities:
/// - Validate email, password, and confirm-password input.
/// - Call the backend's `POST /auth/register` to create a new account — the
///   backend is the sole auth authority; this client never talks to
///   Supabase (or any identity provider) directly.
/// - If auto-confirmed: sync backend (bootstrap + me) and transition
///   [authFlowProvider] to signedIn.
/// - If email confirmation required: expose [outcome] so the UI can show a
///   message.
///
/// Security rules:
/// - No service-role keys, JWT secrets, or backend credentials appear here.
/// - Role and permission checks are backend-enforced; this notifier is UX only.
/// - The notifier never decides authorization.
class RegisterNotifier extends StateNotifier<AppFormState> {
  RegisterNotifier({
    required AuthRepository repository,
    required Ref ref,
  })  : _repository = repository,
        _ref = ref,
        super(const AppFormState());

  final AuthRepository _repository;
  final Ref _ref;

  String _email = '';
  String _password = '';
  String _confirmPassword = '';

  RegisterOutcome? _outcome;

  /// The outcome after a successful submission. Null before submission or on error.
  RegisterOutcome? get outcome => _outcome;

  void setEmail(String value) {
    _email = value.trim();
    _revalidate();
  }

  void setPassword(String value) {
    _password = value;
    _revalidate();
  }

  void setConfirmPassword(String value) {
    _confirmPassword = value;
    _revalidate();
  }

  void _revalidate() {
    final isValid = _email.contains('@') &&
        _email.length > 3 &&
        _password.length >= 6 &&
        _password == _confirmPassword;
    state = state.copyWith(isValid: isValid, clearError: true);
  }

  /// Submits the registration form.
  ///
  /// 1. Calls the backend's `POST /auth/register`.
  /// 2a. If auto-confirmed (`requiresEmailConfirmation == false`): syncs
  ///     backend (bootstrap + me) + transitions [authFlowProvider] to
  ///     signedIn.
  /// 2b. If email confirmation required: sets [outcome] to
  ///     [RegisterOutcome.awaitingEmailConfirmation].
  Future<void> submit(AppLocalizations l10n) async {
    if (!state.isValid || state.isSubmitting) return;

    state = state.copyWith(isSubmitting: true, clearError: true);
    _outcome = null;

    try {
      final result = await _repository.register(
        email: _email,
        password: _password,
      );

      if (result.requiresEmailConfirmation || result.accessToken == null) {
        _outcome = RegisterOutcome.awaitingEmailConfirmation;
        state = state.copyWith(isSubmitting: false);
        return;
      }

      final accessToken = result.accessToken!;
      final refreshToken = result.refreshToken ?? '';
      final expiresAt = result.expiresAt ?? 0;

      // Auto-confirmed — sync with backend and sign in.
      final didLoadContext = await _ref
          .read(authContextProvider.notifier)
          .syncAndLoadUser(accessToken, l10n: l10n);

      if (!didLoadContext) {
        state = state.copyWith(
          isSubmitting: false,
          errorMessage: l10n.authSessionExpiredError,
        );
        return;
      }

      // Persist session so the user stays signed in across app restarts.
      await _ref.read(sessionStoreProvider).save(
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresAt: expiresAt,
            email: _email,
          );

      _ref.read(authFlowProvider.notifier).signIn(
            _email,
            accessToken: accessToken,
          );
      _outcome = RegisterOutcome.signedIn;
      // isSubmitting stays true — UI navigates away immediately.
    } on AppException catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.message,
      );
    } catch (_) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: l10n.authRegistrationFailedGeneric,
      );
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }

  /// Triggers real Google Sign-In SDK, gets ID token, calls `POST /auth/google`,
  /// bootstraps user context, saves session, and transitions to signedIn state.
  Future<void> submitGoogleLogin(
    AppLocalizations l10n, {
    GoogleSignIn? googleSignInOverride,
  }) async {
    if (state.isSubmitting) return;

    state = state.copyWith(isSubmitting: true, clearError: true);
    _outcome = null;

    try {
      final serverClientId =
          _ref.read(appConfigProvider).googleServerClientId?.trim();
      final googleSignIn = googleSignInOverride ??
          GoogleSignIn(
            scopes: ['email', 'profile'],
            serverClientId:
                (serverClientId != null && serverClientId.isNotEmpty)
                    ? serverClientId
                    : null,
          );
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled Google Sign-In flow
        AppLogger.i('RegisterNotifier', 'User cancelled Google Sign-In dialog.');
        state = state.copyWith(isSubmitting: false);
        return;
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null || idToken.isEmpty) {
        AppLogger.e(
          'RegisterNotifier',
          'Google Sign-In returned null or empty idToken. Ensure Google Web OAuth Client ID is passed via GOOGLE_SERVER_CLIENT_ID or configured in Android google-services.json / strings.xml.',
        );
        state = state.copyWith(
          isSubmitting: false,
          errorMessage: l10n.authRegistrationFailedGeneric,
        );
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
            : l10n.authRegistrationFailedGeneric;
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
      _outcome = RegisterOutcome.signedIn;
    } on AppException catch (e, st) {
      AppLogger.e('RegisterNotifier', 'Google Register failed with AppException: ${e.message}', e, st);
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.message,
      );
    } catch (e, st) {
      AppLogger.e('RegisterNotifier', 'Google Register failed with unknown error', e, st);
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: l10n.authRegistrationFailedGeneric,
      );
    }
  }
}


