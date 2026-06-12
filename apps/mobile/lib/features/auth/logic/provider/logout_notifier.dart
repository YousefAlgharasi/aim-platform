import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';

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
