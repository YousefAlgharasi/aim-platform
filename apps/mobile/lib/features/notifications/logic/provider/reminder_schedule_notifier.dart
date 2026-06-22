// P13-058: ReminderScheduleNotifier — manages the student reminder
// settings screen state. Pause/resume/cancel are requests only; the
// backend remains the final authority on the resulting schedule state.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';

import '../entity/notification_entities.dart';
import '../repository/notification_repository.dart';

class ReminderScheduleNotifier
    extends AppStateNotifier<List<ReminderScheduleModel>> {
  ReminderScheduleNotifier({required NotificationRepository repository})
      : _repository = repository;

  final NotificationRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final reminders = await _repository.getReminders(bearerToken);
      setSuccess(reminders);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load reminders',
        code: 'REMINDER_SCHEDULES_LOAD_FAILED',
      );
    }
  }

  Future<void> _applyUpdate(
    String scheduleId,
    Future<ReminderScheduleModel> Function() request,
  ) async {
    final current = state;
    if (current is! AppAsyncSuccess<List<ReminderScheduleModel>>) return;

    try {
      final updated = await request();
      setSuccess([
        for (final schedule in current.data)
          if (schedule.id == scheduleId) updated else schedule,
      ]);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    }
  }

  Future<void> pause({
    required String bearerToken,
    required String scheduleId,
  }) =>
      _applyUpdate(
        scheduleId,
        () => _repository.pauseReminder(bearerToken, scheduleId),
      );

  Future<void> resume({
    required String bearerToken,
    required String scheduleId,
  }) =>
      _applyUpdate(
        scheduleId,
        () => _repository.resumeReminder(bearerToken, scheduleId),
      );

  Future<void> cancel({
    required String bearerToken,
    required String scheduleId,
  }) =>
      _applyUpdate(
        scheduleId,
        () => _repository.cancelReminder(bearerToken, scheduleId),
      );
}
