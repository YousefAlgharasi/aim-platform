import 'dart:convert';

import 'package:aim_mobile/core/config/config.dart';
import 'package:aim_mobile/core/networking/networking.dart';
import 'package:aim_mobile/features/student_courses/data/datasources/student_courses_remote_datasource_impl.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

Map<String, dynamic> _course(String id, {required String status, required bool locked}) => {
      'courseId': id,
      'title': id,
      'description': null,
      'levelCode': 'X',
      'lessonCount': 3,
      'completedLessonCount': status == 'completed' ? 3 : 0,
      'quizCount': 0,
      'examCount': 0,
      'percent': status == 'completed' ? 100 : 0,
      'status': status,
      'locked': locked,
    };

void main() {
  test('keeps the backend lock flag instead of locking by list position', () async {
    final client = BackendApiClient(
      config: const AppConfig(
        environment: 'test',
        backendApiBaseUrl: 'https://api.example.test',
      ),
      httpClient: MockClient((request) async {
        return http.Response(
          jsonEncode({
            'success': true,
            'data': {
              'courses': [
                // An unfinished course listed first must not lock the next one.
                _course('demo', status: 'not_started', locked: false),
                _course('starter', status: 'completed', locked: false),
                _course('a1', status: 'not_started', locked: true),
              ],
            },
          }),
          200,
          headers: {'content-type': 'application/json'},
        );
      }),
    );

    final courses = await StudentCoursesRemoteDatasourceImpl(apiClient: client)
        .getCourses(bearerToken: 'tok');

    expect(courses.map((c) => c.locked).toList(), [false, false, true]);
  });
}
