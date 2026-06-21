// P13-057: NotificationPreferencesNotifier — manages the student
// notification preferences screen state. Enable/disable decisions are
// only requests to the backend; the backend remains the final authority
// on whether a notification is actually eligible to send.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../entity/notification_entities.dart';
import '../repository/notification_repository.dart';

class NotificationPreferencesNotifier
    extends AppStateNotifier<List<NotificationPreferenceModel>> {
  NotificationPreferencesNotifier({required NotificationRepository repository})
      : _repository = repository;

  final NotificationRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final preferences = await _repository.getPreferences(bearerToken);
      setSuccess(preferences);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load preferences',
        code: 'NOTIFICATION_PREFERENCES_LOAD_FAILED',
      );
    }
  }

  Future<void> setEnabled({
    required String bearerToken,
    required String channel,
    required String category,
    required bool enabled,
  }) async {
    final current = state;
    if (current is! AppAsyncSuccess<List<NotificationPreferenceModel>>) {
      return;
    }

    try {
      final updated = await _repository.updatePreference(
        bearerToken,
        channel: channel,
        category: category,
        enabled: enabled,
      );

      final exists =
          current.data.any((p) => p.channel == channel && p.category == category);

      setSuccess([
        for (final pref in current.data)
          if (pref.channel == channel && pref.category == category)
            updated
          else
            pref,
        if (!exists) updated,
      ]);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    }
  }
}
