/// Abstraction over the secure key-value store used to persist the auth session.
///
/// A single session consists of:
/// - [accessToken]  — the backend-issued bearer token (`POST /auth/login`)
/// - [refreshToken] — used to obtain a new [accessToken] via `POST /auth/refresh`
/// - [expiresAt]    — Unix timestamp (seconds) at which [accessToken] expires
/// - [email]        — the signed-in user's email (display only, not a secret)
///
/// Security:
/// - The access and refresh tokens are credentials and must be stored in an
///   encrypted, app-sandboxed store.  The concrete implementation uses
///   [FlutterSecureStorage] which maps to Keychain (iOS) and EncryptedSharedPreferences
///   (Android).
/// - The service-role key, JWT secret, and any AI provider keys must never
///   be stored here or anywhere in Flutter.
/// - [email] is stored alongside the token for display purposes only.
///   It is not used for any authorization decision.
abstract class SessionStore {
  /// Persists the session tokens and metadata.
  Future<void> save({
    required String accessToken,
    required String refreshToken,
    required int expiresAt,
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
    required this.refreshToken,
    required this.expiresAt,
    required this.email,
  });

  final String accessToken;
  final String refreshToken;

  /// Unix timestamp (seconds) at which [accessToken] expires.
  final int expiresAt;
  final String email;
}
