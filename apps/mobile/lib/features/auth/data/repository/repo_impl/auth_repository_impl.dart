import '../../../../core/errors/app_exception.dart';
import '../../../../core/networking/api_client_exception.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/models/auth_context_model.dart';
import '../../data/models/auth_sync_response_model.dart';
import '../../logic/repository/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl({required AuthRemoteDatasource datasource})
      : _datasource = datasource;

  final AuthRemoteDatasource _datasource;

  @override
  Future<AuthContextModel> getMe(String bearerToken) async {
    try {
      return await _datasource.getMe(bearerToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async {
    try {
      return await _datasource.syncUser(
        bearerToken,
        preferredLanguage: preferredLanguage,
        timezone: timezone,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<void> logout(String bearerToken) async {
    try {
      await _datasource.logout(bearerToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
