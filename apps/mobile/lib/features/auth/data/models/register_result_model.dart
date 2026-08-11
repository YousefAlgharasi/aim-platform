import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';

/// Result of a successful POST /auth/register call.
///
/// When [requiresEmailConfirmation] is true the backend has not created a
/// session yet — [accessToken]/[refreshToken]/[expiresAt]/[userId]/
/// [userEmail] are null. When false, the backend auto-confirmed the account
/// and returned a session, identical in shape to [LoginResult].
class RegisterResult extends AuthRegisterResult {
  const RegisterResult({
    super.requiresEmailConfirmation = false,
    super.accessToken,
    super.refreshToken,
    super.expiresAt,
    super.userId,
    super.userEmail,
  }) : super(
          user: const AuthUser(id: ''),
          message: '',
        );

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
}
