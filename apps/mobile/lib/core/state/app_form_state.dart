class AppFormState {
  const AppFormState({
    this.isSubmitting = false,
    this.isValid = false,
    this.errorMessage,
    this.fieldErrors = const {},
  });

  final bool isSubmitting;
  final bool isValid;
  final String? errorMessage;
  final Map<String, String> fieldErrors;

  String? fieldError(String field) => fieldErrors[field];

  AppFormState copyWith({
    bool? isSubmitting,
    bool? isValid,
    String? errorMessage,
    Map<String, String>? fieldErrors,
    bool clearError = false,
    bool clearFieldErrors = false,
  }) {
    return AppFormState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isValid: isValid ?? this.isValid,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
      fieldErrors: clearFieldErrors ? const {} : fieldErrors ?? this.fieldErrors,
    );
  }
}
