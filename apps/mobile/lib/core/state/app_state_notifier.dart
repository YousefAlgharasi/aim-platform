// P6-024: AppStateNotifier — base class for all Phase 6 feature notifiers.
//
// Provides:
// - Typed [AppAsyncState<T>] state management.
// - Standardised run() helper that wraps async calls with loading/error/success.
// - Automatic error mapping via AppErrorHandler.
// - Auth error detection so callers can sign out on 401.

import 'package:aim_mobile/core/errors/app_error_handler.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

abstract class AppStateNotifier<T> extends StateNotifier<AppAsyncState<T>> {
  AppStateNotifier() : super(const AppAsyncState.idle());

  /// Runs [action], setting loading → success/failure automatically.
  ///
  /// If [showLoading] is false, the current state is kept while [action] runs
  /// (useful for background refreshes).
  Future<void> run(
    Future<T> Function() action, {
    bool showLoading = true,
  }) async {
    if (showLoading) {
      state = const AppAsyncState.loading();
    }
    try {
      final result = await action();
      if (mounted) state = AppAsyncState.success(result);
    } catch (e) {
      if (mounted) state = AppErrorHandler.mapToFailure<T>(e);
    }
  }

  /// Resets state to idle.
  void reset() => state = const AppAsyncState.idle();
}
