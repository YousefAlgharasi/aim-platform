import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/config.dart';
import 'api_client_exception.dart';
import 'api_response_envelope.dart';
import 'auth_interceptor.dart';

// P6-022: BackendApiClient — centralised backend API consumer.
//
// Rules:
// - All network calls go to BackendApiPaths endpoints only.
// - No AIM Engine or AI provider URLs are ever used here.
// - Authentication is passed as a Bearer token via authHeader().
// - Flutter never calculates learning values; it only sends requests and
//   displays what the backend returns.

class BackendApiClient {
  BackendApiClient({
    required AppConfig config,
    http.Client? httpClient,
    AuthInterceptor? authInterceptor,
  })  : _config = config,
        _httpClient = httpClient ?? http.Client(),
        _authInterceptor = authInterceptor;

  final AppConfig _config;
  final http.Client _httpClient;
  final AuthInterceptor? _authInterceptor;

  // ---------------------------------------------------------------------------
  // Auth header helper — P6-022
  // Pass the Supabase access token returned by the auth flow.
  // Never store or log the token inside this client.
  // ---------------------------------------------------------------------------

  /// Returns an Authorization header map for authenticated requests.
  static Map<String, String> authHeader(String accessToken) => {
        'authorization': 'Bearer $accessToken',
      };

  // ---------------------------------------------------------------------------
  // URI builder
  // ---------------------------------------------------------------------------

  Uri buildUri(String path, [Map<String, String>? queryParameters]) {
    final base = Uri.parse(_config.backendApiBaseUrl);
    final normalizedPath = path.startsWith('/') ? path : '/$path';

    return base.replace(
      path: _joinPaths(base.path, normalizedPath),
      queryParameters: queryParameters,
    );
  }

  // ---------------------------------------------------------------------------
  // HTTP methods
  // ---------------------------------------------------------------------------

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

  Future<ApiResponseEnvelope<T>> delete<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Map<String, String>? headers,
  }) async {
    final response = await _httpClient.delete(
      buildUri(path),
      headers: _jsonHeaders(headers),
    );

    return _parseResponse<T>(response, decodeData: decodeData);
  }

  // ---------------------------------------------------------------------------
  // Server-Sent Events — P18-061
  // Used only for backend SSE endpoints that stream an already
  // safety-filtered reply (e.g. /ai-teacher/sessions/:id/messages/stream).
  // Never used for a direct AI provider call.
  // ---------------------------------------------------------------------------

  Stream<Map<String, dynamic>> streamSse(
    String path, {
    Object? body,
    Map<String, String>? headers,
  }) async* {
    final request = http.Request('POST', buildUri(path))
      ..headers.addAll(_jsonHeaders(headers))
      ..body = body == null ? '' : jsonEncode(body);

    final streamedResponse = await _httpClient.send(request);

    if (streamedResponse.statusCode < 200 || streamedResponse.statusCode >= 300) {
      final raw = await streamedResponse.stream.bytesToString();
      throw ApiClientException(
        code: 'STREAM_REQUEST_FAILED',
        message: 'AI Teacher stream request failed.',
        statusCode: streamedResponse.statusCode,
        details: raw,
      );
    }

    final lines =
        streamedResponse.stream.transform(utf8.decoder).transform(const LineSplitter());

    await for (final line in lines) {
      if (!line.startsWith('data:')) continue;
      final payload = line.substring('data:'.length).trim();
      if (payload.isEmpty) continue;

      final decoded = jsonDecode(payload);
      if (decoded is Map<String, dynamic>) {
        yield decoded;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Response parsing
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  Map<String, String> _jsonHeaders(Map<String, String>? headers) {
    final base = <String, String>{
      'accept': 'application/json',
      'content-type': 'application/json',
      ...?headers,
    };

    return _authInterceptor?.apply(base) ?? base;
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
