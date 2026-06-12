import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/state/app_async_state.dart';
import '../../../core/state/app_state_notifier.dart';
import 'auth_context_notifier.dart';
import 'auth_context_provider.dart';
import 'auth_flow_notifier.dart';
import 'auth_flow_provider.dart';
import 'repository/auth_repository.dart';

class LogoutNotifier extends AppStateNotifier<void> {
  LogoutNotifier({
    required AuthRepository repository,
    required Ref ref,
  })  : _repository = repository,
        _ref = ref;

  final AuthRepository _repository;
  final Ref _ref;

  Future<void> logout(String bearerToken) async {
    setLoading();
    try {
      await _repository.logout(bearerToken);
    } catch (_) {
      // Backend logout failure must not block local cleanup.
    }

    _ref.read(authContextProvider.notifier).clearCurrentUser();
    _ref.read(authFlowProvider.notifier).signOut();

    setSuccess(null);
  }
}
