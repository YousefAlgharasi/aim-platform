import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart' as http_parser;

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
  // Pass the backend access token returned by POST /auth/login (or refreshed
  // via POST /auth/refresh). Never store or log the token inside this client.
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
    return _sendWithRefreshRetry<T>(
      decodeData: decodeData,
      send: (effectiveHeaders) => _httpClient.get(
        buildUri(path, queryParameters),
        headers: effectiveHeaders,
      ),
      buildHeaders: () => _jsonHeaders(headers),
    );
  }

  Future<ApiResponseEnvelope<T>> post<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Object? body,
    Map<String, String>? headers,
    bool requiresAuth = true,
  }) async {
    final encodedBody = body == null ? null : jsonEncode(body);

    return _sendWithRefreshRetry<T>(
      decodeData: decodeData,
      send: (effectiveHeaders) => _httpClient.post(
        buildUri(path),
        headers: effectiveHeaders,
        body: encodedBody,
      ),
      buildHeaders: () => requiresAuth
          ? _jsonHeaders(headers)
          : _jsonHeadersWithoutAuth(headers),
      // Unauthenticated calls (login/refresh/register) must never trigger
      // a refresh-retry loop.
      allowRefreshRetry: requiresAuth,
    );
  }

  Future<ApiResponseEnvelope<T>> patch<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Object? body,
    Map<String, String>? headers,
  }) async {
    final encodedBody = body == null ? null : jsonEncode(body);

    return _sendWithRefreshRetry<T>(
      decodeData: decodeData,
      send: (effectiveHeaders) => _httpClient.patch(
        buildUri(path),
        headers: effectiveHeaders,
        body: encodedBody,
      ),
      buildHeaders: () => _jsonHeaders(headers),
    );
  }

  Future<ApiResponseEnvelope<T>> delete<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Map<String, String>? headers,
  }) async {
    return _sendWithRefreshRetry<T>(
      decodeData: decodeData,
      send: (effectiveHeaders) => _httpClient.delete(
        buildUri(path),
        headers: effectiveHeaders,
      ),
      buildHeaders: () => _jsonHeaders(headers),
    );
  }

  /// Multipart upload (e.g. voice audio submission). Used only for backend
  /// endpoints that accept a binary file alongside the bearer token; never
  /// used to send audio to an AI provider directly.
  Future<ApiResponseEnvelope<T>> postMultipart<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    required List<int> fileBytes,
    required String fieldName,
    required String fileName,
    String? mimeType,
    Map<String, String>? fields,
    Map<String, String>? headers,
  }) async {
    final request = http.MultipartRequest('POST', buildUri(path))
      ..headers.addAll(_authHeadersOnly(headers))
      ..fields.addAll(fields ?? const {})
      ..files.add(
        http.MultipartFile.fromBytes(
          fieldName,
          fileBytes,
          filename: fileName,
          contentType:
              mimeType == null ? null : http_parser.MediaType.parse(mimeType),
        ),
      );

    final streamedResponse = await _httpClient.send(request);
    final response = await http.Response.fromStream(streamedResponse);

    return _parseResponse<T>(response, decodeData: decodeData);
  }

  /// Raw byte fetch (e.g. voice audio playback). Returns the response body
  /// bytes as-is; this endpoint does not use the JSON envelope.
  Future<List<int>> getBytes(
    String path, {
    Map<String, String>? headers,
  }) async {
    final response = await _httpClient.get(
      buildUri(path),
      headers: _authHeadersOnly(headers),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiClientException(
        code: 'AUDIO_FETCH_FAILED',
        message: 'Failed to fetch voice audio.',
        statusCode: response.statusCode,
      );
    }

    return response.bodyBytes;
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
  // 401 refresh-and-retry — P? (auth refactor)
  // On a 401, attempt a single token refresh via the auth interceptor's
  // [AuthInterceptor.onUnauthorized] hook, then retry the request once with
  // the new token. If refresh fails (or no hook is configured), the
  // original 401 is surfaced as an [ApiClientException] as before.
  // ---------------------------------------------------------------------------

  Future<ApiResponseEnvelope<T>> _sendWithRefreshRetry<T>({
    required Future<http.Response> Function(Map<String, String> headers) send,
    required Map<String, String> Function() buildHeaders,
    required ApiJsonDecoder<T> decodeData,
    bool allowRefreshRetry = true,
  }) async {
    final response = await send(buildHeaders());

    if (response.statusCode != 401 ||
        !allowRefreshRetry ||
        _authInterceptor?.onUnauthorized == null) {
      return _parseResponse<T>(response, decodeData: decodeData);
    }

    final newToken = await _authInterceptor!.onUnauthorized!();
    if (newToken == null || newToken.isEmpty) {
      return _parseResponse<T>(response, decodeData: decodeData);
    }

    // Retry once with the refreshed token, bypassing the stale token that
    // would otherwise be re-attached by the interceptor.
    final retryHeaders = {...buildHeaders(), 'authorization': 'Bearer $newToken'};
    final retryResponse = await send(retryHeaders);

    return _parseResponse<T>(retryResponse, decodeData: decodeData);
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

  /// JSON headers without the auth interceptor — used for unauthenticated
  /// backend calls (login, refresh, register) where no bearer token exists
  /// yet, or where the caller deliberately must not attach the current
  /// session's token.
  Map<String, String> _jsonHeadersWithoutAuth(Map<String, String>? headers) {
    return <String, String>{
      'accept': 'application/json',
      'content-type': 'application/json',
      ...?headers,
    };
  }

  /// Auth-only headers, without the JSON content-type (used for multipart
  /// uploads and raw byte fetches, which set their own content handling).
  Map<String, String> _authHeadersOnly(Map<String, String>? headers) {
    final base = <String, String>{
      'accept': 'application/json',
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
