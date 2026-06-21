import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';

import '../models/notification_models.dart';
import 'notification_remote_datasource.dart';

class NotificationRemoteDatasourceImpl implements NotificationRemoteDatasource {
  const NotificationRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<DeviceTokenModel> registerDeviceToken(
    String bearerToken, {
    required String platform,
    required String token,
    String? deviceName,
  }) async {
    final envelope = await _apiClient.post<DeviceTokenModel>(
      BackendApiPaths.notificationDeviceTokens,
      headers: _authHeaders(bearerToken),
      body: {
        'platform': platform,
        'token': token,
        if (deviceName != null) 'deviceName': deviceName,
      },
      decodeData: (json) =>
          DeviceTokenModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<void> disableDeviceToken(String bearerToken, String tokenId) async {
    await _apiClient.delete<void>(
      BackendApiPaths.notificationDeviceToken(tokenId),
      headers: _authHeaders(bearerToken),
      decodeData: (_) {},
    );
  }

  @override
  Future<List<NotificationPreferenceModel>> getPreferences(
    String bearerToken,
  ) async {
    final envelope = await _apiClient.get<List<NotificationPreferenceModel>>(
      BackendApiPaths.notificationPreferences,
      headers: _authHeaders(bearerToken),
      decodeData: (json) => (json as List<dynamic>)
          .map((e) =>
              NotificationPreferenceModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data!;
  }

  @override
  Future<NotificationPreferenceModel> updatePreference(
    String bearerToken, {
    required String channel,
    required String category,
    required bool enabled,
  }) async {
    final envelope = await _apiClient.patch<NotificationPreferenceModel>(
      BackendApiPaths.notificationPreferences,
      headers: _authHeaders(bearerToken),
      body: {
        'channel': channel,
        'category': category,
        'enabled': enabled,
      },
      decodeData: (json) =>
          NotificationPreferenceModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<List<NotificationEventModel>> getInbox(
    String bearerToken, {
    int limit = 20,
    int offset = 0,
  }) async {
    final envelope = await _apiClient.get<List<NotificationEventModel>>(
      BackendApiPaths.notificationInbox,
      headers: _authHeaders(bearerToken),
      queryParameters: {
        'limit': '$limit',
        'offset': '$offset',
      },
      decodeData: (json) => (json as List<dynamic>)
          .map((e) =>
              NotificationEventModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data!;
  }

  @override
  Future<int> getUnreadCount(String bearerToken) async {
    final envelope = await _apiClient.get<int>(
      BackendApiPaths.notificationInboxUnreadCount,
      headers: _authHeaders(bearerToken),
      decodeData: (json) => (json as Map<String, dynamic>)['count'] as int,
    );
    return envelope.data!;
  }

  @override
  Future<NotificationEventModel> markAsRead(
    String bearerToken,
    String eventId,
  ) async {
    final envelope = await _apiClient.patch<NotificationEventModel>(
      BackendApiPaths.notificationMarkRead(eventId),
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          NotificationEventModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<NotificationEventModel> dismiss(
    String bearerToken,
    String eventId,
  ) async {
    final envelope = await _apiClient.patch<NotificationEventModel>(
      BackendApiPaths.notificationDismiss(eventId),
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          NotificationEventModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<List<ReminderScheduleModel>> getReminders(String bearerToken) async {
    final envelope = await _apiClient.get<List<ReminderScheduleModel>>(
      BackendApiPaths.notificationReminders,
      headers: _authHeaders(bearerToken),
      decodeData: (json) => (json as List<dynamic>)
          .map((e) =>
              ReminderScheduleModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    return envelope.data!;
  }

  @override
  Future<ReminderScheduleModel> pauseReminder(
    String bearerToken,
    String scheduleId,
  ) async {
    final envelope = await _apiClient.patch<ReminderScheduleModel>(
      BackendApiPaths.notificationPauseReminder(scheduleId),
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          ReminderScheduleModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<ReminderScheduleModel> resumeReminder(
    String bearerToken,
    String scheduleId,
  ) async {
    final envelope = await _apiClient.patch<ReminderScheduleModel>(
      BackendApiPaths.notificationResumeReminder(scheduleId),
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          ReminderScheduleModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<ReminderScheduleModel> cancelReminder(
    String bearerToken,
    String scheduleId,
  ) async {
    final envelope = await _apiClient.patch<ReminderScheduleModel>(
      BackendApiPaths.notificationCancelReminder(scheduleId),
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          ReminderScheduleModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<QuietHoursModel> getQuietHours(String bearerToken) async {
    final envelope = await _apiClient.get<QuietHoursModel>(
      BackendApiPaths.notificationQuietHours,
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          QuietHoursModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  @override
  Future<QuietHoursModel> updateQuietHours(
    String bearerToken, {
    required bool enabled,
    required String startTime,
    required String endTime,
    required String timezone,
  }) async {
    final envelope = await _apiClient.patch<QuietHoursModel>(
      BackendApiPaths.notificationQuietHours,
      headers: _authHeaders(bearerToken),
      body: {
        'enabled': enabled,
        'startTime': startTime,
        'endTime': endTime,
        'timezone': timezone,
      },
      decodeData: (json) =>
          QuietHoursModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  Map<String, String> _authHeaders(String bearerToken) {
    return {'authorization': 'Bearer $bearerToken'};
  }
}
