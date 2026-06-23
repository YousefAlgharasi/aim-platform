import 'package:aim_mobile/core/config/config.dart';
import 'package:aim_mobile/core/networking/networking.dart';
import 'package:aim_mobile/features/auth/data/datasources/auth_remote_datasource_impl.dart';
import 'package:aim_mobile/features/auth/data/models/auth_sync_response_model.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  group('AuthRemoteDatasourceImpl', () {
    test('syncUser calls backend /auth/bootstrap and parses bootstrap result',
        () async {
      final client = BackendApiClient(
        config: const AppConfig(
          environment: 'test',
          backendApiBaseUrl: 'https://api.example.com',
        ),
        httpClient: MockClient((request) async {
          expect(request.method, 'POST');
          expect(
              request.url.toString(), 'https://api.example.com/auth/bootstrap');
          expect(request.headers['authorization'], 'Bearer token-abc');

          return http.Response(
            '{"success":true,"data":{"internalUserId":"user-1","userType":"student","status":"active","userCreated":true,"profileCreated":true,"profileType":"student_profile"},"meta":{}}',
            200,
          );
        }),
      );
      final datasource = AuthRemoteDatasourceImpl(apiClient: client);

      final result = await datasource.syncUser('token-abc');

      expect(result.user.id, 'user-1');
      expect(result.user.userType, 'student');
      expect(result.created, isTrue);
    });
  });

  group('AuthSyncResponseModel', () {
    test('parses legacy user wrapper response', () {
      final result = AuthSyncResponseModel.fromJson({
        'user': {
          'id': 'user-2',
          'email': 'learner@example.com',
          'phone': null,
          'userType': 'student',
          'status': 'active',
        },
        'created': false,
      });

      expect(result.user.id, 'user-2');
      expect(result.user.email, 'learner@example.com');
      expect(result.created, isFalse);
    });
  });
}
