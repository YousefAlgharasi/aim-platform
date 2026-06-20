import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';

import '../../../logic/entity/notification_entities.dart';
import '../../../logic/repository/notification_repository.dart';
import '../../datasources/notification_remote_datasource.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  const NotificationRepositoryImpl({
    required NotificationRemoteDatasource datasource,
  }) : _datasource = datasource;

  final NotificationRemoteDatasource _datasource;

  @override
  Future<DeviceTokenModel> registerDeviceToken(
    String bearerToken, {
    required String platform,
    required String token,
    String? deviceName,
  }) {
    return _guard(() => _datasource.registerDeviceToken(
          bearerToken,
          platform: platform,
          token: token,
          deviceName: deviceName,
        ));
  }

  @override
  Future<void> disableDeviceToken(String bearerToken, String tokenId) {
    return _guard(() => _datasource.disableDeviceToken(bearerToken, tokenId));
  }

  @override
  Future<List<NotificationPreferenceModel>> getPreferences(
    String bearerToken,
  ) {
    return _guard(() => _datasource.getPreferences(bearerToken));
  }

  @override
  Future<NotificationPreferenceModel> updatePreference(
    String bearerToken, {
    required String channel,
    required String category,
    required bool enabled,
  }) {
    return _guard(() => _datasource.updatePreference(
          bearerToken,
          channel: channel,
          category: category,
          enabled: enabled,
        ));
  }

  @override
  Future<List<NotificationEventModel>> getInbox(
    String bearerToken, {
    int limit = 20,
    int offset = 0,
  }) {
    return _guard(
      () => _datasource.getInbox(bearerToken, limit: limit, offset: offset),
    );
  }

  @override
  Future<int> getUnreadCount(String bearerToken) {
    return _guard(() => _datasource.getUnreadCount(bearerToken));
  }

  @override
  Future<NotificationEventModel> markAsRead(
    String bearerToken,
    String eventId,
  ) {
    return _guard(() => _datasource.markAsRead(bearerToken, eventId));
  }

  @override
  Future<NotificationEventModel> dismiss(
    String bearerToken,
    String eventId,
  ) {
    return _guard(() => _datasource.dismiss(bearerToken, eventId));
  }

  @override
  Future<List<ReminderScheduleModel>> getReminders(String bearerToken) {
    return _guard(() => _datasource.getReminders(bearerToken));
  }

  @override
  Future<ReminderScheduleModel> pauseReminder(
    String bearerToken,
    String scheduleId,
  ) {
    return _guard(() => _datasource.pauseReminder(bearerToken, scheduleId));
  }

  @override
  Future<ReminderScheduleModel> resumeReminder(
    String bearerToken,
    String scheduleId,
  ) {
    return _guard(() => _datasource.resumeReminder(bearerToken, scheduleId));
  }

  @override
  Future<ReminderScheduleModel> cancelReminder(
    String bearerToken,
    String scheduleId,
  ) {
    return _guard(() => _datasource.cancelReminder(bearerToken, scheduleId));
  }

  @override
  Future<QuietHoursModel> getQuietHours(String bearerToken) {
    return _guard(() => _datasource.getQuietHours(bearerToken));
  }

  @override
  Future<QuietHoursModel> updateQuietHours(
    String bearerToken, {
    required bool enabled,
    required String startTime,
    required String endTime,
    required String timezone,
  }) {
    return _guard(() => _datasource.updateQuietHours(
          bearerToken,
          enabled: enabled,
          startTime: startTime,
          endTime: endTime,
          timezone: timezone,
        ));
  }

  Future<T> _guard<T>(Future<T> Function() action) async {
    try {
      return await action();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
