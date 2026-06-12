import '../../data/models/auth_context_model.dart';
import '../../data/models/auth_sync_response_model.dart';

abstract class AuthRepository {
  Future<AuthContextModel> getMe(String bearerToken);

  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  });

  Future<void> logout(String bearerToken);
}
