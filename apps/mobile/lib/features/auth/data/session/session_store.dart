/// Abstraction over the secure key-value store used to persist the auth session.
///
/// A single session consists of:
/// - [accessToken]  — the Supabase JWT bearer token
/// - [email]        — the signed-in user's email (display only, not a secret)
///
/// Security:
/// - The access token is considered a credential and must be stored in an
///   encrypted, app-sandboxed store.  The concrete implementation uses
///   [FlutterSecureStorage] which maps to Keychain (iOS) and EncryptedSharedPreferences
///   (Android).
/// - The service-role key, JWT secret, and any AI provider keys must never
///   be stored here or anywhere in Flutter.
/// - [email] is stored alongside the token for display purposes only.
///   It is not used for any authorization decision.
abstract class SessionStore {
  /// Persists [accessToken] and [email] for the active session.
  Future<void> save({
    required String accessToken,
    required String email,
  });

  /// Returns the persisted [SessionData] if a prior session exists, or null.
  Future<SessionData?> read();

  /// Deletes all persisted session data.
  Future<void> clear();
}

/// The data returned by [SessionStore.read].
class SessionData {
  const SessionData({
    required this.accessToken,
    required this.email,
  });

  final String accessToken;
  final String email;
}
