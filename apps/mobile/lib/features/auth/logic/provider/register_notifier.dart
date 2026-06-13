import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_form_state.dart';
import 'package:aim_mobile/features/auth/data/datasources/supabase_auth_datasource.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';

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
/// - Call Supabase Auth to create a new account.
/// - If auto-confirmed: sync backend and transition [authFlowProvider] to signedIn.
/// - If email confirmation required: expose [outcome] so the UI can show a message.
///
/// Security rules:
/// - No service-role keys, JWT secrets, or backend credentials appear here.
/// - Role and permission checks are backend-enforced; this notifier is UX only.
/// - The notifier never decides authorization.
class RegisterNotifier extends StateNotifier<AppFormState> {
  RegisterNotifier({
    required SupabaseAuthDatasource supabaseDatasource,
    required Ref ref,
  })  : _supabaseDatasource = supabaseDatasource,
        _ref = ref,
        super(const AppFormState());

  final SupabaseAuthDatasource _supabaseDatasource;
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
  /// 1. Calls Supabase Auth signup.
  /// 2a. If auto-confirmed: syncs backend + transitions [authFlowProvider] to signedIn.
  /// 2b. If email confirmation required: sets [outcome] to [RegisterOutcome.awaitingEmailConfirmation].
  Future<void> submit() async {
    if (!state.isValid || state.isSubmitting) return;

    state = state.copyWith(isSubmitting: true, clearError: true);
    _outcome = null;

    try {
      final result = await _supabaseDatasource.signUpWithEmailPassword(
        email: _email,
        password: _password,
      );

      if (result.requiresEmailConfirmation || result.accessToken == null) {
        _outcome = RegisterOutcome.awaitingEmailConfirmation;
        state = state.copyWith(isSubmitting: false);
        return;
      }

      // Auto-confirmed — sync with backend and sign in.
      final didLoadContext = await _ref
          .read(authContextProvider.notifier)
          .syncAndLoadUser(result.accessToken!);

      if (!didLoadContext) {
        state = state.copyWith(
          isSubmitting: false,
          errorMessage: 'Your session has expired. Please sign in again.',
        );
        return;
      }

      _ref.read(authFlowProvider.notifier).signIn(
            _email,
            accessToken: result.accessToken!,
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
        errorMessage: 'Registration failed. Please try again.',
      );
    }
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}
