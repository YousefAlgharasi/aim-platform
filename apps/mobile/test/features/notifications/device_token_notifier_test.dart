// P13-060: DeviceTokenNotifier tests.
//
// Coverage: registerToken/disableToken success paths, the "no active
// session" guard, and backend failure surfacing.
//
// Security rules verified: the notifier only relays a platform token
// string to the backend; it never marks a token valid itself, and it
// never persists or logs the access token beyond reading it once from
// the session store to attach as a bearer token.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/auth/data/session/session_store.dart';
import 'package:aim_mobile/features/auth/logic/provider/session_store_provider.dart';
import 'package:aim_mobile/features/notifications/notifications.dart';

class _FakeSessionStore implements SessionStore {
  _FakeSessionStore({SessionData? initial}) : _data = initial;

  SessionData? _data;

  @override
  Future<void> save({required String accessToken, required String email}) async {
    _data = SessionData(accessToken: accessToken, email: email);
  }

  @override
  Future<SessionData?> read() async => _data;

  @override
  Future<void> clear() async => _data = null;
}

class _FakeNotificationRepository implements NotificationRepository {
  _FakeNotificationRepository({this.error});

  final AppException? error;
  String? lastBearerToken;

  @override
  Future<DeviceTokenModel> registerDeviceToken(
    String bearerToken, {
    required String platform,
    required String token,
    String? deviceName,
  }) async {
    lastBearerToken = bearerToken;
    if (error != null) throw error!;
    return DeviceTokenModel(
      id: 'device-1',
      platform: platform,
      deviceName: deviceName,
      status: 'active',
    );
  }

  @override
  Future<void> disableDeviceToken(String bearerToken, String tokenId) async {
    lastBearerToken = bearerToken;
    if (error != null) throw error!;
  }

  @override
  Future<List<NotificationEventModel>> getInbox(String t,
          {int limit = 20, int offset = 0}) async =>
      throw UnimplementedError();

  @override
  Future<int> getUnreadCount(String t) async => throw UnimplementedError();

  @override
  Future<NotificationEventModel> markAsRead(String t, String eventId) async =>
      throw UnimplementedError();

  @override
  Future<NotificationEventModel> dismiss(String t, String eventId) async =>
      throw UnimplementedError();

  @override
  Future<List<NotificationPreferenceModel>> getPreferences(String t) async =>
      throw UnimplementedError();

  @override
  Future<NotificationPreferenceModel> updatePreference(String t,
          {required String channel,
          required String category,
          required bool enabled}) async =>
      throw UnimplementedError();

  @override
  Future<QuietHoursModel> getQuietHours(String t) async =>
      throw UnimplementedError();

  @override
  Future<QuietHoursModel> updateQuietHours(String t,
          {required bool enabled,
          required String startTime,
          required String endTime,
          required String timezone}) async =>
      throw UnimplementedError();

  @override
  Future<List<ReminderScheduleModel>> getReminders(String t) async =>
      throw UnimplementedError();

  @override
  Future<ReminderScheduleModel> pauseReminder(String t, String scheduleId) async =>
      throw UnimplementedError();

  @override
  Future<ReminderScheduleModel> resumeReminder(String t, String scheduleId) async =>
      throw UnimplementedError();

  @override
  Future<ReminderScheduleModel> cancelReminder(String t, String scheduleId) async =>
      throw UnimplementedError();
}

void main() {
  group('DeviceTokenNotifier', () {
    test('registerToken fails with NO_SESSION when no session exists',
        () async {
      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(_FakeSessionStore()),
          notificationRepositoryProvider
              .overrideWithValue(_FakeNotificationRepository()),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(deviceTokenNotifierProvider.notifier)
          .registerToken('push-token-abc');

      final state = container.read(deviceTokenNotifierProvider)
          as AppAsyncFailure<DeviceTokenModel>;
      expect(state.code, 'NO_SESSION');
    });

    test('registerToken relays the token and stores the backend response',
        () async {
      final repository = _FakeNotificationRepository();
      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(
            _FakeSessionStore(
              initial: const SessionData(
                accessToken: 'tok-123',
                email: 'student@example.com',
              ),
            ),
          ),
          notificationRepositoryProvider.overrideWithValue(repository),
          devicePlatformProvider.overrideWithValue('android'),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(deviceTokenNotifierProvider.notifier)
          .registerToken('push-token-abc', deviceName: 'Test Phone');

      final state = container.read(deviceTokenNotifierProvider)
          as AppAsyncSuccess<DeviceTokenModel>;
      expect(state.data.id, 'device-1');
      expect(state.data.status, 'active');
      expect(repository.lastBearerToken, 'tok-123');
    });

    test('registerToken surfaces a backend failure', () async {
      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(
            _FakeSessionStore(
              initial: const SessionData(
                accessToken: 'tok-123',
                email: 'student@example.com',
              ),
            ),
          ),
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(
              error: const AppException(
                code: 'DEVICE_TOKEN_REGISTER_FAILED',
                message: 'Could not register device token',
              ),
            ),
          ),
          devicePlatformProvider.overrideWithValue('android'),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(deviceTokenNotifierProvider.notifier)
          .registerToken('push-token-abc');

      expect(
        container.read(deviceTokenNotifierProvider),
        isA<AppAsyncFailure<DeviceTokenModel>>(),
      );
    });

    test('disableToken fails with NO_SESSION when no session exists',
        () async {
      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(_FakeSessionStore()),
          notificationRepositoryProvider
              .overrideWithValue(_FakeNotificationRepository()),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(deviceTokenNotifierProvider.notifier)
          .disableToken('device-1');

      final state = container.read(deviceTokenNotifierProvider)
          as AppAsyncFailure<DeviceTokenModel>;
      expect(state.code, 'NO_SESSION');
    });

    test('disableToken resets to idle on success', () async {
      final repository = _FakeNotificationRepository();
      final container = ProviderContainer(
        overrides: [
          sessionStoreProvider.overrideWithValue(
            _FakeSessionStore(
              initial: const SessionData(
                accessToken: 'tok-123',
                email: 'student@example.com',
              ),
            ),
          ),
          notificationRepositoryProvider.overrideWithValue(repository),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(deviceTokenNotifierProvider.notifier)
          .disableToken('device-1');

      expect(
        container.read(deviceTokenNotifierProvider),
        isA<AppAsyncIdle<DeviceTokenModel>>(),
      );
      expect(repository.lastBearerToken, 'tok-123');
    });
  });
}
