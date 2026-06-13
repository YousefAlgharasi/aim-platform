import '../models/profile_me_response_model.dart';
import '../models/profile_update_payload_models.dart';

abstract class ProfileRemoteDatasource {
  Future<ProfileMeResponseModel> getProfile(String bearerToken);

  Future<ProfileMeResponseModel> updateProfile(
    String bearerToken,
    SafeStudentProfileUpdatePayloadModel? studentPayload,
    SafeAdminProfileUpdatePayloadModel? adminPayload,
  );
}
