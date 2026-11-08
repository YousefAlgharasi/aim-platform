import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:aim_mobile/core/config/app_config.dart';
import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/features/home/data/course_path_loader.dart';
import 'package:aim_mobile/features/lessons/logic/entity/level.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

class _Repo implements LessonsRepository {
  int levelCalls = 0;

  @override
  Future<List<Level>> getLevels({
    required String bearerToken,
    required String courseId,
  }) async {
    levelCalls++;
    return const [];
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

BackendApiClient _client(Future<http.Response> Function(http.Request) handler) =>
    BackendApiClient(
      config: const AppConfig(
        environment: 'test',
        backendApiBaseUrl: 'https://api.example.com',
      ),
      httpClient: MockClient(handler),
    );

http.Response _ok(Object data) => http.Response(
      jsonEncode({'success': true, 'data': data, 'meta': <String, dynamic>{}}),
      200,
      headers: {'content-type': 'application/json'},
    );

void main() {
  const path = {
    'levels': [
      {
        'levelId': 'l1',
        'chapters': [
          {
            'chapterId': 'c1',
            'title': 'Greetings',
            'lessonCount': 2,
            'completedLessonCount': 1,
            'percent': 50,
            'status': 'in_progress',
          },
        ],
      },
    ],
    'finalExam': {'assessmentId': 'exam', 'title': 'Final', 'unlocked': false},
    'activeChapter': {
      'chapterId': 'c1',
      'chapterNumber': 1,
      'lessons': [
        {'id': 'les1', 'title': 'Hello', 'completed': true, 'current': false},
        {'id': 'les2', 'title': 'Bye', 'completed': false, 'current': true},
      ],
      'quiz': null,
    },
  };

  test('reads the whole path from one GET /student/courses/:id/path', () async {
    final paths = <String>[];
    final repo = _Repo();
    final loader = CoursePathLoader(
      apiClient: () => _client((req) async {
        paths.add(req.url.path);
        return _ok(path);
      }),
      lessonsRepository: repo,
    );

    final data = await loader.load(bearerToken: 't', courseId: 'course-1');

    expect(paths, ['/student/courses/course-1/path']);
    expect(repo.levelCalls, 0);
    expect(data?.activeChapterId, 'c1');
    expect(data?.activeChapterTitle, 'Greetings');
    expect(data?.lessons.map((l) => l.id), ['les1', 'les2']);
    expect(data?.finalExam?.assessmentId, 'exam');
  });

  test('no active chapter means the final exam is next', () async {
    final loader = CoursePathLoader(
      apiClient: () => _client((_) async =>
          _ok({...path, 'activeChapter': null})),
      lessonsRepository: _Repo(),
    );

    final data = await loader.load(bearerToken: 't', courseId: 'c');

    expect(data?.activeChapterId, isNull);
    expect(data?.finalExam?.assessmentId, 'exam');
  });

  test('a course without levels has no path', () async {
    final repo = _Repo();
    final loader = CoursePathLoader(
      apiClient: () => _client((_) async => _ok({'levels': <Object>[]})),
      lessonsRepository: repo,
    );

    expect(await loader.load(bearerToken: 't', courseId: 'c'), isNull);
    expect(repo.levelCalls, 0);
  });

  test('falls back to the separate endpoints when the path call fails',
      () async {
    final repo = _Repo();
    final loader = CoursePathLoader(
      apiClient: () => _client((_) async => http.Response(
            jsonEncode({
              'success': false,
              'error': {'code': 'NOT_FOUND', 'message': 'no', 'statusCode': 404},
              'meta': <String, dynamic>{},
            }),
            404,
            headers: {'content-type': 'application/json'},
          )),
      lessonsRepository: repo,
    );

    final data = await loader.load(bearerToken: 't', courseId: 'c');

    expect(repo.levelCalls, 1);
    expect(data, isNull);
  });

  test('falls back when the API client cannot be created', () async {
    final repo = _Repo();
    final loader = CoursePathLoader(
      apiClient: () => throw StateError('no client'),
      lessonsRepository: repo,
    );

    await loader.load(bearerToken: 't', courseId: 'c');

    expect(repo.levelCalls, 1);
  });
}
