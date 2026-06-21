import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/auth/logic/repository/auth_repository.dart';
import 'auth_context_provider.dart';
import 'auth_flow_provider.dart';
import 'session_store_provider.dart';

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

    // 1. Best-effort server-side logout — failure must not block local cleanup.
    try {
      await _repository.logout(bearerToken);
    } catch (_) {}

    // 2. Clear persisted session so the user is not auto-restored on next launch.
    try {
      await _ref.read(sessionStoreProvider).clear();
    } catch (_) {
      // Storage failure must not block local auth state cleanup.
    }

    // 3. Clear in-memory auth state.
    _ref.read(authContextProvider.notifier).clearCurrentUser();
    _ref.read(authFlowProvider.notifier).signOut();

    setSuccess(null);
  }
}
