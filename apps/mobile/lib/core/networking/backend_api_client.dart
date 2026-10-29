import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart' as http_parser;

import '../config/config.dart';
import '../logging/app_logger.dart';
import 'api_client_exception.dart';
import 'api_meta.dart';
import 'api_response_cache.dart';
import 'api_response_envelope.dart';
import 'auth_interceptor.dart';
import 'media_cache.dart';
import 'network_status.dart';

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
    Duration requestTimeout = const Duration(seconds: 20),
    ApiResponseCache? responseCache,
    MediaCache? mediaCache,
    NetworkStatus? networkStatus,
  })  : _config = config,
        _httpClient = httpClient ?? http.Client(),
        _authInterceptor = authInterceptor,
        _requestTimeout = requestTimeout,
        _responseCache = responseCache,
        _mediaCache = mediaCache,
        _networkStatus = networkStatus;

  final AppConfig _config;
  final http.Client _httpClient;
  final AuthInterceptor? _authInterceptor;

  /// Saved GET responses: reused while fresh, and shown when offline.
  final ApiResponseCache? _responseCache;

  /// Saved audio bytes for [getBytes].
  final MediaCache? _mediaCache;

  /// Offline signal for the UI, fed by real request outcomes.
  final NetworkStatus? _networkStatus;

  /// Bound on every outbound call so a slow or cold-starting backend
  /// surfaces as a catchable [ApiClientException] instead of leaving the
  /// awaiting notifier (and its UI) stuck on an unresolved loading state
  /// forever.
  final Duration _requestTimeout;

  Future<T> _withTimeout<T>(
    Future<T> Function() send, {
    Duration? timeout,
  }) async {
    final effectiveTimeout = timeout ?? _requestTimeout;
    try {
      final result = await send().timeout(
        effectiveTimeout,
        onTimeout: () {
          const exc = ApiClientException(
            code: 'REQUEST_TIMEOUT',
            message: 'The request took too long to respond. Please try again.',
          );
          AppLogger.e('BackendApiClient', 'Request timeout after ${effectiveTimeout.inSeconds}s', exc);
          throw exc;
        },
      );
      _networkStatus?.reportReachable();
      return result;
    } on ApiClientException catch (e) {
      if (isConnectivityError(e)) _networkStatus?.reportUnreachable();
      rethrow;
    } on SocketException catch (e) {
      throw _networkError(e);
    } on HandshakeException catch (e) {
      throw _networkError(e);
    } on http.ClientException catch (e) {
      throw _networkError(e);
    } catch (e, st) {
      AppLogger.e('BackendApiClient', 'Network request failed with exception', e, st);
      rethrow;
    }
  }

  /// No connection / server unreachable, as opposed to an error response.
  static bool isConnectivityError(Object error) =>
      error is ApiClientException &&
      (error.code == networkErrorCode || error.code == 'REQUEST_TIMEOUT');

  static const String networkErrorCode = 'NETWORK_ERROR';

  ApiClientException _networkError(Object cause) {
    AppLogger.w('BackendApiClient', 'Server unreachable', cause);
    _networkStatus?.reportUnreachable();
    return const ApiClientException(
      code: networkErrorCode,
      message: "You're offline. Check your internet connection and try again.",
    );
  }

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
    final parsedUri = Uri.parse(normalizedPath);
    final combinedQueryParams = {
      ...parsedUri.queryParameters,
      if (queryParameters != null) ...queryParameters,
    };

    return base.replace(
      path: _joinPaths(base.path, parsedUri.path),
      queryParameters: combinedQueryParams.isNotEmpty ? combinedQueryParams : null,
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
    final uri = buildUri(path, queryParameters);
    final cache = ApiResponseCache.isCacheable(path) ? _responseCache : null;
    final cacheKey = cache == null
        ? null
        : ApiResponseCache.keyFor(uri, _jsonHeaders(headers)['authorization']);

    final saved = cacheKey == null ? null : await cache!.read(cacheKey);
    if (saved != null && cache!.isFresh(saved)) {
      return _parseResponse<T>(http.Response(saved.body, 200), decodeData: decodeData);
    }

    try {
      return await _sendWithRefreshRetry<T>(
        decodeData: decodeData,
        send: (effectiveHeaders) => _withTimeout(() => _httpClient.get(
              uri,
              headers: effectiveHeaders,
            )),
        buildHeaders: () => _jsonHeaders(headers),
        onSuccessBody: cacheKey == null ? null : (body) => cache!.write(cacheKey, body),
      );
    } on ApiClientException catch (e) {
      // Offline: show the last saved copy instead of an error.
      if (saved != null && isConnectivityError(e)) {
        _networkStatus?.reportServedFromCache();
        return _parseResponse<T>(http.Response(saved.body, 200), decodeData: decodeData);
      }
      rethrow;
    }
  }

  Future<ApiResponseEnvelope<T>> post<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Object? body,
    Map<String, String>? headers,
    Map<String, String>? queryParameters,
    bool requiresAuth = true,
  }) async {
    final encodedBody = body == null ? null : jsonEncode(body);

    return _mutate(() => _sendWithRefreshRetry<T>(
      decodeData: decodeData,
      send: (effectiveHeaders) => _withTimeout(() => _httpClient.post(
            buildUri(path, queryParameters),
            headers: effectiveHeaders,
            body: encodedBody,
          )),
      buildHeaders: () => requiresAuth
          ? _jsonHeaders(headers)
          : _jsonHeadersWithoutAuth(headers),
      // Unauthenticated calls (login/refresh/register) must never trigger
      // a refresh-retry loop.
      allowRefreshRetry: requiresAuth,
    ));
  }

  Future<ApiResponseEnvelope<T>> put<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Object? body,
    Map<String, String>? headers,
  }) async {
    final encodedBody = body == null ? null : jsonEncode(body);

    return _mutate(() => _sendWithRefreshRetry<T>(
      decodeData: decodeData,
      send: (effectiveHeaders) => _withTimeout(() => _httpClient.put(
            buildUri(path),
            headers: effectiveHeaders,
            body: encodedBody,
          )),
      buildHeaders: () => _jsonHeaders(headers),
    ));
  }

  Future<ApiResponseEnvelope<T>> patch<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Object? body,
    Map<String, String>? headers,
  }) async {
    final encodedBody = body == null ? null : jsonEncode(body);

    return _mutate(() => _sendWithRefreshRetry<T>(
      decodeData: decodeData,
      send: (effectiveHeaders) => _withTimeout(() => _httpClient.patch(
            buildUri(path),
            headers: effectiveHeaders,
            body: encodedBody,
          )),
      buildHeaders: () => _jsonHeaders(headers),
    ));
  }

  Future<ApiResponseEnvelope<T>> delete<T>(
    String path, {
    required ApiJsonDecoder<T> decodeData,
    Map<String, String>? headers,
  }) async {
    return _mutate(() => _sendWithRefreshRetry<T>(
      decodeData: decodeData,
      send: (effectiveHeaders) => _withTimeout(() => _httpClient.delete(
            buildUri(path),
            headers: effectiveHeaders,
          )),
      buildHeaders: () => _jsonHeaders(headers),
    ));
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

    final streamedResponse = await _withTimeout(
      () => _httpClient.send(request),
      timeout: const Duration(seconds: 60),
    );
    final response = await http.Response.fromStream(streamedResponse);

    final result = await _parseResponse<T>(response, decodeData: decodeData);
    _responseCache?.markStale();
    return result;
  }

  /// Raw byte fetch (e.g. voice audio playback). Returns the response body
  /// bytes as-is; this endpoint does not use the JSON envelope.
  Future<List<int>> getBytes(
    String path, {
    Map<String, String>? headers,
  }) async {
    final uri = buildUri(path);
    final saved = await _mediaCache?.read(uri);
    if (saved != null) return saved;

    final response = await _withTimeout(
      () => _httpClient.get(
        uri,
        headers: _authHeadersOnly(headers),
      ),
      timeout: const Duration(seconds: 60),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final exc = ApiClientException(
        code: 'AUDIO_FETCH_FAILED',
        message: 'Failed to fetch voice audio: HTTP ${response.statusCode}',
        statusCode: response.statusCode,
      );
      AppLogger.e(
        'BackendApiClient',
        'HTTP ${response.statusCode} [$uri] ${exc.code}: ${response.body}',
        exc,
      );
      throw exc;
    }

    await _mediaCache?.write(uri, response.bodyBytes);
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

    // Only the initial connection is bounded — once headers arrive the
    // response is a genuinely long-lived stream of AI Teacher reply chunks.
    final streamedResponse =
        await _withTimeout(() => _httpClient.send(request));

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
    void Function(String body)? onSuccessBody,
  }) async {
    final response = await send(buildHeaders());

    if (response.statusCode != 401 ||
        !allowRefreshRetry ||
        _authInterceptor?.onUnauthorized == null) {
      return _parseAndKeep<T>(response, decodeData, onSuccessBody);
    }

    final newToken = await _authInterceptor!.onUnauthorized!();
    if (newToken == null || newToken.isEmpty) {
      return _parseResponse<T>(response, decodeData: decodeData);
    }

    // Retry once with the refreshed token, bypassing the stale token that
    // would otherwise be re-attached by the interceptor.
    final retryHeaders = {...buildHeaders(), 'authorization': 'Bearer $newToken'};
    final retryResponse = await send(retryHeaders);

    return _parseAndKeep<T>(retryResponse, decodeData, onSuccessBody);
  }

  /// Parses [response]; when it's a successful envelope, hands the raw body
  /// to [onSuccessBody] (used to save GET responses for offline use).
  Future<ApiResponseEnvelope<T>> _parseAndKeep<T>(
    http.Response response,
    ApiJsonDecoder<T> decodeData,
    void Function(String body)? onSuccessBody,
  ) async {
    final envelope = await _parseResponse<T>(response, decodeData: decodeData);
    if (onSuccessBody != null &&
        response.statusCode >= 200 &&
        response.statusCode < 300 &&
        response.body.trim().isNotEmpty) {
      onSuccessBody(response.body);
    }
    return envelope;
  }

  /// Runs a write request; once it succeeds, saved GET responses stop being
  /// reused as fresh (they still serve offline), so the next read shows the
  /// change.
  Future<ApiResponseEnvelope<T>> _mutate<T>(
    Future<ApiResponseEnvelope<T>> Function() send,
  ) async {
    final result = await send();
    _responseCache?.markStale();
    return result;
  }

  // ---------------------------------------------------------------------------
  // Response parsing
  // ---------------------------------------------------------------------------

  Future<ApiResponseEnvelope<T>> _parseResponse<T>(
    http.Response response, {
    required ApiJsonDecoder<T> decodeData,
  }) async {
    if (response.statusCode == 204 || response.body.trim().isEmpty) {
      return ApiResponseEnvelope<T>(
        success: true,
        meta: const ApiMeta(),
        data: null,
      );
    }

    final decoded = jsonDecode(response.body);

    if (decoded is! Map<String, dynamic>) {
      final exc = ApiClientException(
        code: 'INVALID_RESPONSE',
        message: 'Backend API returned a non-object response.',
        statusCode: response.statusCode,
      );
      AppLogger.e('BackendApiClient', 'HTTP ${response.statusCode} [${response.request?.url}]: Non-object response', exc);
      throw exc;
    }

    final envelope = ApiResponseEnvelope<T>.fromJson(
      decoded,
      decodeData: decodeData,
    );

    if (!envelope.success) {
      final error = envelope.error;
      final exc = ApiClientException(
        code: error?.code ?? 'UNKNOWN_ERROR',
        message: error?.message ?? 'Unknown API error',
        statusCode: response.statusCode,
        details: error?.details,
      );
      AppLogger.e(
        'BackendApiClient',
        'HTTP ${response.statusCode} [${response.request?.url}] ${exc.code}: ${exc.message}',
        exc,
      );
      throw exc;
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
