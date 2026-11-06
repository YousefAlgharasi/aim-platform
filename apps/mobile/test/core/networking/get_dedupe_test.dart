import 'dart:async';
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:aim_mobile/core/config/config.dart';
import 'package:aim_mobile/core/networking/networking.dart';

const _config = AppConfig(
  environment: 'test',
  backendApiBaseUrl: 'https://api.example.com',
);

void main() {
  test('concurrent identical GETs share one network call', () async {
    var calls = 0;
    final gate = Completer<void>();
    final client = BackendApiClient(
      config: _config,
      responseCache: ApiResponseCache(
        directoryProvider: () async => throw StateError('no disk'),
      ),
      httpClient: MockClient((request) async {
        calls++;
        await gate.future;
        return http.Response(
          jsonEncode({'success': true, 'data': {'n': 1}}),
          200,
          headers: {'content-type': 'application/json'},
        );
      }),
    );

    Future<Object?> call() => client
        .get<Map<String, dynamic>>(
          '/student/home',
          decodeData: (j) => j as Map<String, dynamic>,
        )
        .then((e) => e.data);

    final a = call();
    final b = call();
    await Future<void>.delayed(const Duration(milliseconds: 20));
    gate.complete();

    expect(await a, {'n': 1});
    expect(await b, {'n': 1});
    expect(calls, 1);
  });

  test('a write starts a fresh GET instead of joining an older one', () async {
    var calls = 0;
    final client = BackendApiClient(
      config: _config,
      httpClient: MockClient((request) async {
        calls++;
        return http.Response(
          jsonEncode({'success': true, 'data': {'n': calls}}),
          200,
          headers: {'content-type': 'application/json'},
        );
      }),
    );

    await client.get<Object?>('/x', decodeData: (j) => j);
    await client.post<Object?>('/x', decodeData: (j) => j);
    await client.get<Object?>('/x', decodeData: (j) => j);
    expect(calls, 3);
  });
}
