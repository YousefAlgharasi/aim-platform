import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/auth/data/models/auth_context_model.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:aim_mobile/features/auth/data/models/login_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/refresh_result_model.dart';
import 'package:aim_mobile/features/auth/data/models/register_result_model.dart';
import 'auth_remote_datasource.dart';

class AuthRemoteDatasourceImpl implements AuthRemoteDatasource {
  const AuthRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<AuthContextModel> getMe(String bearerToken) async {
    final envelope = await _apiClient.get<AuthContextModel>(
      BackendApiPaths.authMe,
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          AuthContextModel.fromJson(json as Map<String, dynamic>),
    );

    return envelope.data!;
  }

  @override
  Future<AuthSyncResponseModel> syncUser(
    String bearerToken, {
    String? preferredLanguage,
    String? timezone,
  }) async {
    final body = <String, dynamic>{
      if (preferredLanguage != null) 'preferredLanguage': preferredLanguage,
      if (timezone != null) 'timezone': timezone,
    };

    final envelope = await _apiClient.post<AuthSyncResponseModel>(
      BackendApiPaths.authSyncUser,
      headers: _authHeaders(bearerToken),
      body: body.isEmpty ? null : body,
      decodeData: (json) =>
          AuthSyncResponseModel.fromJson(json as Map<String, dynamic>),
    );

    return envelope.data!;
  }

  @override
  Future<void> logout(String bearerToken) async {
    await _apiClient.post<void>(
      BackendApiPaths.authLogout,
      headers: _authHeaders(bearerToken),
      decodeData: (_) {},
    );
  }

  @override
  Future<LoginResult> login({
    required String email,
    required String password,
  }) async {
    final envelope = await _apiClient.post<LoginResult>(
      BackendApiPaths.authLogin,
      body: {'email': email, 'password': password},
      requiresAuth: false,
      decodeData: (json) =>
          LoginResult.fromJson(json as Map<String, dynamic>),
    );

    return envelope.data!;
  }

  @override
  Future<RefreshResult> refresh({required String refreshToken}) async {
    final envelope = await _apiClient.post<RefreshResult>(
      BackendApiPaths.authRefresh,
      body: {'refreshToken': refreshToken},
      requiresAuth: false,
      decodeData: (json) =>
          RefreshResult.fromJson(json as Map<String, dynamic>),
    );

    return envelope.data!;
  }

  @override
  Future<RegisterResult> register({
    required String email,
    required String password,
  }) async {
    final envelope = await _apiClient.post<RegisterResult>(
      BackendApiPaths.authRegister,
      body: {'email': email, 'password': password},
      requiresAuth: false,
      decodeData: (json) =>
          RegisterResult.fromJson(json as Map<String, dynamic>),
    );

    return envelope.data!;
  }

  Map<String, String> _authHeaders(String bearerToken) {
    return {'authorization': 'Bearer $bearerToken'};
  }
}
