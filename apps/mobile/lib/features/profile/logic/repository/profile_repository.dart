import '../../data/models/profile_me_response_model.dart';
import '../../data/models/profile_update_payload_models.dart';

abstract class ProfileRepository {
  Future<ProfileMeResponseModel> getProfile(String bearerToken);

  Future<ProfileMeResponseModel> updateProfile(
    String bearerToken, {
    SafeStudentProfileUpdatePayloadModel? studentPayload,
    SafeAdminProfileUpdatePayloadModel? adminPayload,
  });

  /// Sets the student's daily learning commitment goal.
  /// [dailyGoalLessons] maps from the UI commitment selection:
  /// '5 min' → 1, '15 min' → 2, '30 min' → 3.
  Future<void> updateEngagementGoal(
    String bearerToken, {
    required int dailyGoalLessons,
  });
}
