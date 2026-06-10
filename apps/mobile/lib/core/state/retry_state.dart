class RetryState {
  const RetryState({
    this.retryCount = 0,
    this.lastErrorMessage,
    this.lastErrorCode,
  });

  final int retryCount;
  final String? lastErrorMessage;
  final String? lastErrorCode;

  RetryState copyWith({
    int? retryCount,
    String? lastErrorMessage,
    String? lastErrorCode,
    bool clearError = false,
  }) {
    return RetryState(
      retryCount: retryCount ?? this.retryCount,
      lastErrorMessage: clearError
          ? null
          : lastErrorMessage ?? this.lastErrorMessage,
      lastErrorCode: clearError ? null : lastErrorCode ?? this.lastErrorCode,
    );
  }
}
