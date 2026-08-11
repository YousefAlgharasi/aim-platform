import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';

/// Result of a successful POST /auth/login call.
///
/// `expiresAt` is the Unix timestamp (in seconds) at which [accessToken]
/// expires, as returned by the backend.
class LoginResult extends AuthLoginResult {
  const LoginResult({
    required super.accessToken,
    required super.refreshToken,
    required super.expiresAt,
    super.userId = '',
    super.userEmail = '',
  });

  factory LoginResult.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;

    return LoginResult(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresAt: json['expiresAt'] as int,
      userId: user?['id'] as String? ?? '',
      userEmail: user?['email'] as String? ?? '',
    );
  }
}
