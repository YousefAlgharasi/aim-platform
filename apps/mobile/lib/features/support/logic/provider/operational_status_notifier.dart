import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';

import '../../data/models/support_models.dart';
import '../repository/support_repository.dart';

class OperationalStatusNotifier extends AppStateNotifier<List<OperationalStatus>> {
  OperationalStatusNotifier({required SupportRepository repository})
      : _repository = repository;

  final SupportRepository _repository;

  Future<void> load() async {
    setLoading();
    try {
      final statuses = await _repository.getOperationalStatus();
      setSuccess(statuses);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load system status',
        code: 'OPERATIONAL_STATUS_LOAD_FAILED',
      );
    }
  }
}
