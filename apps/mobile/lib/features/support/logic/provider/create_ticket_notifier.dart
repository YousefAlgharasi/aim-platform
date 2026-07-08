import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../../data/models/support_models.dart';
import '../repository/support_repository.dart';

class CreateTicketNotifier extends AppStateNotifier<SupportTicket> {
  CreateTicketNotifier({required SupportRepository repository})
      : _repository = repository;

  final SupportRepository _repository;

  Future<void> submit({
    required String category,
    required String severity,
    required String subject,
    required String description,
  }) async {
    setLoading();
    try {
      final ticket = await _repository.createTicket(
        category: category,
        severity: severity,
        subject: subject,
        description: description,
      );
      setSuccess(ticket);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to submit ticket',
        code: 'TICKET_CREATE_FAILED',
      );
    }
  }
}
