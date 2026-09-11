import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';

abstract class AuthRepository {
  Future<AuthContext> getMe(String bearerToken);

  Future<AuthSyncResult> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  });

  Future<void> logout(String bearerToken);

  Future<AuthLoginResult> login({
    required String email,
    required String password,
  });

  Future<AuthRefreshResult> refresh({required String refreshToken});

  Future<AuthRegisterResult> register({
    required String email,
    required String password,
  });

  /// POST /auth/test-login — non-production only. Signs in as a fixed
  /// student/admin/parent test account for manual QA. The backend returns
  /// 404 in production, so this is only ever usable outside production.
  Future<AuthLoginResult> loginAsTestUser({required String role});

  /// POST /auth/forgot-password — sends a password-reset email to [email].
  /// This is an unauthenticated endpoint; no bearer token is needed.
  Future<void> requestPasswordReset({required String email});

  /// POST /auth/reset-password — updates password for authenticated user.
  Future<void> resetPassword({
    required String newPassword,
    required String bearerToken,
  });
}
