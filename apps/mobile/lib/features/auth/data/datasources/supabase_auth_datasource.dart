/// Datasource for Supabase Auth operations performed client-side.
///
/// Supabase Auth is the external identity provider. This datasource calls the
/// Supabase Auth REST API directly using the public anon key (client-safe).
/// It must never store or use the service-role key, JWT secret, or any
/// privileged backend credential.
abstract class SupabaseAuthDatasource {
  /// Signs in with email and password via the Supabase Auth REST API.
  ///
  /// Returns the bearer [accessToken] on success.
  /// Throws [AppException] on auth failure.
  Future<String> signInWithEmailPassword({
    required String email,
    required String password,
  });

  /// Signs up with email and password via the Supabase Auth REST API.
  ///
  /// Returns a [SignUpResult] containing the [accessToken] if the account
  /// was auto-confirmed, or null if email confirmation is required.
  /// Throws [AppException] on registration failure.
  Future<SignUpResult> signUpWithEmailPassword({
    required String email,
    required String password,
  });
}

/// Result of a Supabase Auth sign-up attempt.
class SignUpResult {
  const SignUpResult({
    required this.email,
    this.accessToken,
    required this.requiresEmailConfirmation,
  });

  /// The email that was registered.
  final String email;

  /// Bearer token when Supabase auto-confirms the account.
  /// Null when email confirmation is required.
  final String? accessToken;

  /// True when Supabase requires the user to confirm their email first.
  final bool requiresEmailConfirmation;
}
