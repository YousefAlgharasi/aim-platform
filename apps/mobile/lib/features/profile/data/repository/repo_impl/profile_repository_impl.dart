import '../../../../core/errors/app_exception.dart';
import '../../../../core/networking/api_client_exception.dart';
import '../../data/datasources/profile_remote_datasource.dart';
import '../../data/models/profile_me_response_model.dart';
import '../../data/models/profile_update_payload_models.dart';
import '../../logic/repository/profile_repository.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  const ProfileRepositoryImpl({required ProfileRemoteDatasource datasource})
      : _datasource = datasource;

  final ProfileRemoteDatasource _datasource;

  @override
  Future<ProfileMeResponseModel> getProfile(String bearerToken) async {
    try {
      return await _datasource.getProfile(bearerToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<ProfileMeResponseModel> updateProfile(
    String bearerToken, {
    SafeStudentProfileUpdatePayloadModel? studentPayload,
    SafeAdminProfileUpdatePayloadModel? adminPayload,
  }) async {
    try {
      return await _datasource.updateProfile(
        bearerToken,
        studentPayload,
        adminPayload,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
