import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/features/auth/data/datasources/supabase_auth_datasource_impl.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  group('SupabaseAuthDatasourceImpl', () {
    test('maps signup email rate limit to a clear retry message', () async {
      final datasource = SupabaseAuthDatasourceImpl(
        supabaseUrl: 'https://example.supabase.co',
        supabaseAnonKey: 'anon',
        httpClient: MockClient(
          (_) async => http.Response(
            '{"code":"email_rate_limit_exceeded","msg":"Email rate limit exceeded"}',
            429,
          ),
        ),
      );

      await expectLater(
        datasource.signUpWithEmailPassword(
          email: 'learner@example.com',
          password: 'secret123',
        ),
        throwsA(
          isA<AppException>().having(
            (e) => e.message,
            'message',
            contains('Too many authentication emails'),
          ),
        ),
      );
    });

    test('maps login email rate limit to the same clear retry message',
        () async {
      final datasource = SupabaseAuthDatasourceImpl(
        supabaseUrl: 'https://example.supabase.co',
        supabaseAnonKey: 'anon',
        httpClient: MockClient(
          (_) async => http.Response(
            '{"error":"email_rate_limit_exceeded","error_description":"Email rate limit exceeded"}',
            429,
          ),
        ),
      );

      await expectLater(
        datasource.signInWithEmailPassword(
          email: 'learner@example.com',
          password: 'secret123',
        ),
        throwsA(
          isA<AppException>().having(
            (e) => e.message,
            'message',
            contains('Too many authentication emails'),
          ),
        ),
      );
    });
  });
}
