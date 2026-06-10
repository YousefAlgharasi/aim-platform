class ApiClientException implements Exception {
  const ApiClientException({
    required this.code,
    required this.message,
    this.statusCode,
    this.details,
  });

  final String code;
  final String message;
  final int? statusCode;
  final Object? details;

  @override
  String toString() {
    return 'ApiClientException(code: $code, message: $message, statusCode: $statusCode)';
  }
}
