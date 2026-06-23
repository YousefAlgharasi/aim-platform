/// Result of a successful POST /auth/login call.
///
/// `expiresAt` is the Unix timestamp (in seconds) at which [accessToken]
/// expires, as returned by the backend.
class LoginResult {
  const LoginResult({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
    required this.userId,
    required this.userEmail,
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

  final String accessToken;
  final String refreshToken;

  /// Unix timestamp (seconds) at which [accessToken] expires.
  final int expiresAt;
  final String userId;
  final String userEmail;
}
