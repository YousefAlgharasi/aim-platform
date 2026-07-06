import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:aim_mobile/core/config/config.dart';
import 'package:aim_mobile/core/networking/networking.dart';

void main() {
  test('builds Backend API URL from AppConfig only', () {
    final client = BackendApiClient(
      config: const AppConfig(
        environment: 'test',
        backendApiBaseUrl: 'https://api.example.com/v1',
      ),
      httpClient: MockClient((request) async {
        return http.Response(
            '{"success":true,"data":{"ok":true},"meta":{}}', 200);
      }),
    );

    final uri = client.buildUri('/health');

    expect(uri.toString(), 'https://api.example.com/v1/health');
    expect(uri.toString().contains('aim-engine'), isFalse);
    expect(uri.toString().contains('openai'), isFalse);
  });

  test('get parses successful backend envelope', () async {
    final client = BackendApiClient(
      config: const AppConfig(
        environment: 'test',
        backendApiBaseUrl: 'https://api.example.com',
      ),
      httpClient: MockClient((request) async {
        expect(request.url.toString(), 'https://api.example.com/health');

        return http.Response(
          '{"success":true,"data":{"status":"ok"},"meta":{"path":"/health","method":"GET"}}',
          200,
        );
      }),
    );

    final response = await client.get<Map<String, dynamic>>(
      BackendApiPaths.health,
      decodeData: (json) => json! as Map<String, dynamic>,
    );

    expect(response.data?['status'], 'ok');
    expect(response.meta.path, '/health');
    expect(response.meta.method, 'GET');
  });

  test('get throws ApiClientException for backend error envelope', () async {
    final client = BackendApiClient(
      config: const AppConfig(
        environment: 'test',
        backendApiBaseUrl: 'https://api.example.com',
      ),
      httpClient: MockClient((request) async {
        return http.Response(
          '{"success":false,"error":{"code":"UNAUTHORIZED","message":"Unauthorized"},"meta":{}}',
          401,
        );
      }),
    );

    await expectLater(
      client.get<void>(
        '/protected',
        decodeData: (_) {},
      ),
      throwsA(
        isA<ApiClientException>()
            .having((error) => error.code, 'code', 'UNAUTHORIZED')
            .having((error) => error.statusCode, 'statusCode', 401),
      ),
    );
  });

  test('attaches token from interceptor on outgoing requests', () async {
    final client = BackendApiClient(
      config: const AppConfig(
        environment: 'test',
        backendApiBaseUrl: 'https://api.example.com',
      ),
      authInterceptor: AuthInterceptor(() => 'token-abc'),
      httpClient: MockClient((request) async {
        expect(request.headers['authorization'], 'Bearer token-abc');

        return http.Response(
          '{"success":true,"data":{"ok":true},"meta":{}}',
          200,
        );
      }),
    );

    await client.get<Map<String, dynamic>>(
      BackendApiPaths.health,
      decodeData: (json) => json! as Map<String, dynamic>,
    );
  });

  test(
      'get surfaces a slow/hanging backend as a retryable ApiClientException '
      'instead of hanging forever', () async {
    final client = BackendApiClient(
      config: const AppConfig(
        environment: 'test',
        backendApiBaseUrl: 'https://api.example.com',
      ),
      requestTimeout: const Duration(milliseconds: 20),
      httpClient: MockClient((request) async {
        await Future<void>.delayed(const Duration(milliseconds: 200));
        return http.Response(
          '{"success":true,"data":{"ok":true},"meta":{}}',
          200,
        );
      }),
    );

    await expectLater(
      client.get<Map<String, dynamic>>(
        BackendApiPaths.health,
        decodeData: (json) => json! as Map<String, dynamic>,
      ),
      throwsA(
        isA<ApiClientException>()
            .having((error) => error.code, 'code', 'REQUEST_TIMEOUT'),
      ),
    );
  });
}
