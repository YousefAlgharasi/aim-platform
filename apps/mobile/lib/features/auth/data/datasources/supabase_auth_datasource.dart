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
}
