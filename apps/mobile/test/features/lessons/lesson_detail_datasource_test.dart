// Phase 6 — P6-077
// lesson_detail_datasource_test.dart — unit tests for the lesson detail
// datasource layer.
//
// Covers:
//   1. BackendApiPaths.curriculumLessonDetail builds correct path.
//   2. BackendApiPaths.curriculumLessonAssets path is correct.
//   3. LessonDetailRemoteDatasource interface is correctly typed.
//   4. LessonAssetModel.fromJson stores type verbatim.
//   5. LessonAssetModel.fromJson stores status verbatim.
//   6. LessonAssetModel stores lessonId verbatim — backend-supplied.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lesson_detail_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

void main() {
  group('BackendApiPaths — lesson detail endpoints', () {
    test('curriculumLessonDetail builds correct path', () {
      expect(
        BackendApiPaths.curriculumLessonDetail('lesson-uuid-1'),
        '/curriculum/lessons/lesson-uuid-1',
      );
    });

    test('curriculumLessonAssets path is correct', () {
      expect(
        BackendApiPaths.curriculumLessonAssets,
        '/curriculum/lesson-assets',
      );
    });
  });

  group('LessonDetailRemoteDatasource interface', () {
    test('interface declares getLessonDetail and getLessonAssets', () {
      expect(_FakeDatasource(), isA<LessonDetailRemoteDatasource>());
    });
  });

  group('LessonAssetModel — datasource verbatim storage', () {
    const raw = {
      'id': 'asset-1',
      'lessonId': 'lesson-1',
      'type': 'audio',
      'title': 'Listening exercise',
      'description': null,
      'url': 'https://cdn.example.com/audio.mp3',
      'mimeType': 'audio/mpeg',
      'sizeBytes': 512000,
      'durationSeconds': 120,
      'altText': null,
      'thumbnailUrl': null,
      'order': 3,
      'status': 'published',
      'metadata': null,
      'createdAt': '2025-01-01T00:00:00Z',
      'updatedAt': '2025-06-01T00:00:00Z',
    };

    test('type stored verbatim — Flutter never computes asset type', () {
      expect(LessonAssetModel.fromJson(raw).type, 'audio');
    });

    test('status stored verbatim — Flutter never computes asset status', () {
      expect(LessonAssetModel.fromJson(raw).status, 'published');
    });

    test('lessonId stored verbatim — backend-supplied, never from user input',
        () {
      expect(LessonAssetModel.fromJson(raw).lessonId, 'lesson-1');
    });

    test('url stored verbatim — Flutter never constructs asset URLs', () {
      expect(LessonAssetModel.fromJson(raw).url,
          'https://cdn.example.com/audio.mp3');
    });
  });
}

// ── Fake for interface contract check ──────────────────────────────────────────

class _FakeDatasource implements LessonDetailRemoteDatasource {
  @override
  Future<LessonModel> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  }) async =>
      const LessonModel(
        id: 'lesson-1',
        chapterId: 'chapter-1',
        title: 'Lesson 1',
        description: 'Intro.',
        status: 'published',
        sortOrder: 1, xpValue: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
      );

  @override
  Future<List<LessonAssetModel>> getLessonAssets({
    required String bearerToken,
    required String lessonId,
  }) async =>
      const [];
}
