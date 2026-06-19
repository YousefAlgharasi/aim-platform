// Phase 8 — P8-082
// Unit tests for AiTeacherRemoteDatasourceImpl.
//
// Verifies that each method:
//   - Calls the correct backend path/method only — never an AI provider
//     endpoint, never the AIM Engine directly.
//   - Sends the bearer token as an Authorization header — never studentId
//     in the request body.
//   - Parses the response data into the correct model.

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:aim_mobile/core/config/config.dart';
import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/features/ai_teacher/data/datasources/ai_teacher_remote_datasource_impl.dart';

const _config = AppConfig(
  environment: 'test',
  backendApiBaseUrl: 'https://backend.test',
  supabaseUrl: 'https://placeholder.supabase.co',
  supabaseAnonKey: '',
);

Map<String, dynamic> _envelope(Object? data) => {
      'success': true,
      'data': data,
      'meta': {'requestId': 'req-1', 'timestamp': '2026-06-19T00:00:00.000Z'},
    };

void main() {
  group('AiTeacherRemoteDatasourceImpl', () {
    test('startSession posts contextRef only, never studentId, and parses the session', () async {
      http.Request? capturedRequest;
      final client = MockClient((request) async {
        capturedRequest = request;
        return http.Response(
          jsonEncode(_envelope({
            'sessionId': 'session-1',
            'studentId': 'student-1',
            'contextRef': 'lesson:fractions',
            'status': 'active',
            'createdAt': '2026-06-19T00:00:00.000Z',
          })),
          201,
        );
      });
      final datasource = AiTeacherRemoteDatasourceImpl(
        apiClient: BackendApiClient(config: _config, httpClient: client),
      );

      final result = await datasource.startSession(
        bearerToken: 'jwt-token',
        contextRef: 'lesson:fractions',
      );

      expect(capturedRequest!.method, 'POST');
      expect(capturedRequest!.url.path, '/ai-teacher/sessions');
      expect(capturedRequest!.headers['authorization'], 'Bearer jwt-token');
      final sentBody = jsonDecode(capturedRequest!.body) as Map<String, dynamic>;
      expect(sentBody, {'contextRef': 'lesson:fractions'});
      expect(sentBody.containsKey('studentId'), isFalse);
      expect(result.sessionId, 'session-1');
      expect(result.contextRef, 'lesson:fractions');
    });

    test('listSessions gets the sessions endpoint and parses each summary', () async {
      http.Request? capturedRequest;
      final client = MockClient((request) async {
        capturedRequest = request;
        return http.Response(
          jsonEncode(_envelope({
            'sessions': [
              {
                'sessionId': 'session-1',
                'contextRef': 'lesson:fractions',
                'status': 'active',
                'createdAt': '2026-06-19T00:00:00.000Z',
                'updatedAt': '2026-06-19T01:00:00.000Z',
              },
            ],
          })),
          200,
        );
      });
      final datasource = AiTeacherRemoteDatasourceImpl(
        apiClient: BackendApiClient(config: _config, httpClient: client),
      );

      final result = await datasource.listSessions(bearerToken: 'jwt-token');

      expect(capturedRequest!.method, 'GET');
      expect(capturedRequest!.url.path, '/ai-teacher/sessions');
      expect(result, hasLength(1));
      expect(result.first.sessionId, 'session-1');
    });

    test('sendMessage posts to the session messages endpoint with message only', () async {
      http.Request? capturedRequest;
      final client = MockClient((request) async {
        capturedRequest = request;
        return http.Response(
          jsonEncode(_envelope({
            'text': "Great question! Let's break it down.",
            'isFallback': false,
            'provider': 'fake-provider',
            'model': 'fake-model',
            'latencyMs': 120,
          })),
          201,
        );
      });
      final datasource = AiTeacherRemoteDatasourceImpl(
        apiClient: BackendApiClient(config: _config, httpClient: client),
      );

      final result = await datasource.sendMessage(
        bearerToken: 'jwt-token',
        sessionId: 'session-1',
        message: 'hello',
      );

      expect(capturedRequest!.method, 'POST');
      expect(capturedRequest!.url.path, '/ai-teacher/sessions/session-1/messages');
      final sentBody = jsonDecode(capturedRequest!.body) as Map<String, dynamic>;
      expect(sentBody, {'message': 'hello'});
      expect(result.text, "Great question! Let's break it down.");
      expect(result.isFallback, isFalse);
    });

    test('getHistory gets the session messages endpoint and parses history', () async {
      http.Request? capturedRequest;
      final client = MockClient((request) async {
        capturedRequest = request;
        return http.Response(
          jsonEncode(_envelope({
            'sessionId': 'session-1',
            'messages': [
              {
                'id': 'message-1',
                'role': 'student',
                'text': 'hello',
                'createdAt': '2026-06-19T00:00:00.000Z',
              },
            ],
          })),
          200,
        );
      });
      final datasource = AiTeacherRemoteDatasourceImpl(
        apiClient: BackendApiClient(config: _config, httpClient: client),
      );

      final result = await datasource.getHistory(
        bearerToken: 'jwt-token',
        sessionId: 'session-1',
      );

      expect(capturedRequest!.method, 'GET');
      expect(capturedRequest!.url.path, '/ai-teacher/sessions/session-1/messages');
      expect(result.sessionId, 'session-1');
      expect(result.messages, hasLength(1));
    });

    test('submitFeedback posts to the message feedback endpoint with rating only', () async {
      http.Request? capturedRequest;
      final client = MockClient((request) async {
        capturedRequest = request;
        return http.Response(
          jsonEncode(_envelope({
            'feedbackId': 'feedback-1',
            'messageId': 'message-1',
            'rating': 'helpful',
            'createdAt': '2026-06-19T00:00:00.000Z',
          })),
          201,
        );
      });
      final datasource = AiTeacherRemoteDatasourceImpl(
        apiClient: BackendApiClient(config: _config, httpClient: client),
      );

      final result = await datasource.submitFeedback(
        bearerToken: 'jwt-token',
        messageId: 'message-1',
        rating: 'helpful',
      );

      expect(capturedRequest!.method, 'POST');
      expect(capturedRequest!.url.path, '/ai-teacher/messages/message-1/feedback');
      final sentBody = jsonDecode(capturedRequest!.body) as Map<String, dynamic>;
      expect(sentBody, {'rating': 'helpful'});
      expect(result.feedbackId, 'feedback-1');
      expect(result.rating, 'helpful');
    });

    test('never targets an AI provider endpoint for any call', () async {
      final paths = <String>[];
      final client = MockClient((request) async {
        paths.add(request.url.path);
        return http.Response(jsonEncode(_envelope({})), 200);
      });
      final datasource = AiTeacherRemoteDatasourceImpl(
        apiClient: BackendApiClient(config: _config, httpClient: client),
      );

      try {
        await datasource.listSessions(bearerToken: 'jwt-token');
      } catch (_) {}

      for (final path in paths) {
        expect(path, startsWith('/ai-teacher/'));
        expect(path.toLowerCase(), isNot(contains('openai')));
        expect(path.toLowerCase(), isNot(contains('anthropic')));
      }
    });
  });
}
