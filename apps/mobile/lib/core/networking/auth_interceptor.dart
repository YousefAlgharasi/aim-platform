import 'auth_token_provider.dart';

class AuthInterceptor {
  const AuthInterceptor(this._tokenProvider);

  final AuthTokenProvider _tokenProvider;

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
