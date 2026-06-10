import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_async_state.dart';

abstract class AppStateNotifier<T> extends StateNotifier<AppAsyncState<T>> {
  AppStateNotifier() : super(const AppAsyncState.idle());

  void setLoading() {
    state = const AppAsyncState.loading();
  }

  void setSuccess(T data) {
    state = AppAsyncState.success(data);
  }

  void setFailure({
    required String message,
    String? code,
  }) {
    state = AppAsyncState.failure(
      message: message,
      code: code,
    );
  }

  void reset() {
    state = const AppAsyncState.idle();
  }
}
