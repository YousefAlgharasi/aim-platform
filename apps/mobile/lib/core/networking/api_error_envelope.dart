class ApiErrorEnvelope {
  const ApiErrorEnvelope({
    required this.code,
    required this.message,
    this.details,
  });

  factory ApiErrorEnvelope.fromJson(Map<String, dynamic> json) {
    return ApiErrorEnvelope(
      code: json['code'] as String? ?? 'UNKNOWN_ERROR',
      message: json['message'] as String? ?? 'Unknown API error',
      details: json['details'],
    );
  }

  final String code;
  final String message;
  final Object? details;
}
