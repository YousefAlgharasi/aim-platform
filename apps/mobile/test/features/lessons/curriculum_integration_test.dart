// Phase 6 — P6-082
// curriculum_integration_test.dart
//
// Integration-level checks for the full curriculum/lesson feature chain
// (P6-069..P6-081). Each test exercises multiple layers together:
// datasource → repository (with ContentStatusGuard) → notifier → state.
//
// Checks documented here:
//   1.  Published courses flow through repository to notifier state.
//   2.  Draft courses are filtered out by ContentStatusGuard in repository.
//   3.  Archived courses are filtered out by ContentStatusGuard.
//   4.  Published chapters flow through for a given levelId.
//   5.  Non-published chapters are filtered before reaching notifier.
//   6.  Published lessons flow through for a given chapterId.
//   7.  Non-published lessons are filtered before reaching notifier.
//   8.  Published assets reach LessonDetail; draft assets are dropped.
//   9.  LessonDetail.hasNoContent is true when all assets are filtered.
//  10.  CoursesNotifier emits loading then success.
//  11.  ChaptersNotifier emits loading then success.
//  12.  LessonsListNotifier emits loading then success.
//  13.  LessonDetailNotifier emits loading then success.
//  14.  ApiClientException propagates as AppException through repository.
//  15.  ContentStatusGuard never modifies status values — only filters.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lesson_detail_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lessons_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/data/repository/repo_impl/lesson_detail_repository_impl.dart';
import 'package:aim_mobile/features/lessons/data/repository/repo_impl/lessons_repository_impl.dart';
import 'package:aim_mobile/features/lessons/logic/content_status_guard.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/provider/chapters_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/provider/courses_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lesson_detail_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_list_notifier.dart';

// ── Fake datasources ──────────────────────────────────────────────────────────

class _FakeLessonsDatasource implements LessonsRemoteDatasource {
  final List<CourseModel> courses;
  final List<ChapterModel> chapters;
  final List<LessonModel> lessons;
  final bool shouldFail;

  const _FakeLessonsDatasource({
    this.courses = const [],
    this.chapters = const [],
    this.lessons = const [],
    this.shouldFail = false,
  });

  void _maybeThrow() {
    if (shouldFail) {
      throw const ApiClientException(
          code: 'ERR', message: 'fail', statusCode: 500);
    }
  }

  @override
  Future<List<CourseModel>> getCourses({required String bearerToken}) async {
    _maybeThrow();
    return courses;
  }

  @override
  Future<List<LevelModel>> getLevels(
      {required String bearerToken, required String courseId}) async {
    _maybeThrow();
    return const [];
  }

  @override
  Future<List<ChapterModel>> getChapters(
      {required String bearerToken, required String levelId}) async {
    _maybeThrow();
    return chapters;
  }

  @override
  Future<List<LessonModel>> getLessons(
      {required String bearerToken, required String chapterId}) async {
    _maybeThrow();
    return lessons;
  }
}

class _FakeLessonDetailDatasource implements LessonDetailRemoteDatasource {
  final LessonModel lesson;
  final List<LessonAssetModel> assets;

  const _FakeLessonDetailDatasource({
    required this.lesson,
    this.assets = const [],
  });

  @override
  Future<LessonModel> getLessonDetail(
      {required String bearerToken, required String lessonId}) async {
    return lesson;
  }

  @override
  Future<List<LessonAssetModel>> getLessonAssets(
      {required String bearerToken, required String lessonId}) async {
    return assets;
  }
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const _pub = 'published';
const _draft = 'draft';
const _archived = 'archived';

const _publishedCourse = CourseModel(
    id: 'c-pub',
    title: 'Published',
    status: _pub,
    sortOrder: 1,
    createdAt: '',
    updatedAt: '');
const _draftCourse = CourseModel(
    id: 'c-draft',
    title: 'Draft',
    status: _draft,
    sortOrder: 2,
    createdAt: '',
    updatedAt: '');
const _archivedCourse = CourseModel(
    id: 'c-arch',
    title: 'Archived',
    status: _archived,
    sortOrder: 3,
    createdAt: '',
    updatedAt: '');

const _publishedChapter = ChapterModel(
    id: 'ch-pub',
    levelId: 'lv-1',
    title: 'Pub Chapter',
    status: _pub,
    sortOrder: 1,
    createdAt: '',
    updatedAt: '');
const _draftChapter = ChapterModel(
    id: 'ch-draft',
    levelId: 'lv-1',
    title: 'Draft Chapter',
    status: _draft,
    sortOrder: 2,
    createdAt: '',
    updatedAt: '');

const _publishedLesson = LessonModel(
    id: 'l-pub',
    chapterId: 'ch-1',
    title: 'Pub Lesson',
    description: '',
    status: _pub,
    sortOrder: 1,
    createdAt: '',
    updatedAt: '');
const _draftLesson = LessonModel(
    id: 'l-draft',
    chapterId: 'ch-1',
    title: 'Draft Lesson',
    description: '',
    status: _draft,
    sortOrder: 2,
    createdAt: '',
    updatedAt: '');

LessonAssetModel _assetWithStatus(String id, String status) =>
    LessonAssetModel.fromJson({
      'id': id,
      'lessonId': 'l-1',
      'type': 'image',
      'title': 'T',
      'description': null,
      'url': null,
      'mimeType': null,
      'sizeBytes': null,
      'durationSeconds': null,
      'altText': null,
      'thumbnailUrl': null,
      'order': 1,
      'status': status,
      'metadata': null,
      'createdAt': '',
      'updatedAt': '',
    });

const _baseLesson = LessonModel(
    id: 'l-1',
    chapterId: 'ch-1',
    title: 'Lesson',
    description: '',
    status: _pub,
    sortOrder: 1,
    createdAt: '',
    updatedAt: '');

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('Curriculum integration — courses pipeline', () {
    test('1. Published courses flow through repository to notifier state',
        () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(courses: [_publishedCourse]),
      );
      final notifier = CoursesNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok');
      final state = notifier.state as AppAsyncSuccess<List<CourseModel>>;
      expect(state.data.length, 1);
      expect(state.data.first.id, 'c-pub');
    });

    test('2. Draft courses are filtered out by ContentStatusGuard', () async {
      const repo = LessonsRepositoryImpl(
        datasource: _FakeLessonsDatasource(
            courses: [_publishedCourse, _draftCourse]),
      );
      final notifier = CoursesNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok');
      final state = notifier.state as AppAsyncSuccess<List<CourseModel>>;
      expect(state.data.length, 1);
      expect(state.data.every((c) => c.status == _pub), isTrue);
    });

    test('3. Archived courses are filtered out by ContentStatusGuard',
        () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(
            courses: [_publishedCourse, _archivedCourse]),
      );
      final notifier = CoursesNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok');
      final state = notifier.state as AppAsyncSuccess<List<CourseModel>>;
      expect(state.data.every((c) => c.status == _pub), isTrue);
    });
  });

  group('Curriculum integration — chapters pipeline', () {
    test('4. Published chapters flow through for a given levelId', () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(chapters: [_publishedChapter]),
      );
      final notifier = ChaptersNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok', levelId: 'lv-1');
      final state = notifier.state as AppAsyncSuccess<List<ChapterModel>>;
      expect(state.data.length, 1);
      expect(state.data.first.id, 'ch-pub');
    });

    test('5. Non-published chapters are filtered before reaching notifier',
        () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(
            chapters: [_publishedChapter, _draftChapter]),
      );
      final notifier = ChaptersNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok', levelId: 'lv-1');
      final state = notifier.state as AppAsyncSuccess<List<ChapterModel>>;
      expect(state.data.every((c) => c.status == _pub), isTrue);
    });
  });

  group('Curriculum integration — lessons pipeline', () {
    test('6. Published lessons flow through for a given chapterId', () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(lessons: [_publishedLesson]),
      );
      final notifier = LessonsListNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok', chapterId: 'ch-1');
      final state = notifier.state as AppAsyncSuccess<List<LessonModel>>;
      expect(state.data.length, 1);
      expect(state.data.first.id, 'l-pub');
    });

    test('7. Non-published lessons are filtered before reaching notifier',
        () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(
            lessons: [_publishedLesson, _draftLesson]),
      );
      final notifier = LessonsListNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok', chapterId: 'ch-1');
      final state = notifier.state as AppAsyncSuccess<List<LessonModel>>;
      expect(state.data.every((l) => l.status == _pub), isTrue);
    });
  });

  group('Curriculum integration — lesson detail pipeline', () {
    test('8. Published assets reach LessonDetail; draft assets are dropped',
        () async {
      final repo = LessonDetailRepositoryImpl(
        datasource: _FakeLessonDetailDatasource(
          lesson: _baseLesson,
          assets: [
            _assetWithStatus('a-pub', _pub),
            _assetWithStatus('a-draft', _draft),
          ],
        ),
      );
      final notifier = LessonDetailNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok', lessonId: 'l-1');
      final detail = (notifier.state as AppAsyncSuccess<LessonDetail>).data;
      expect(detail.assets.length, 1);
      expect(detail.assets.first.id, 'a-pub');
    });

    test('9. LessonDetail.hasNoContent is true when all assets are filtered',
        () async {
      final repo = LessonDetailRepositoryImpl(
        datasource: _FakeLessonDetailDatasource(
          lesson: _baseLesson,
          assets: [_assetWithStatus('a-draft', _draft)],
        ),
      );
      final notifier = LessonDetailNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok', lessonId: 'l-1');
      final detail = (notifier.state as AppAsyncSuccess<LessonDetail>).data;
      expect(detail.hasNoContent, isTrue);
    });
  });

  group('Curriculum integration — notifier state transitions', () {
    test('10. CoursesNotifier emits loading then success', () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(courses: [_publishedCourse]),
      );
      final notifier = CoursesNotifier(repository: repo);
      final emitted = <AppAsyncState<List<CourseModel>>>[];
      notifier.addListener((s) => emitted.add(s), fireImmediately: false);
      await notifier.load(bearerToken: 'tok');
      expect(emitted.first, isA<AppAsyncLoading>());
      expect(emitted.last, isA<AppAsyncSuccess>());
    });

    test('11. ChaptersNotifier emits loading then success', () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(chapters: [_publishedChapter]),
      );
      final notifier = ChaptersNotifier(repository: repo);
      final emitted = <AppAsyncState<List<ChapterModel>>>[];
      notifier.addListener((s) => emitted.add(s), fireImmediately: false);
      await notifier.load(bearerToken: 'tok', levelId: 'lv-1');
      expect(emitted.first, isA<AppAsyncLoading>());
      expect(emitted.last, isA<AppAsyncSuccess>());
    });

    test('12. LessonsListNotifier emits loading then success', () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(lessons: [_publishedLesson]),
      );
      final notifier = LessonsListNotifier(repository: repo);
      final emitted = <AppAsyncState<List<LessonModel>>>[];
      notifier.addListener((s) => emitted.add(s), fireImmediately: false);
      await notifier.load(bearerToken: 'tok', chapterId: 'ch-1');
      expect(emitted.first, isA<AppAsyncLoading>());
      expect(emitted.last, isA<AppAsyncSuccess>());
    });

    test('13. LessonDetailNotifier emits loading then success', () async {
      const repo = LessonDetailRepositoryImpl(
        datasource: _FakeLessonDetailDatasource(lesson: _baseLesson),
      );
      final notifier = LessonDetailNotifier(repository: repo);
      final emitted = <AppAsyncState<LessonDetail>>[];
      notifier.addListener((s) => emitted.add(s), fireImmediately: false);
      await notifier.load(bearerToken: 'tok', lessonId: 'l-1');
      expect(emitted.first, isA<AppAsyncLoading>());
      expect(emitted.last, isA<AppAsyncSuccess>());
    });
  });

  group('Curriculum integration — error propagation', () {
    test('14. ApiClientException propagates as AppException through repository',
        () async {
      const repo = LessonsRepositoryImpl(
        datasource:  _FakeLessonsDatasource(shouldFail: true),
      );
      final notifier = CoursesNotifier(repository: repo);
      await notifier.load(bearerToken: 'tok');
      expect(notifier.state, isA<AppAsyncFailure>());
    });
  });

  group('Curriculum integration — security invariants', () {
    test('15. ContentStatusGuard never modifies status values — only filters',
        () {
      final mixed = [_publishedCourse, _draftCourse, _archivedCourse];
      final filtered = ContentStatusGuard.filterCourses(mixed);
      // All passing items retain their original backend-supplied status.
      for (final c in filtered) {
        expect(c.status, _pub,
            reason: 'Guard must only filter — never modify status');
      }
    });
  });
}
