// Phase 6 — P6-072
// lessons_repository_test.dart — unit tests for LessonsRepositoryImpl.
//
// Covers:
//   1. getCourses returns list from datasource verbatim.
//   2. getChapters returns list for given levelId verbatim.
//   3. getLessons returns list for given chapterId verbatim.
//   4. ApiClientException is mapped to AppException.
//   5. lessonsRepositoryProvider is correctly typed.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lessons_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/data/repository/repo_impl/lessons_repository_impl.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

// ── Fake datasource ───────────────────────────────────────────────────────────

class _FakeDatasource implements LessonsRemoteDatasource {
  final bool shouldFail;
  const _FakeDatasource({this.shouldFail = false});

  static const _courses = [
    CourseModel(
      id: 'course-1',
      title: 'English B1',
      status: 'published',
      sortOrder: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-06-01T00:00:00Z',
    ),
  ];

  static const _chapters = [
    ChapterModel(
      id: 'chapter-1',
      levelId: 'level-1',
      title: 'Unit 1',
      status: 'published',
      sortOrder: 1,
      createdAt: '2025-01-02T00:00:00Z',
      updatedAt: '2025-06-02T00:00:00Z',
    ),
  ];

  static const _lessons = [
    LessonModel(
      id: 'lesson-1',
      chapterId: 'chapter-1',
      title: 'Lesson 1',
      description: 'Intro.',
      status: 'published',
      sortOrder: 1, xpValue: 0,
      createdAt: '2025-01-03T00:00:00Z',
      updatedAt: '2025-06-03T00:00:00Z',
    ),
  ];

  static const _chaptersProgress = [
    ChapterProgressModel(
      chapterId: 'chapter-1',
      title: 'Unit 1',
      description: null,
      levelCode: 'A1',
      lessonCount: 3,
      completedLessonCount: 1,
      quizCount: 0,
      percent: 33,
      status: 'in_progress',
    ),
  ];

  static const _lessonsProgress = [
    LessonProgressModel(
      id: 'lesson-1',
      title: 'Lesson 1',
      description: 'Intro.',
      xpValue: 10,
      completed: true,
      current: false,
    ),
  ];

  void _maybeThrow() {
    if (shouldFail) {
      throw const ApiClientException(
        code: 'SERVER_ERROR',
        message: 'Server error',
        statusCode: 500,
      );
    }
  }

  @override
  Future<List<CourseModel>> getCourses({required String bearerToken}) async {
    _maybeThrow();
    return _courses;
  }

  @override
  Future<List<LevelModel>> getLevels({
    required String bearerToken,
    required String courseId,
  }) async {
    _maybeThrow();
    return const [
      LevelModel(
        id: 'level-1',
        courseId: 'course-1',
        title: 'Level 1',
        status: 'published',
        sortOrder: 1,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
      ),
    ];
  }

  @override
  Future<List<ChapterModel>> getChapters({
    required String bearerToken,
    required String levelId,
  }) async {
    _maybeThrow();
    return _chapters;
  }

  @override
  Future<List<LessonModel>> getLessons({
    required String bearerToken,
    required String chapterId,
  }) async {
    _maybeThrow();
    return _lessons;
  }

  @override
  Future<List<ChapterProgressModel>> getChaptersWithProgress({
    required String bearerToken,
    required String levelId,
  }) async {
    _maybeThrow();
    return _chaptersProgress;
  }

  @override
  Future<List<LessonProgressModel>> getLessonsWithProgress({
    required String bearerToken,
    required String chapterId,
  }) async {
    _maybeThrow();
    return _lessonsProgress;
  }

  @override
  Future<FinalExamSummaryModel?> getFinalExamForLevel({
    required String bearerToken,
    required String levelId,
  }) async {
    _maybeThrow();
    return null;
  }

  @override
  Future<ChapterQuizSummaryModel?> getChapterQuiz({
    required String bearerToken,
    required String chapterId,
  }) async {
    _maybeThrow();
    return null;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('LessonsRepositoryImpl', () {
    test('getCourses returns list verbatim from datasource', () async {
      const repo = LessonsRepositoryImpl(
        datasource: _FakeDatasource(),
      );
      final result = await repo.getCourses(bearerToken: 'tok');
      expect(result.length, 1);
      expect(result.first.id, 'course-1');
      expect(result.first.status, 'published');
      expect(result.first.sortOrder, 1);
    });

    test('getChapters returns list verbatim for given levelId', () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeDatasource(),
      );
      final result = await repo.getChapters(
        bearerToken: 'tok',
        levelId: 'level-1',
      );
      expect(result.length, 1);
      expect(result.first.levelId, 'level-1');
      expect(result.first.id, 'chapter-1');
    });

    test('getLessons returns list verbatim for given chapterId', () async {
      const repo = LessonsRepositoryImpl(
        datasource: _FakeDatasource(),
      );
      final result = await repo.getLessons(
        bearerToken: 'tok',
        chapterId: 'chapter-1',
      );
      expect(result.length, 1);
      expect(result.first.chapterId, 'chapter-1');
      expect(result.first.sortOrder, 1);
    });

    test('getChaptersWithProgress returns list verbatim for given levelId', () async {
      const repo = LessonsRepositoryImpl(
        datasource: _FakeDatasource(),
      );
      final result = await repo.getChaptersWithProgress(
        bearerToken: 'tok',
        levelId: 'level-1',
      );
      expect(result.length, 1);
      expect(result.first.chapterId, 'chapter-1');
      expect(result.first.percent, 33);
      expect(result.first.status, 'in_progress');
    });

    test('getLessonsWithProgress returns list verbatim for given chapterId', () async {
      const repo = LessonsRepositoryImpl(
        datasource: _FakeDatasource(),
      );
      final result = await repo.getLessonsWithProgress(
        bearerToken: 'tok',
        chapterId: 'chapter-1',
      );
      expect(result.length, 1);
      expect(result.first.id, 'lesson-1');
      expect(result.first.completed, isTrue);
      expect(result.first.current, isFalse);
    });

    test('ApiClientException is mapped to AppException', () async {
      const repo = LessonsRepositoryImpl(
        datasource: _FakeDatasource(shouldFail: true),
      );
      expect(
        () => repo.getCourses(bearerToken: 'tok'),
        throwsA(isA<AppException>()),
      );
    });

    test('AppException preserves code from ApiClientException', () async {
      const repo = LessonsRepositoryImpl(
        datasource: _FakeDatasource(shouldFail: true),
      );
      try {
        await repo.getCourses(bearerToken: 'tok');
        fail('Expected AppException');
      } on AppException catch (e) {
        expect(e.code, 'SERVER_ERROR');
      }
    });
  });

  group('lessonsRepositoryProvider', () {
    test('provider is typed as LessonsRepository', () {
      expect(
        lessonsRepositoryProvider,
        isA<Provider<LessonsRepository>>(),
      );
    });
  });
}
