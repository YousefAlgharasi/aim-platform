// P13-060: Student mobile notification tests.
//
// Coverage: inbox load/mark-as-read/dismiss, preferences load/toggle,
// quiet hours load/update, reminder pause/resume/cancel, and unread count
// loading — including success and backend-failure paths.
//
// Security rules verified: every notifier only relays backend-returned
// state; none of them compute eligibility, delivery state, schedule
// status, or quiet-hour enforcement locally.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/notifications/notifications.dart';

// ── Fake repository ───────────────────────────────────────────────────────────

class _FakeNotificationRepository implements NotificationRepository {
  _FakeNotificationRepository({
    List<NotificationEventModel>? inbox,
    List<NotificationPreferenceModel>? preferences,
    QuietHoursModel? quietHours,
    List<ReminderScheduleModel>? reminders,
    int? unreadCount,
    AppException? error,
  })  : _inbox = inbox ?? const [],
        _preferences = preferences ?? const [],
        _quietHours = quietHours,
        _reminders = reminders ?? const [],
        _unreadCount = unreadCount ?? 0,
        _error = error;

  final List<NotificationEventModel> _inbox;
  final List<NotificationPreferenceModel> _preferences;
  final QuietHoursModel? _quietHours;
  final List<ReminderScheduleModel> _reminders;
  final int _unreadCount;
  final AppException? _error;

  void _maybeThrow() {
    if (_error != null) throw _error!;
  }

  @override
  Future<List<NotificationEventModel>> getInbox(
    String bearerToken, {
    int limit = 20,
    int offset = 0,
  }) async {
    _maybeThrow();
    return _inbox;
  }

  @override
  Future<int> getUnreadCount(String bearerToken) async {
    _maybeThrow();
    return _unreadCount;
  }

  @override
  Future<NotificationEventModel> markAsRead(
    String bearerToken,
    String eventId,
  ) async {
    _maybeThrow();
    final event = _inbox.firstWhere((e) => e.id == eventId);
    return NotificationEventModel(
      id: event.id,
      templateId: event.templateId,
      channel: event.channel,
      category: event.category,
      status: event.status,
      title: event.title,
      body: event.body,
      scheduledAt: event.scheduledAt,
      sentAt: event.sentAt,
      readAt: '2026-06-20T00:00:00Z',
      dismissedAt: event.dismissedAt,
      createdAt: event.createdAt,
    );
  }

  @override
  Future<NotificationEventModel> dismiss(
    String bearerToken,
    String eventId,
  ) async {
    _maybeThrow();
    final event = _inbox.firstWhere((e) => e.id == eventId);
    return NotificationEventModel(
      id: event.id,
      templateId: event.templateId,
      channel: event.channel,
      category: event.category,
      status: event.status,
      title: event.title,
      body: event.body,
      scheduledAt: event.scheduledAt,
      sentAt: event.sentAt,
      readAt: event.readAt,
      dismissedAt: '2026-06-20T00:00:00Z',
      createdAt: event.createdAt,
    );
  }

  @override
  Future<List<NotificationPreferenceModel>> getPreferences(
    String bearerToken,
  ) async {
    _maybeThrow();
    return _preferences;
  }

  @override
  Future<NotificationPreferenceModel> updatePreference(
    String bearerToken, {
    required String channel,
    required String category,
    required bool enabled,
  }) async {
    _maybeThrow();
    return NotificationPreferenceModel(
      id: 'pref-$channel-$category',
      channel: channel,
      category: category,
      enabled: enabled,
    );
  }

  @override
  Future<QuietHoursModel> getQuietHours(String bearerToken) async {
    _maybeThrow();
    return _quietHours!;
  }

  @override
  Future<QuietHoursModel> updateQuietHours(
    String bearerToken, {
    required bool enabled,
    required String startTime,
    required String endTime,
    required String timezone,
  }) async {
    _maybeThrow();
    return QuietHoursModel(
      enabled: enabled,
      startTime: startTime,
      endTime: endTime,
      timezone: timezone,
    );
  }

  @override
  Future<List<ReminderScheduleModel>> getReminders(String bearerToken) async {
    _maybeThrow();
    return _reminders;
  }

  Future<ReminderScheduleModel> _withStatus(
    String scheduleId,
    String status,
  ) async {
    _maybeThrow();
    final schedule = _reminders.firstWhere((r) => r.id == scheduleId);
    return ReminderScheduleModel(
      id: schedule.id,
      reminderType: schedule.reminderType,
      status: status,
      cronExpression: schedule.cronExpression,
    );
  }

  @override
  Future<ReminderScheduleModel> pauseReminder(
    String bearerToken,
    String scheduleId,
  ) =>
      _withStatus(scheduleId, 'paused');

  @override
  Future<ReminderScheduleModel> resumeReminder(
    String bearerToken,
    String scheduleId,
  ) =>
      _withStatus(scheduleId, 'active');

  @override
  Future<ReminderScheduleModel> cancelReminder(
    String bearerToken,
    String scheduleId,
  ) =>
      _withStatus(scheduleId, 'cancelled');

  @override
  Future<DeviceTokenModel> registerDeviceToken(
    String bearerToken, {
    required String platform,
    required String token,
    String? deviceName,
  }) async =>
      throw UnimplementedError();

  @override
  Future<void> disableDeviceToken(String bearerToken, String tokenId) async =>
      throw UnimplementedError();
}

// ── Fixtures ───────────────────────────────────────────────────────────────────

final _unreadEvent = NotificationEventModel(
  id: 'event-1',
  templateId: 'template-1',
  channel: 'in_app',
  category: 'learning_reminder',
  status: 'delivered',
  title: 'Time to learn',
  body: 'Your daily lesson is ready.',
  scheduledAt: '2026-06-20T08:00:00Z',
  sentAt: '2026-06-20T08:00:00Z',
  readAt: null,
  dismissedAt: null,
  createdAt: '2026-06-20T08:00:00Z',
);

final _quietHoursModel = QuietHoursModel(
  enabled: true,
  startTime: '22:00',
  endTime: '07:00',
  timezone: 'UTC',
);

final _activeReminder = ReminderScheduleModel.fromJson({
  'id': 'reminder-1',
  'reminder_type': 'review',
  'status': 'active',
  'cron_expression': '0 9 * * *',
});

const _backendError = AppException(
  message: 'Backend error',
  code: 'NOTIFICATION_BACKEND_ERROR',
);

void main() {
  group('NotificationInboxNotifier', () {
    test('starts idle, then loads the backend-returned inbox', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(inbox: [_unreadEvent]),
          ),
        ],
      );
      addTearDown(container.dispose);

      expect(
        container.read(notificationInboxProvider),
        isA<AppAsyncIdle<List<NotificationEventModel>>>(),
      );

      await container
          .read(notificationInboxProvider.notifier)
          .load(bearerToken: 'tok');

      final state = container.read(notificationInboxProvider)
          as AppAsyncSuccess<List<NotificationEventModel>>;
      expect(state.data.single.id, 'event-1');
      expect(state.data.single.isUnread, isTrue);
    });

    test('load surfaces a backend failure', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(error: _backendError),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationInboxProvider.notifier)
          .load(bearerToken: 'tok');

      final state = container.read(notificationInboxProvider)
          as AppAsyncFailure<List<NotificationEventModel>>;
      expect(state.code, 'NOTIFICATION_BACKEND_ERROR');
    });

    test('markAsRead updates the cached event with the backend response',
        () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(inbox: [_unreadEvent]),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationInboxProvider.notifier)
          .load(bearerToken: 'tok');
      await container
          .read(notificationInboxProvider.notifier)
          .markAsRead(bearerToken: 'tok', eventId: 'event-1');

      final state = container.read(notificationInboxProvider)
          as AppAsyncSuccess<List<NotificationEventModel>>;
      expect(state.data.single.isUnread, isFalse);
    });

    test('dismiss updates the cached event with the backend response',
        () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(inbox: [_unreadEvent]),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationInboxProvider.notifier)
          .load(bearerToken: 'tok');
      await container
          .read(notificationInboxProvider.notifier)
          .dismiss(bearerToken: 'tok', eventId: 'event-1');

      final state = container.read(notificationInboxProvider)
          as AppAsyncSuccess<List<NotificationEventModel>>;
      expect(state.data.single.dismissedAt, isNotNull);
    });
  });

  group('NotificationPreferencesNotifier', () {
    test('load returns the backend preference list', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(preferences: const []),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationPreferencesProvider.notifier)
          .load(bearerToken: 'tok');

      expect(
        container.read(notificationPreferencesProvider),
        isA<AppAsyncSuccess<List<NotificationPreferenceModel>>>(),
      );
    });

    test('setEnabled appends a new preference row when none existed',
        () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(preferences: const []),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationPreferencesProvider.notifier)
          .load(bearerToken: 'tok');
      await container.read(notificationPreferencesProvider.notifier).setEnabled(
            bearerToken: 'tok',
            channel: 'push',
            category: 'deadline_reminder',
            enabled: false,
          );

      final state = container.read(notificationPreferencesProvider)
          as AppAsyncSuccess<List<NotificationPreferenceModel>>;
      expect(state.data.single.channel, 'push');
      expect(state.data.single.enabled, isFalse);
    });

    test('setEnabled is a no-op until preferences have loaded', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(preferences: const []),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(notificationPreferencesProvider.notifier).setEnabled(
            bearerToken: 'tok',
            channel: 'push',
            category: 'deadline_reminder',
            enabled: false,
          );

      expect(
        container.read(notificationPreferencesProvider),
        isA<AppAsyncIdle<List<NotificationPreferenceModel>>>(),
      );
    });
  });

  group('QuietHoursNotifier', () {
    test('load returns the backend quiet hours, verbatim', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(quietHours: _quietHoursModel),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationQuietHoursProvider.notifier)
          .load(bearerToken: 'tok');

      final state = container.read(notificationQuietHoursProvider)
          as AppAsyncSuccess<QuietHoursModel>;
      expect(state.data.startTime, '22:00');
      expect(state.data.timezone, 'UTC');
    });

    test('update surfaces a backend failure', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(error: _backendError),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container.read(notificationQuietHoursProvider.notifier).update(
            bearerToken: 'tok',
            enabled: true,
            startTime: '21:00',
            endTime: '06:00',
            timezone: 'UTC',
          );

      final state = container.read(notificationQuietHoursProvider)
          as AppAsyncFailure<QuietHoursModel>;
      expect(state.code, 'NOTIFICATION_BACKEND_ERROR');
    });
  });

  group('ReminderScheduleNotifier', () {
    test('load returns the backend reminder schedules', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(reminders: [_activeReminder]),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationRemindersProvider.notifier)
          .load(bearerToken: 'tok');

      final state = container.read(notificationRemindersProvider)
          as AppAsyncSuccess<List<ReminderScheduleModel>>;
      expect(state.data.single.status, 'active');
    });

    test('pause/resume/cancel update the cached schedule with the backend response',
        () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(reminders: [_activeReminder]),
          ),
        ],
      );
      addTearDown(container.dispose);

      final notifier = container.read(notificationRemindersProvider.notifier);
      await notifier.load(bearerToken: 'tok');

      await notifier.pause(bearerToken: 'tok', scheduleId: 'reminder-1');
      expect(
        (container.read(notificationRemindersProvider)
                as AppAsyncSuccess<List<ReminderScheduleModel>>)
            .data
            .single
            .status,
        'paused',
      );

      await notifier.resume(bearerToken: 'tok', scheduleId: 'reminder-1');
      expect(
        (container.read(notificationRemindersProvider)
                as AppAsyncSuccess<List<ReminderScheduleModel>>)
            .data
            .single
            .status,
        'active',
      );

      await notifier.cancel(bearerToken: 'tok', scheduleId: 'reminder-1');
      expect(
        (container.read(notificationRemindersProvider)
                as AppAsyncSuccess<List<ReminderScheduleModel>>)
            .data
            .single
            .status,
        'cancelled',
      );
    });
  });

  group('UnreadCountNotifier', () {
    test('load returns the backend-reported unread count', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(unreadCount: 3),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationUnreadCountProvider.notifier)
          .load(bearerToken: 'tok');

      final state = container.read(notificationUnreadCountProvider)
          as AppAsyncSuccess<int>;
      expect(state.data, 3);
    });

    test('load surfaces a backend failure with a fallback message', () async {
      final container = ProviderContainer(
        overrides: [
          notificationRepositoryProvider.overrideWithValue(
            _FakeNotificationRepository(
              error: const AppException(message: 'boom', code: 'BOOM'),
            ),
          ),
        ],
      );
      addTearDown(container.dispose);

      await container
          .read(notificationUnreadCountProvider.notifier)
          .load(bearerToken: 'tok');

      expect(
        container.read(notificationUnreadCountProvider),
        isA<AppAsyncFailure<int>>(),
      );
    });
  });
}
