import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'session_store.dart';

/// [SessionStore] implementation backed by [FlutterSecureStorage].
///
/// On iOS the data is stored in the Keychain.
/// On Android it uses EncryptedSharedPreferences (AES-256 encryption).
///
/// Security:
/// - Access token is encrypted at rest by the OS-level secure store.
/// - The service-role key, JWT secret, and any AI provider keys must never
///   be passed to this store.
/// - The stored access/refresh tokens are backend-issued (`POST /auth/login`)
///   — they are client-safe in the same sense as a session cookie in a web
///   browser, and never the Supabase service-role key or JWT secret.
class SecureSessionStore implements SessionStore {
  const SecureSessionStore({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _keyAccessToken = 'aim.session.access_token';
  static const String _keyRefreshToken = 'aim.session.refresh_token';
  static const String _keyExpiresAt = 'aim.session.expires_at';
  static const String _keyEmail = 'aim.session.email';

  final FlutterSecureStorage _storage;

  @override
  Future<void> save({
    required String accessToken,
    required String refreshToken,
    required int expiresAt,
    required String email,
  }) async {
    await _storage.write(key: _keyAccessToken, value: accessToken);
    await _storage.write(key: _keyRefreshToken, value: refreshToken);
    await _storage.write(key: _keyExpiresAt, value: expiresAt.toString());
    await _storage.write(key: _keyEmail, value: email);
  }

  @override
  Future<SessionData?> read() async {
    final token = await _storage.read(key: _keyAccessToken);
    final refreshToken = await _storage.read(key: _keyRefreshToken);
    final expiresAtRaw = await _storage.read(key: _keyExpiresAt);
    final email = await _storage.read(key: _keyEmail);

    if (token == null || token.isEmpty) return null;

    return SessionData(
      accessToken: token,
      refreshToken: refreshToken ?? '',
      expiresAt: int.tryParse(expiresAtRaw ?? '') ?? 0,
      email: email ?? '',
    );
  }

  @override
  Future<void> clear() async {
    await _storage.delete(key: _keyAccessToken);
    await _storage.delete(key: _keyRefreshToken);
    await _storage.delete(key: _keyExpiresAt);
    await _storage.delete(key: _keyEmail);
  }
}
