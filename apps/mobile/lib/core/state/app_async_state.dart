sealed class AppAsyncState<T> {
  const AppAsyncState();

  const factory AppAsyncState.idle() = AppAsyncIdle<T>;
  const factory AppAsyncState.loading() = AppAsyncLoading<T>;
  const factory AppAsyncState.success(T data) = AppAsyncSuccess<T>;
  const factory AppAsyncState.failure({
    required String message,
    String? code,
  }) = AppAsyncFailure<T>;

  bool get isLoading => this is AppAsyncLoading<T>;
  bool get hasData => this is AppAsyncSuccess<T>;
  bool get hasError => this is AppAsyncFailure<T>;
}

final class AppAsyncIdle<T> extends AppAsyncState<T> {
  const AppAsyncIdle();
}

final class AppAsyncLoading<T> extends AppAsyncState<T> {
  const AppAsyncLoading();
}

final class AppAsyncSuccess<T> extends AppAsyncState<T> {
  const AppAsyncSuccess(this.data);

  final T data;
}

final class AppAsyncFailure<T> extends AppAsyncState<T> {
  const AppAsyncFailure({
    required this.message,
    this.code,
  });

  final String message;
  final String? code;
}
