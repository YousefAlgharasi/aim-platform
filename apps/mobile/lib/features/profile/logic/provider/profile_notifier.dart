import '../../../core/state/app_async_state.dart';
import '../../../core/state/app_state_notifier.dart';
import '../data/models/profile_me_response_model.dart';
import '../data/models/profile_update_payload_models.dart';
import 'repository/profile_repository.dart';

class ProfileNotifier extends AppStateNotifier<ProfileMeResponseModel> {
  ProfileNotifier({required ProfileRepository repository})
      : _repository = repository;

  final ProfileRepository _repository;

  Future<void> loadProfile(String bearerToken) async {
    setLoading();
    try {
      final profile = await _repository.getProfile(bearerToken);
      setSuccess(profile);
    } catch (e) {
      setFailure(
        message: e is Exception ? e.toString() : 'Failed to load profile',
        code: 'PROFILE_LOAD_FAILED',
      );
    }
  }

  Future<bool> updateProfile(
    String bearerToken, {
    SafeStudentProfileUpdatePayloadModel? studentPayload,
    SafeAdminProfileUpdatePayloadModel? adminPayload,
  }) async {
    setLoading();
    try {
      final updated = await _repository.updateProfile(
        bearerToken,
        studentPayload: studentPayload,
        adminPayload: adminPayload,
      );
      setSuccess(updated);
      return true;
    } catch (e) {
      setFailure(
        message: e is Exception ? e.toString() : 'Failed to update profile',
        code: 'PROFILE_UPDATE_FAILED',
      );
      return false;
    }
  }

  void clearProfile() {
    reset();
  }
}
