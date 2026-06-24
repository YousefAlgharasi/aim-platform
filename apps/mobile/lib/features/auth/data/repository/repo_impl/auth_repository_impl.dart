import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';


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

  @override
  Future<LoginResult> login({
    required String email,
    required String password,
  }) async {
    try {
      return await _datasource.login(email: email, password: password);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<RefreshResult> refresh({required String refreshToken}) async {
    try {
      return await _datasource.refresh(refreshToken: refreshToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<RegisterResult> register({
    required String email,
    required String password,
  }) async {
    try {
      return await _datasource.register(email: email, password: password);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<LoginResult> loginAsTestUser({required String role}) async {
    try {
      return await _datasource.loginAsTestUser(role: role);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
