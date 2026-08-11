import '../models/profile_me_response_model.dart';
import '../models/profile_update_payload_models.dart';

abstract class ProfileRemoteDatasource {
  Future<ProfileMeResponseModel> getProfile(String bearerToken);

  Future<ProfileMeResponseModel> updateProfile(
    String bearerToken,
    SafeStudentProfileUpdatePayloadModel? studentPayload,
    SafeAdminProfileUpdatePayloadModel? adminPayload,
  );

  /// PUT /student/engagement/goal — sets the student's daily learning
  /// commitment (how many lessons per day they aim to complete).
  /// [dailyGoalLessons] is an integer (1, 2, or 3) mapped from the UI's
  /// commitment selection ('5 min' → 1, '15 min' → 2, '30 min' → 3).
  Future<void> updateEngagementGoal(
    String bearerToken, {
    required int dailyGoalLessons,
  });
}
