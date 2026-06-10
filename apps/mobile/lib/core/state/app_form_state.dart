class AppFormState {
  const AppFormState({
    this.isSubmitting = false,
    this.isValid = false,
    this.errorMessage,
  });

  final bool isSubmitting;
  final bool isValid;
  final String? errorMessage;

  AppFormState copyWith({
    bool? isSubmitting,
    bool? isValid,
    String? errorMessage,
    bool clearError = false,
  }) {
    return AppFormState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isValid: isValid ?? this.isValid,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}
