import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';

abstract class AuthRemoteDatasource {
  Future<AuthContextModel> getMe(String bearerToken);

  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  });

  Future<void> logout(String bearerToken);

  /// POST /auth/login — unauthenticated. The backend is the sole identity
  /// provider; this never calls Supabase or any other identity provider.
  Future<LoginResult> login({
    required String email,
    required String password,
  });

  /// POST /auth/google — unauthenticated. Exchanges a Google ID token
  /// (obtained on-device via the Google Sign-In SDK) for a backend session.
  /// The backend verifies the token with Supabase and creates the account
  /// on first sign-in, so this also serves as "register with Google".
  Future<LoginResult> googleLogin({
    required String idToken,
    String? nonce,
  });

  /// POST /auth/refresh — unauthenticated (uses the refresh token, not a
  /// bearer access token).
  Future<RefreshResult> refresh({required String refreshToken});

  /// POST /auth/register — unauthenticated.
  Future<RegisterResult> register({
    required String email,
    required String password,
  });

  /// POST /auth/test-login — unauthenticated, non-production only.
  Future<LoginResult> loginAsTestUser({required String role});

  /// POST /auth/forgot-password — unauthenticated.
  Future<void> requestPasswordReset({required String email});

  /// POST /auth/reset-password — authenticated.
  Future<void> resetPassword({
    required String newPassword,
    required String bearerToken,
  });
}

