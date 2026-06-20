import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/networking/backend_api_client_provider.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';

import '../../data/datasources/notification_remote_datasource.dart';
import '../../data/datasources/notification_remote_datasource_impl.dart';
import '../../data/repository/repo_impl/notification_repository_impl.dart';
import '../entity/notification_entities.dart';
import '../repository/notification_repository.dart';

// P13-053: Notification feature providers.
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

/// Holds the in-app notification inbox state for the current user.
final notificationInboxProvider = StateProvider<
    AppAsyncState<List<NotificationEventModel>>>((ref) {
  return const AppAsyncState.idle();
});

/// Holds the unread notification count badge state.
final notificationUnreadCountProvider = StateProvider<AppAsyncState<int>>(
  (ref) => const AppAsyncState.idle(),
);

/// Holds the user's notification channel/category preferences.
final notificationPreferencesProvider = StateProvider<
    AppAsyncState<List<NotificationPreferenceModel>>>((ref) {
  return const AppAsyncState.idle();
});

/// Holds the user's active reminder schedules.
final notificationRemindersProvider = StateProvider<
    AppAsyncState<List<ReminderScheduleModel>>>((ref) {
  return const AppAsyncState.idle();
});

/// Holds the user's quiet hours settings.
final notificationQuietHoursProvider =
    StateProvider<AppAsyncState<QuietHoursModel>>(
  (ref) => const AppAsyncState.idle(),
);
