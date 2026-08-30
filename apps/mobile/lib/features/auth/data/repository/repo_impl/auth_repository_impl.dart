import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_context.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_results.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl({required AuthRemoteDatasource datasource})
      : _datasource = datasource;

  final AuthRemoteDatasource _datasource;

  @override
  Future<AuthContext> getMe(String bearerToken) async {
    try {
      return await _datasource.getMe(bearerToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<AuthSyncResult> syncUser(
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
  Future<AuthLoginResult> login({
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
  Future<AuthRefreshResult> refresh({required String refreshToken}) async {
    try {
      return await _datasource.refresh(refreshToken: refreshToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<AuthRegisterResult> register({
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
  Future<AuthLoginResult> loginAsTestUser({required String role}) async {
    try {
      return await _datasource.loginAsTestUser(role: role);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<void> requestPasswordReset({required String email}) async {
    try {
      await _datasource.requestPasswordReset(email: email);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<void> resetPassword({
    required String newPassword,
    required String bearerToken,
  }) async {
    try {
      await _datasource.resetPassword(
        newPassword: newPassword,
        bearerToken: bearerToken,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}

