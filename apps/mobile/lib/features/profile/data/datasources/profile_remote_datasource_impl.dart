import '../../../../core/networking/backend_api_client.dart';
import '../../../../core/networking/backend_api_paths.dart';
import '../models/profile_me_response_model.dart';
import '../models/profile_update_payload_models.dart';
import 'profile_remote_datasource.dart';

class ProfileRemoteDatasourceImpl implements ProfileRemoteDatasource {
  const ProfileRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<ProfileMeResponseModel> getProfile(String bearerToken) async {
    final envelope = await _apiClient.get<ProfileMeResponseModel>(
      BackendApiPaths.profileMe,
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          ProfileMeResponseModel.fromJson(json as Map<String, dynamic>),
    );

    return envelope.data!;
  }

  @override
  Future<ProfileMeResponseModel> updateProfile(
    String bearerToken,
    SafeStudentProfileUpdatePayloadModel? studentPayload,
    SafeAdminProfileUpdatePayloadModel? adminPayload,
  ) async {
    final body = <String, dynamic>{
      ...?studentPayload?.toJson(),
      ...?adminPayload?.toJson(),
    };

    final envelope = await _apiClient.patch<ProfileMeResponseModel>(
      BackendApiPaths.profileMe,
      headers: _authHeaders(bearerToken),
      body: body.isEmpty ? null : body,
      decodeData: (json) =>
          ProfileMeResponseModel.fromJson(json as Map<String, dynamic>),
    );

    return envelope.data!;
  }

  Map<String, String> _authHeaders(String bearerToken) {
    return {'authorization': 'Bearer $bearerToken'};
  }
}
