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
/// - The stored token is the Supabase anon-user JWT — it is client-safe
///   in the same sense as a session cookie in a web browser.
class SecureSessionStore implements SessionStore {
  const SecureSessionStore({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _keyAccessToken = 'aim.session.access_token';
  static const String _keyEmail = 'aim.session.email';

  final FlutterSecureStorage _storage;

  @override
  Future<void> save({
    required String accessToken,
    required String email,
  }) async {
    await _storage.write(key: _keyAccessToken, value: accessToken);
    await _storage.write(key: _keyEmail, value: email);
  }

  @override
  Future<SessionData?> read() async {
    final token = await _storage.read(key: _keyAccessToken);
    final email = await _storage.read(key: _keyEmail);

    if (token == null || token.isEmpty) return null;

    return SessionData(
      accessToken: token,
      email: email ?? '',
    );
  }

  @override
  Future<void> clear() async {
    await _storage.delete(key: _keyAccessToken);
    await _storage.delete(key: _keyEmail);
  }
}
