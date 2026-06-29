// InvoiceNotifier — drives the "Invoice History" screen.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import '../../data/models/billing_models.dart';
import '../repository/billing_repository.dart';

class InvoiceNotifier extends AppStateNotifier<List<InvoiceModel>> {
  InvoiceNotifier({required BillingRepository repository})
      : _repository = repository;

  final BillingRepository _repository;

  Future<void> load() async {
    setLoading();
    try {
      final invoices = await _repository.getInvoices();
      setSuccess(invoices);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load invoices',
        code: 'INVOICES_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh() => load();
}
