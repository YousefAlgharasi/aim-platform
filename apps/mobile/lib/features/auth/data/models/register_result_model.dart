/// Result of a successful POST /auth/register call.
///
/// When [requiresEmailConfirmation] is true the backend has not created a
/// session yet — [accessToken]/[refreshToken]/[expiresAt]/[userId]/
/// [userEmail] are null. When false, the backend auto-confirmed the account
/// and returned a session, identical in shape to [LoginResult].
class RegisterResult {
  const RegisterResult({
    required this.requiresEmailConfirmation,
    this.accessToken,
    this.refreshToken,
    this.expiresAt,
    this.userId,
    this.userEmail,
  });

  factory RegisterResult.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>?;

    return RegisterResult(
      requiresEmailConfirmation:
          json['requiresEmailConfirmation'] as bool? ?? false,
      accessToken: json['accessToken'] as String?,
      refreshToken: json['refreshToken'] as String?,
      expiresAt: json['expiresAt'] as int?,
      userId: user?['id'] as String?,
      userEmail: user?['email'] as String?,
    );
  }

  final bool requiresEmailConfirmation;
  final String? accessToken;
  final String? refreshToken;

  /// Unix timestamp (seconds) at which [accessToken] expires, if present.
  final int? expiresAt;
  final String? userId;
  final String? userEmail;
}
