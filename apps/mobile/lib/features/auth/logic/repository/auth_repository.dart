import '../../data/models/auth_context_model.dart';
import '../../data/models/auth_sync_response_model.dart';
import '../../data/models/login_result_model.dart';
import '../../data/models/refresh_result_model.dart';
import '../../data/models/register_result_model.dart';

abstract class AuthRepository {
  Future<AuthContextModel> getMe(String bearerToken);

  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  });

  Future<void> logout(String bearerToken);

  Future<LoginResult> login({
    required String email,
    required String password,
  });

  Future<RefreshResult> refresh({required String refreshToken});

  Future<RegisterResult> register({
    required String email,
    required String password,
  });

  /// POST /auth/test-login — non-production only. Signs in as a fixed
  /// student/admin/parent test account for manual QA. The backend returns
  /// 404 in production, so this is only ever usable outside production.
  Future<LoginResult> loginAsTestUser({required String role});
}
