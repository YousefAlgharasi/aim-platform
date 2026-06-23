import 'auth_token_provider.dart';

/// Invoked by [BackendApiClient] when a request receives a 401 response.
///
/// Implementations should attempt a token refresh (`POST /auth/refresh`)
/// using the stored refresh token, persist the new session, and return the
/// new access token on success. Return `null` (or throw) on failure — the
/// caller signs the user out and the original 401 is surfaced as-is.
typedef OnUnauthorized = Future<String?> Function();

class AuthInterceptor {
  const AuthInterceptor(this._tokenProvider, {this.onUnauthorized});

  final AuthTokenProvider _tokenProvider;

  /// Optional 401 handler. When set, [BackendApiClient] calls this once on
  /// a 401 response and retries the original request with the new token if
  /// one is returned.
  final OnUnauthorized? onUnauthorized;

  Map<String, String> apply(Map<String, String>? headers) {
    final merged = <String, String>{...?headers};

    final hasAuthorization =
        merged.keys.any((key) => key.toLowerCase() == 'authorization');
    if (hasAuthorization) {
      return merged;
    }

    final token = _tokenProvider();
    if (token == null || token.isEmpty) {
      return merged;
    }

    merged['authorization'] = 'Bearer $token';
    return merged;
  }
}
