class ApiMeta {
  const ApiMeta({
    this.timestamp,
    this.path,
    this.method,
    this.requestId,
    this.pagination,
  });

  factory ApiMeta.fromJson(Map<String, dynamic>? json) {
    if (json == null) {
      return const ApiMeta();
    }

    return ApiMeta(
      timestamp: json['timestamp'] as String?,
      path: json['path'] as String?,
      method: json['method'] as String?,
      requestId: json['requestId'] as String?,
      pagination: json['pagination'] is Map<String, dynamic>
          ? Map<String, dynamic>.unmodifiable(
              json['pagination'] as Map<String, dynamic>,
            )
          : null,
    );
  }

  final String? timestamp;
  final String? path;
  final String? method;
  final String? requestId;
  final Map<String, dynamic>? pagination;
}
