import '../entity/notification_entities.dart';

// P13-053: Notification feature repository boundary.
//
// Backend remains the final authority for notification eligibility,
// delivery state, quiet hours, and device token validity. This repository
// only relays requests and backend-returned state to the UI layer.
abstract class NotificationRepository {
  Future<DeviceTokenModel> registerDeviceToken(
    String bearerToken, {
    required String platform,
    required String token,
    String? deviceName,
  });

  Future<void> disableDeviceToken(String bearerToken, String tokenId);

  Future<List<NotificationPreferenceModel>> getPreferences(
    String bearerToken,
  );

  Future<NotificationPreferenceModel> updatePreference(
    String bearerToken, {
    required String channel,
    required String category,
    required bool enabled,
  });

  Future<List<NotificationEventModel>> getInbox(
    String bearerToken, {
    int limit = 20,
    int offset = 0,
  });

  Future<int> getUnreadCount(String bearerToken);

  Future<NotificationEventModel> markAsRead(
    String bearerToken,
    String eventId,
  );

  Future<NotificationEventModel> dismiss(
    String bearerToken,
    String eventId,
  );

  Future<List<ReminderScheduleModel>> getReminders(String bearerToken);

  Future<ReminderScheduleModel> pauseReminder(
    String bearerToken,
    String scheduleId,
  );

  Future<ReminderScheduleModel> resumeReminder(
    String bearerToken,
    String scheduleId,
  );

  Future<ReminderScheduleModel> cancelReminder(
    String bearerToken,
    String scheduleId,
  );

  Future<QuietHoursModel> getQuietHours(String bearerToken);

  Future<QuietHoursModel> updateQuietHours(
    String bearerToken, {
    required bool enabled,
    required String startTime,
    required String endTime,
    required String timezone,
  });
}
