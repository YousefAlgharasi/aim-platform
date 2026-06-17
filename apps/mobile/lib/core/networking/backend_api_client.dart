import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/config.dart';
import 'api_client_exception.dart';
import 'api_response_envelope.dart';

class BackendApiClient {
  BackendApiClient({
    required AppConfig config,
    http.Client? httpClient,
  })  : _config = config,
        _httpClient = httpClient ?? http.Client();

  final AppConfig _config;
  final http.Client _httpClient;

  Uri buildUri(String path, [Map<String, String>? queryParameters]) {
    final base = Uri.parse(_config.backendApiBaseUrl);
    final normalizedPath = path.startsWith('/') ? path : '/$path';

    return base.replace(
      path: _joinPaths(base.path, normalizedPath),
      queryParameters: queryParameters,
    );
  }

  Future<ApiResponseEnvelope<T>> get<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Map<String, String>? queryParameters,
    Map<String, String>? headers,
  }) async {
    final response = await _httpClient.get(
      buildUri(path, queryParameters),
      headers: _jsonHeaders(headers),
    );

    return _parseResponse<T>(response, decodeData: decodeData);
  }

  Future<ApiResponseEnvelope<T>> post<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Object? body,
    Map<String, String>? headers,
  }) async {
    final response = await _httpClient.post(
      buildUri(path),
      headers: _jsonHeaders(headers),
      body: body == null ? null : jsonEncode(body),
    );

    return _parseResponse<T>(response, decodeData: decodeData);
  }

  Future<ApiResponseEnvelope<T>> patch<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Object? body,
    Map<String, String>? headers,
  }) async {
    final response = await _httpClient.patch(
      buildUri(path),
      headers: _jsonHeaders(headers),
      body: body == null ? null : jsonEncode(body),
    );

    return _parseResponse<T>(response, decodeData: decodeData);
  }

  Future<ApiResponseEnvelope<T>> _parseResponse<T>(
    http.Response response, {
    required ApiJsonDecoder<T> decodeData,
  }) async {
    final decoded = jsonDecode(response.body);

    if (decoded is! Map<String, dynamic>) {
      throw ApiClientException(
        code: 'INVALID_RESPONSE',
        message: 'Backend API returned a non-object response.',
        statusCode: response.statusCode,
      );
    }

    final envelope = ApiResponseEnvelope<T>.fromJson(
      decoded,
      decodeData: decodeData,
    );

    if (!envelope.success) {
      final error = envelope.error;

      throw ApiClientException(
        code: error?.code ?? 'UNKNOWN_ERROR',
        message: error?.message ?? 'Unknown API error',
        statusCode: response.statusCode,
        details: error?.details,
      );
    }

    return envelope;
  }

  Map<String, String> _jsonHeaders(Map<String, String>? headers) {
    return <String, String>{
      'accept': 'application/json',
      'content-type': 'application/json',
      ...?headers,
    };
  }

  String _joinPaths(String basePath, String requestPath) {
    final cleanBase = basePath.endsWith('/')
        ? basePath.substring(0, basePath.length - 1)
        : basePath;
    final cleanRequest =
        requestPath.startsWith('/') ? requestPath.substring(1) : requestPath;

    if (cleanBase.isEmpty) return '/$cleanRequest';
    if (cleanRequest.isEmpty) return cleanBase;
    return '$cleanBase/$cleanRequest';
  }
}
