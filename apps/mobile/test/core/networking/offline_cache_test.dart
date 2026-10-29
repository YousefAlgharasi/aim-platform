import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:aim_mobile/core/config/config.dart';
import 'package:aim_mobile/core/networking/networking.dart';

const _config = AppConfig(
  environment: 'test',
  backendApiBaseUrl: 'https://api.example.com',
);

String _jwt(String sub) {
  String part(Map<String, dynamic> m) =>
      base64Url.encode(utf8.encode(jsonEncode(m))).replaceAll('=', '');
  return 'Bearer ${part({'alg': 'none'})}.${part({'sub': sub})}.sig';
}

void main() {
  late Directory tempDir;
  late DateTime now;
  late ApiResponseCache cache;

  setUp(() async {
    tempDir = await Directory.systemTemp.createTemp('api_cache_test');
    now = DateTime(2026, 1, 1, 12);
    cache = ApiResponseCache(
      directoryProvider: () async => tempDir,
      clock: () => now,
    );
  });

  tearDown(() async {
    if (await tempDir.exists()) await tempDir.delete(recursive: true);
  });

  group('ApiResponseCache', () {
    test('keys are scoped to the signed-in user', () {
      final uri = Uri.parse('https://api.example.com/student/home');
      expect(
        ApiResponseCache.keyFor(uri, _jwt('user-a')),
        isNot(ApiResponseCache.keyFor(uri, _jwt('user-b'))),
      );
      expect(ApiResponseCache.keyFor(uri, null), startsWith('anon|'));
    });

    test('auth endpoints are never cached', () {
      expect(ApiResponseCache.isCacheable('/auth/login'), isFalse);
      expect(ApiResponseCache.isCacheable('/student/home'), isTrue);
    });

    test('responses are fresh for the window and stale after a mutation',
        () async {
      now = now.add(const Duration(seconds: 1));
      await cache.write('k', 'body');
      final saved = (await cache.read('k'))!;
      expect(saved.body, 'body');
      expect(cache.isFresh(saved), isTrue);

      now = now.add(const Duration(seconds: 1));
      cache.markStale();
      expect(cache.isFresh(saved), isFalse);
    });

    test('responses expire after freshFor', () async {
      now = now.add(const Duration(seconds: 1));
      await cache.write('k', 'body');
      final saved = (await cache.read('k'))!;
      now = now.add(const Duration(minutes: 2));
      expect(cache.isFresh(saved), isFalse);
    });

    test('clear removes saved responses', () async {
      await cache.write('k', 'body');
      await cache.clear();
      expect(await cache.read('k'), isNull);
    });
  });

  group('BackendApiClient offline behaviour', () {
    test('maps socket failures to NETWORK_ERROR with an offline message',
        () async {
      final status = NetworkStatus();
      final client = BackendApiClient(
        config: _config,
        networkStatus: status,
        httpClient: MockClient((_) async => throw const SocketException('no')),
      );

      await expectLater(
        client.get<Object?>('/student/home', decodeData: (j) => j),
        throwsA(isA<ApiClientException>()
            .having((e) => e.code, 'code', BackendApiClient.networkErrorCode)
            .having((e) => e.message, 'message', contains('offline'))),
      );
      expect(status.isOffline, isTrue);
    });

    test('serves the saved response when offline', () async {
      var online = true;
      final status = NetworkStatus();
      final client = BackendApiClient(
        config: _config,
        responseCache: cache,
        networkStatus: status,
        httpClient: MockClient((_) async {
          if (!online) throw const SocketException('no');
          return http.Response(
              '{"success":true,"data":{"n":1},"meta":{}}', 200);
        }),
      );

      now = now.add(const Duration(seconds: 1));
      final first = await client.get<Map<String, dynamic>>('/student/home',
          decodeData: (j) => j! as Map<String, dynamic>);
      expect(first.data?['n'], 1);

      online = false;
      now = now.add(const Duration(minutes: 5));
      final second = await client.get<Map<String, dynamic>>('/student/home',
          decodeData: (j) => j! as Map<String, dynamic>);
      expect(second.data?['n'], 1);
      expect(status.value.showingSavedData, isTrue);
    });

    test('reuses a fresh response without a network call', () async {
      var calls = 0;
      final client = BackendApiClient(
        config: _config,
        responseCache: cache,
        httpClient: MockClient((_) async {
          calls++;
          return http.Response(
              '{"success":true,"data":{"n":$calls},"meta":{}}', 200);
        }),
      );
      now = now.add(const Duration(seconds: 1));

      await client.get<Object?>('/student/home', decodeData: (j) => j);
      final again = await client.get<Map<String, dynamic>>('/student/home',
          decodeData: (j) => j! as Map<String, dynamic>);
      expect(calls, 1);
      expect(again.data?['n'], 1);

      now = now.add(const Duration(seconds: 1));
      await client.post<Object?>('/student/lessons/1/complete',
          decodeData: (j) => j);
      now = now.add(const Duration(seconds: 1));
      await client.get<Object?>('/student/home', decodeData: (j) => j);
      expect(calls, 3);
    });
  });
}
