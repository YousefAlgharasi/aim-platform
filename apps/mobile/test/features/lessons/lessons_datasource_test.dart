// Phase 6 — P6-071
// lessons_datasource_test.dart — unit tests for the curriculum datasource layer.
//
// Covers:
//   1. BackendApiPaths — curriculum path constants are correct.
//   2. CourseModel.fromJson stores all fields verbatim.
//   3. ChapterModel.fromJson stores levelId verbatim (backend-assigned).
//   4. LessonModel.fromJson stores chapterId and sortOrder verbatim.
//   5. LessonsRemoteDatasource interface is correctly typed (abstract check).

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lessons_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

void main() {
  // ── BackendApiPaths ────────────────────────────────────────────────────────

  group('BackendApiPaths — curriculum endpoints', () {
    test('curriculumCourses path is correct', () {
      expect(BackendApiPaths.curriculumCourses, '/curriculum/courses');
    });

    test('curriculumChapters path is correct', () {
      expect(BackendApiPaths.curriculumChapters, '/curriculum/chapters');
    });

    test('curriculumLessons path is correct', () {
      expect(BackendApiPaths.curriculumLessons, '/curriculum/lessons');
    });

    test('studentChapters path is correct', () {
      expect(BackendApiPaths.studentChapters, '/student/chapters');
    });

    test('studentLessons path is correct', () {
      expect(BackendApiPaths.studentLessons, '/student/lessons');
    });
  });

  // ── CourseModel ────────────────────────────────────────────────────────────

  group('CourseModel — fromJson verbatim storage', () {
    const raw = {
      'id': 'course-1',
      'title': 'English B1',
      'slug': 'english-b1',
      'description': 'B1 curriculum.',
      'status': 'published',
      'sortOrder': 2,
      'createdAt': '2025-01-01T00:00:00Z',
      'updatedAt': '2025-06-01T00:00:00Z',
    };

    test('id stored verbatim', () {
      expect(CourseModel.fromJson(raw).id, 'course-1');
    });

    test('title stored verbatim', () {
      expect(CourseModel.fromJson(raw).title, 'English B1');
    });

    test('status stored verbatim — Flutter never modifies it', () {
      expect(CourseModel.fromJson(raw).status, 'published');
    });

    test('sortOrder stored verbatim as int', () {
      expect(CourseModel.fromJson(raw).sortOrder, 2);
    });

    test('slug and description nullable', () {
      final m = CourseModel.fromJson({...raw, 'slug': null, 'description': null});
      expect(m.slug, isNull);
      expect(m.description, isNull);
    });
  });

  // ── ChapterModel ───────────────────────────────────────────────────────────

  group('ChapterModel — fromJson verbatim storage', () {
    const raw = {
      'id': 'chapter-1',
      'levelId': 'level-1',
      'title': 'Unit 1',
      'slug': 'unit-1',
      'description': 'First unit.',
      'status': 'published',
      'sortOrder': 1,
      'createdAt': '2025-02-01T00:00:00Z',
      'updatedAt': '2025-06-02T00:00:00Z',
    };

    test('levelId stored verbatim — backend-assigned, never from user input', () {
      expect(ChapterModel.fromJson(raw).levelId, 'level-1');
    });

    test('status stored verbatim', () {
      expect(ChapterModel.fromJson(raw).status, 'published');
    });

    test('sortOrder stored verbatim as int', () {
      expect(ChapterModel.fromJson(raw).sortOrder, 1);
    });
  });

  // ── LessonModel ────────────────────────────────────────────────────────────

  group('LessonModel — fromJson verbatim storage', () {
    const raw = {
      'id': 'lesson-1',
      'chapterId': 'chapter-1',
      'title': 'Lesson 1',
      'description': 'Intro grammar.',
      'status': 'published',
      'sortOrder': 1,
      'createdAt': '2025-03-01T00:00:00Z',
      'updatedAt': '2025-06-03T00:00:00Z',
    };

    test('chapterId stored verbatim — backend-assigned, never from user input', () {
      expect(LessonModel.fromJson(raw).chapterId, 'chapter-1');
    });

    test('sortOrder stored verbatim as int', () {
      expect(LessonModel.fromJson(raw).sortOrder, 1);
    });

    test('status stored verbatim — Flutter never recomputes', () {
      expect(LessonModel.fromJson(raw).status, 'published');
    });

    test('description stored verbatim', () {
      expect(LessonModel.fromJson(raw).description, 'Intro grammar.');
    });
  });

  // ── ChapterProgressModel ───────────────────────────────────────────────────

  group('ChapterProgressModel — fromJson verbatim storage', () {
    const raw = {
      'chapterId': 'chapter-1',
      'title': 'Unit 1',
      'description': 'First unit.',
      'levelCode': 'A1',
      'lessonCount': 4,
      'completedLessonCount': 2,
      'percent': 50,
      'status': 'in_progress',
    };

    test('percent/completedLessonCount/status stored verbatim — Flutter never computes them', () {
      final m = ChapterProgressModel.fromJson(raw);
      expect(m.percent, 50);
      expect(m.completedLessonCount, 2);
      expect(m.status, 'in_progress');
      expect(m.lessonCount, 4);
      expect(m.levelCode, 'A1');
    });

    test('levelCode nullable', () {
      final m = ChapterProgressModel.fromJson({...raw, 'levelCode': null});
      expect(m.levelCode, isNull);
    });
  });

  // ── LessonProgressModel ────────────────────────────────────────────────────

  group('LessonProgressModel — fromJson verbatim storage', () {
    const raw = {
      'id': 'lesson-1',
      'title': 'Lesson 1',
      'description': 'Intro grammar.',
      'xpValue': 10,
      'completed': true,
      'current': false,
    };

    test('completed/current stored verbatim — Flutter never computes them', () {
      final m = LessonProgressModel.fromJson(raw);
      expect(m.completed, isTrue);
      expect(m.current, isFalse);
      expect(m.xpValue, 10);
    });
  });

  // ── Interface check ────────────────────────────────────────────────────────

  group('LessonsRemoteDatasource interface', () {
    test(
        'interface declares getCourses, getChapters, getLessons, '
        'getChaptersWithProgress, getLessonsWithProgress', () {
      // Compile-time check: if this builds, the interface is correctly typed.
      // A FakeDatasource implementing the interface validates the contract.
      expect(_FakeDatasource(), isA<LessonsRemoteDatasource>());
    });
  });
}

// ---------------------------------------------------------------------------
// Fake for interface contract check
// ---------------------------------------------------------------------------

class _FakeDatasource implements LessonsRemoteDatasource {
  @override
  Future<List<CourseModel>> getCourses({required String bearerToken}) async =>
      const [];

  @override
  Future<List<LevelModel>> getLevels({
    required String bearerToken,
    required String courseId,
  }) async =>
      const [];

  @override
  Future<List<ChapterModel>> getChapters({
    required String bearerToken,
    required String levelId,
  }) async =>
      const [];

  @override
  Future<List<LessonModel>> getLessons({
    required String bearerToken,
    required String chapterId,
  }) async =>
      const [];

  @override
  Future<List<ChapterProgressModel>> getChaptersWithProgress({
    required String bearerToken,
    required String levelId,
  }) async =>
      const [];

  @override
  Future<List<LessonProgressModel>> getLessonsWithProgress({
    required String bearerToken,
    required String chapterId,
  }) async =>
      const [];
}
