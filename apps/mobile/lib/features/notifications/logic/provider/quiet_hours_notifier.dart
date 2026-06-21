// P13-057: QuietHoursNotifier — manages the student quiet-hours settings
// screen state. The backend remains the final authority on whether quiet
// hours actually suppress a notification at send time.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../entity/notification_entities.dart';
import '../repository/notification_repository.dart';

class QuietHoursNotifier extends AppStateNotifier<QuietHoursModel> {
  QuietHoursNotifier({required NotificationRepository repository})
      : _repository = repository;

  final NotificationRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final quietHours = await _repository.getQuietHours(bearerToken);
      setSuccess(quietHours);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load quiet hours',
        code: 'QUIET_HOURS_LOAD_FAILED',
      );
    }
  }

  Future<void> update({
    required String bearerToken,
    required bool enabled,
    required String startTime,
    required String endTime,
    required String timezone,
  }) async {
    setLoading();
    try {
      final quietHours = await _repository.updateQuietHours(
        bearerToken,
        enabled: enabled,
        startTime: startTime,
        endTime: endTime,
        timezone: timezone,
      );
      setSuccess(quietHours);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    }
  }
}
