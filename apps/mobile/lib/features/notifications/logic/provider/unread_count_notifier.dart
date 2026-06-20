// P13-059: UnreadCountNotifier — backs unread notification badges shown in
// navigation. The backend remains the source of truth for unread counts;
// this notifier only relays the backend-returned value.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../repository/notification_repository.dart';

class UnreadCountNotifier extends AppStateNotifier<int> {
  UnreadCountNotifier({required NotificationRepository repository})
      : _repository = repository;

  final NotificationRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final count = await _repository.getUnreadCount(bearerToken);
      setSuccess(count);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load unread count',
        code: 'NOTIFICATION_UNREAD_COUNT_LOAD_FAILED',
      );
    }
  }
}
