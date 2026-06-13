import '../../data/models/profile_me_response_model.dart';
import '../../data/models/profile_update_payload_models.dart';

abstract class ProfileRepository {
  Future<ProfileMeResponseModel> getProfile(String bearerToken);

  Future<ProfileMeResponseModel> updateProfile(
    String bearerToken, {
    SafeStudentProfileUpdatePayloadModel? studentPayload,
    SafeAdminProfileUpdatePayloadModel? adminPayload,
  });
}
