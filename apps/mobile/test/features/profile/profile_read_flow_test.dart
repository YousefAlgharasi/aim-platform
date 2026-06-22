import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/profile/data/models/profile_me_response_model.dart';
import 'package:aim_mobile/features/profile/data/models/profile_update_payload_models.dart';
import 'package:aim_mobile/features/profile/logic/provider/profile_provider.dart';
import 'package:aim_mobile/features/profile/logic/repository/profile_repository.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

class _FakeProfileRepository implements ProfileRepository {
  final ProfileMeResponseModel? _response;
  final Exception? _error;

  const _FakeProfileRepository({
    ProfileMeResponseModel? response,
    Exception? error,
  })  : _response = response,
        _error = error;

  @override
  Future<ProfileMeResponseModel> getProfile(String bearerToken) async {
    if (_error != null) throw _error;
    return _response!;
  }

  @override
  Future<ProfileMeResponseModel> updateProfile(
    String bearerToken, {
    SafeStudentProfileUpdatePayloadModel? studentPayload,
    SafeAdminProfileUpdatePayloadModel? adminPayload,
  }) async {
    if (_error != null) throw _error;
    return _response!;
  }
}

const _studentModel = ProfileMeResponseModel(
  internalUserId: 'usr_1',
  userType: 'student',
  studentProfile: ProfileStudentProfileResponseModel(
    id: 'sp_1',
    profileType: 'student_profile',
    displayName: 'Yousef',
    preferredLanguage: 'ar',
    timezone: 'Asia/Riyadh',
  ),
);

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('ProfileNotifier', () {
    test('loadProfile transitions idle → loading → success', () async {
      final container = ProviderContainer(
        overrides: [
          profileRepositoryProvider.overrideWithValue(
            const _FakeProfileRepository(response: _studentModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      expect(
        container.read(profileProvider),
        isA<AppAsyncIdle<ProfileMeResponseModel>>(),
      );

      final future = container.read(profileProvider.notifier).loadProfile('tok');
      expect(
        container.read(profileProvider),
        isA<AppAsyncLoading<ProfileMeResponseModel>>(),
      );

      await future;

      final state = container.read(profileProvider);
      expect(state, isA<AppAsyncSuccess<ProfileMeResponseModel>>());
      final data = (state as AppAsyncSuccess<ProfileMeResponseModel>).data;
      expect(data.internalUserId, 'usr_1');
      expect(data.studentProfile?.displayName, 'Yousef');
    });

    test('loadProfile sets failure state on error', () async {
      final container = ProviderContainer(
        overrides: [
          profileRepositoryProvider.overrideWithValue(
            _FakeProfileRepository(error: Exception('Network error')),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(profileProvider.notifier).loadProfile('tok');

      final state = container.read(profileProvider);
      expect(state, isA<AppAsyncFailure<ProfileMeResponseModel>>());
      expect(
        (state as AppAsyncFailure<ProfileMeResponseModel>).code,
        'PROFILE_LOAD_FAILED',
      );
    });

    test('clearProfile resets to idle', () async {
      final container = ProviderContainer(
        overrides: [
          profileRepositoryProvider.overrideWithValue(
            const _FakeProfileRepository(response: _studentModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(profileProvider.notifier).loadProfile('tok');
      expect(container.read(profileProvider), isA<AppAsyncSuccess>());

      container.read(profileProvider.notifier).clearProfile();
      expect(container.read(profileProvider), isA<AppAsyncIdle>());
    });
  });
}
