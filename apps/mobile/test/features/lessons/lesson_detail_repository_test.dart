// Phase 6 — P6-078
// lesson_detail_repository_test.dart — unit tests for
// LessonDetailRepositoryImpl.
//
// Covers:
//   1. getLessonDetail returns LessonDetail with lesson and assets verbatim.
//   2. ApiClientException is mapped to AppException.
//   3. AppException preserves code.
//   4. Empty assets list returns LessonDetail with hasNoContent == true.
//   5. lessonDetailProvider is typed as Provider<LessonDetailRepository>.

import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lesson_detail_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/data/repository/repo_impl/lesson_detail_repository_impl.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lesson_detail_repository.dart';

// ── Fake datasource ───────────────────────────────────────────────────────────

class _FakeDatasource implements LessonDetailRemoteDatasource {
  final bool shouldFail;
  final bool emptyAssets;
  const _FakeDatasource({this.shouldFail = false, this.emptyAssets = false});

  static const _lesson = LessonModel(
    id: 'lesson-1',
    chapterId: 'chapter-1',
    title: 'Lesson 1',
    description: 'Intro.',
    status: 'published',
    sortOrder: 1,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  );

  static final _assets = [
    LessonAssetModel.fromJson({
      'id': 'asset-1',
      'lessonId': 'lesson-1',
      'type': 'image',
      'title': 'Diagram',
      'description': null,
      'url': 'https://cdn.example.com/img.png',
      'mimeType': 'image/png',
      'sizeBytes': null,
      'durationSeconds': null,
      'altText': 'A diagram.',
      'thumbnailUrl': null,
      'order': 1,
      'status': 'published',
      'metadata': null,
      'createdAt': '2025-01-01T00:00:00Z',
      'updatedAt': '2025-06-01T00:00:00Z',
    }),
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
  Future<LessonModel> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  }) async {
    _maybeThrow();
    return _lesson;
  }

  @override
  Future<List<LessonAssetModel>> getLessonAssets({
    required String bearerToken,
    required String lessonId,
  }) async {
    _maybeThrow();
    return emptyAssets ? [] : _assets;
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('LessonDetailRepositoryImpl', () {
    test('getLessonDetail returns LessonDetail with lesson and assets verbatim',
        () async {
      const repo = LessonDetailRepositoryImpl(
        datasource: _FakeDatasource(),
      );
      final detail = await repo.getLessonDetail(
        bearerToken: 'tok',
        lessonId: 'lesson-1',
      );
      expect(detail.lesson.id, 'lesson-1');
      expect(detail.lesson.title, 'Lesson 1');
      expect(detail.assets.length, 1);
      expect(detail.assets.first.type, 'image');
      expect(detail.assets.first.status, 'published');
    });

    test('ApiClientException is mapped to AppException', () async {
      const repo = LessonDetailRepositoryImpl(
        datasource: _FakeDatasource(shouldFail: true),
      );
      expect(
        () => repo.getLessonDetail(bearerToken: 'tok', lessonId: 'lesson-1'),
        throwsA(isA<AppException>()),
      );
    });

    test('AppException preserves code', () async {
      const repo = LessonDetailRepositoryImpl(
        datasource: _FakeDatasource(shouldFail: true),
      );
      try {
        await repo.getLessonDetail(bearerToken: 'tok', lessonId: 'lesson-1');
        fail('Expected AppException');
      } on AppException catch (e) {
        expect(e.code, 'SERVER_ERROR');
      }
    });

    test('empty assets returns LessonDetail with hasNoContent == true',
        () async {
      const repo = LessonDetailRepositoryImpl(
        datasource: _FakeDatasource(emptyAssets: true),
      );
      final detail = await repo.getLessonDetail(
        bearerToken: 'tok',
        lessonId: 'lesson-1',
      );
      expect(detail.hasNoContent, isTrue);
    });
  });

  group('lessonDetailRepositoryProvider', () {
    test('provider is typed as Provider<LessonDetailRepository>', () {
      expect(
        lessonDetailRepositoryProvider,
        isA<Provider<LessonDetailRepository>>(),
      );
    });
  });
}
