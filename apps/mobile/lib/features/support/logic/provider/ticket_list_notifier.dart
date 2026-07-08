import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../../data/models/support_models.dart';
import '../repository/support_repository.dart';

class TicketListNotifier extends AppStateNotifier<List<SupportTicket>> {
  TicketListNotifier({required SupportRepository repository})
      : _repository = repository;

  final SupportRepository _repository;

  Future<void> load() async {
    setLoading();
    try {
      final tickets = await _repository.getTickets();
      setSuccess(tickets);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load tickets',
        code: 'TICKET_LIST_LOAD_FAILED',
      );
    }
  }
}
