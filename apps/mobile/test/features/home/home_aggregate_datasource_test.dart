import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:aim_mobile/core/config/app_config.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/features/home/data/datasources/home_remote_datasource_impl.dart';

HomeRemoteDatasourceImpl _datasource(
  Future<http.Response> Function(http.Request) handler,
) =>
    HomeRemoteDatasourceImpl(
      apiClient: BackendApiClient(
        config: const AppConfig(
          environment: 'test',
          backendApiBaseUrl: 'https://api.example.com',
        ),
        httpClient: MockClient(handler),
      ),
    );

http.Response _ok(Object data) => http.Response(
      jsonEncode({'success': true, 'data': data, 'meta': <String, dynamic>{}}),
      200,
      headers: {'content-type': 'application/json'},
    );

void main() {
  const homeJson = {
    'skillStates': {'skillStates': <Object>[]},
    'weaknessRecords': null,
    'reviewSchedules': {'reviewSchedules': <Object>[]},
    'recommendations': {'recommendations': <Object>[]},
    'engagementSummary': {
      'goal': {'targetLessons': 3, 'completedToday': 1, 'streakDays': 4},
      'challenge': null,
    },
    'engagementStats': null,
    'continueLearning': {
      'lessonId': 'l1',
      'lessonTitle': 'Greetings',
      'percent': 40,
      'lastActiveAt': '2026-06-18T00:00:00Z',
    },
    'quickStart': null,
    'recommendedCourse': null,
    'failedSections': ['weaknessRecords'],
  };

  test('reads every section from one GET /student/home', () async {
    final paths = <String>[];
    final ds = _datasource((req) async {
      paths.add(req.url.path);
      return _ok(homeJson);
    });

    final goal = (await ds.getEngagementSummary(bearerToken: 't')).goal;
    final cont = await ds.getContinueLearning(bearerToken: 't');
    final skills = await ds.getSkillStates(bearerToken: 't', studentId: 's');

    expect(goal.streakDays, 4);
    expect(cont?.lessonId, 'l1');
    expect(skills, isEmpty);
    expect(paths.toSet(), {'/student/home'});
  });

  test('a section the backend failed to load is reported as failed, not empty',
      () async {
    final ds = _datasource((_) async => _ok(homeJson));

    expect(
      () => ds.getWeaknessRecords(bearerToken: 't', studentId: 's'),
      throwsA(isA<ApiClientException>()
          .having((e) => e.code, 'code', 'HOME_SECTION_FAILED')),
    );
  });

  test('falls back to the separate endpoints when the backend has no aggregate',
      () async {
    final paths = <String>[];
    final ds = _datasource((req) async {
      paths.add(req.url.path);
      if (req.url.path == '/student/home') {
        return http.Response(
          jsonEncode({
            'success': false,
            'error': {'code': 'NOT_FOUND', 'message': 'nope', 'statusCode': 404},
            'meta': <String, dynamic>{},
          }),
          404,
          headers: {'content-type': 'application/json'},
        );
      }
      return _ok({'skillStates': <Object>[]});
    });

    final skills = await ds.getSkillStates(bearerToken: 't', studentId: 's1');
    await ds.getSkillStates(bearerToken: 't', studentId: 's1');

    expect(skills, isEmpty);
    expect(paths.where((p) => p == '/student/home').length, 1);
    expect(paths, contains('/aim/students/s1/skill-states'));
  });
}
