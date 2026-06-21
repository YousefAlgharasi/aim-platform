// P13-055: NotificationInboxNotifier — manages the in-app notification
// inbox screen state. All data is backend-supplied; Flutter never computes
// eligibility, delivery state, or read/unread status on its own.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../entity/notification_entities.dart';
import '../repository/notification_repository.dart';

class NotificationInboxNotifier
    extends AppStateNotifier<List<NotificationEventModel>> {
  NotificationInboxNotifier({required NotificationRepository repository})
      : _repository = repository;

  final NotificationRepository _repository;

  Future<void> load({
    required String bearerToken,
    int limit = 20,
    int offset = 0,
  }) async {
    setLoading();
    try {
      final items = await _repository.getInbox(
        bearerToken,
        limit: limit,
        offset: offset,
      );
      setSuccess(items);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load notifications',
        code: 'NOTIFICATION_INBOX_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({required String bearerToken}) =>
      load(bearerToken: bearerToken);

  /// Marks [eventId] as read and updates the cached list optimistically
  /// with the backend's returned event (the backend remains the source of
  /// truth for the resulting read state).
  Future<void> markAsRead({
    required String bearerToken,
    required String eventId,
  }) async {
    final current = state;
    if (current is! AppAsyncSuccess<List<NotificationEventModel>>) return;

    try {
      final updated = await _repository.markAsRead(bearerToken, eventId);
      setSuccess([
        for (final event in current.data)
          if (event.id == eventId) updated else event,
      ]);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    }
  }

  Future<void> dismiss({
    required String bearerToken,
    required String eventId,
  }) async {
    final current = state;
    if (current is! AppAsyncSuccess<List<NotificationEventModel>>) return;

    try {
      final updated = await _repository.dismiss(bearerToken, eventId);
      setSuccess([
        for (final event in current.data)
          if (event.id == eventId) updated else event,
      ]);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    }
  }
}
