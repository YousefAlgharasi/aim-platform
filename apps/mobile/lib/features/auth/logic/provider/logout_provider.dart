import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'auth_context_provider.dart';
import 'logout_notifier.dart';

final logoutProvider =
    StateNotifierProvider<LogoutNotifier, AppAsyncState<void>>(
  (ref) => LogoutNotifier(
    repository: ref.watch(authRepositoryProvider),
    ref: ref,
  ),
);
