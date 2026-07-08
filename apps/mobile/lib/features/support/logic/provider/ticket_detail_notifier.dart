import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../../data/models/support_models.dart';
import '../repository/support_repository.dart';

class TicketDetailNotifier extends AppStateNotifier<SupportTicket> {
  TicketDetailNotifier({required SupportRepository repository})
      : _repository = repository;

  final SupportRepository _repository;

  Future<void> load(String ticketId) async {
    setLoading();
    try {
      final ticket = await _repository.getTicket(ticketId);
      setSuccess(ticket);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load ticket',
        code: 'TICKET_DETAIL_LOAD_FAILED',
      );
    }
  }

  Future<TicketComment?> addComment(String ticketId, String body) async {
    try {
      return await _repository.addTicketComment(ticketId: ticketId, body: body);
    } catch (_) {
      return null;
    }
  }
}
