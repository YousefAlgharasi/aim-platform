import 'api_error_envelope.dart';
import 'api_meta.dart';

typedef ApiJsonDecoder<T> = T Function(Object? json);

class ApiResponseEnvelope<T> {
  const ApiResponseEnvelope({
    required this.success,
    required this.meta,
    this.data,
    this.error,
  });

  factory ApiResponseEnvelope.fromJson(
    Map<String, dynamic> json, {
    required ApiJsonDecoder<T> decodeData,
  }) {
    final success = json['success'] as bool? ?? false;
    final meta = ApiMeta.fromJson(json['meta'] as Map<String, dynamic>?);

    if (success) {
      return ApiResponseEnvelope<T>(
        success: true,
        data: decodeData(json['data']),
        meta: meta,
      );
    }

    return ApiResponseEnvelope<T>(
      success: false,
      error: json['error'] is Map<String, dynamic>
          ? ApiErrorEnvelope.fromJson(json['error'] as Map<String, dynamic>)
          : const ApiErrorEnvelope(
              code: 'UNKNOWN_ERROR',
              message: 'Unknown API error',
            ),
      meta: meta,
    );
  }

  final bool success;
  final T? data;
  final ApiErrorEnvelope? error;
  final ApiMeta meta;
}
