import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/backend_api_client_provider.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';

import '../../data/datasources/notification_remote_datasource.dart';
import '../../data/datasources/notification_remote_datasource_impl.dart';
import '../../data/repository/repo_impl/notification_repository_impl.dart';
import '../entity/notification_entities.dart';
import '../repository/notification_repository.dart';
import 'notification_inbox_notifier.dart';
import 'notification_preferences_notifier.dart';
import 'quiet_hours_notifier.dart';
import 'reminder_schedule_notifier.dart';
import 'unread_count_notifier.dart';

// P13-053/P13-055: Notification feature providers.
//
// These only expose backend-returned state to the UI. Eligibility, delivery
// state, quiet-hour enforcement, and token validity are never computed here.

final notificationRemoteDatasourceProvider =
    Provider<NotificationRemoteDatasource>((ref) {
  return NotificationRemoteDatasourceImpl(
    apiClient: ref.watch(backendApiClientProvider),
  );
});

final notificationRepositoryProvider = Provider<NotificationRepository>(
  (ref) => NotificationRepositoryImpl(
    datasource: ref.watch(notificationRemoteDatasourceProvider),
  ),
);

/// In-app notification inbox screen state.
final notificationInboxProvider = StateNotifierProvider.autoDispose<
    NotificationInboxNotifier, AppAsyncState<List<NotificationEventModel>>>(
  (ref) => NotificationInboxNotifier(
    repository: ref.watch(notificationRepositoryProvider),
  ),
);

/// Holds the user's notification channel/category preferences.
final notificationPreferencesProvider = StateNotifierProvider.autoDispose<
    NotificationPreferencesNotifier,
    AppAsyncState<List<NotificationPreferenceModel>>>(
  (ref) => NotificationPreferencesNotifier(
    repository: ref.watch(notificationRepositoryProvider),
  ),
);

/// Holds the user's active reminder schedules.
final notificationRemindersProvider = StateNotifierProvider.autoDispose<
    ReminderScheduleNotifier, AppAsyncState<List<ReminderScheduleModel>>>(
  (ref) => ReminderScheduleNotifier(
    repository: ref.watch(notificationRepositoryProvider),
  ),
);

/// Holds the unread in-app notification count, used to drive unread
/// badges/indicators in navigation.
final notificationUnreadCountProvider = StateNotifierProvider.autoDispose<
    UnreadCountNotifier, AppAsyncState<int>>(
  (ref) => UnreadCountNotifier(
    repository: ref.watch(notificationRepositoryProvider),
  ),
);

/// Holds the user's quiet hours settings.
final notificationQuietHoursProvider = StateNotifierProvider.autoDispose<
    QuietHoursNotifier, AppAsyncState<QuietHoursModel>>(
  (ref) => QuietHoursNotifier(
    repository: ref.watch(notificationRepositoryProvider),
  ),
);
