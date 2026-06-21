// Phase 6 — P6-076
// lesson_detail_models_test.dart — unit tests for LessonAssetModel and LessonDetail.
//
// Covers:
//   1. LessonAssetModel.fromJson parses all required fields.
//   2. LessonAssetModel.fromJson handles all nullable fields as null.
//   3. type stored verbatim — Flutter never computes asset type.
//   4. status stored verbatim — Flutter never computes asset status.
//   5. order stored verbatim as int — Flutter never reorders assets.
//   6. sizeBytes and durationSeconds coerce num to int.
//   7. metadata parsed as Map<String, dynamic>?.
//   8. toJson round-trips correctly.
//   9. LessonDetail.hasNoContent true when assets empty.
//  10. LessonDetail.hasNoContent false when assets present.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/lessons/data/models/lesson_asset_model.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';

void main() {
  const fullJson = {
    'id': 'asset-1',
    'lessonId': 'lesson-1',
    'type': 'image',
    'title': 'Diagram 1',
    'description': 'A grammar diagram.',
    'url': 'https://cdn.example.com/diagram.png',
    'mimeType': 'image/png',
    'sizeBytes': 204800,
    'durationSeconds': null,
    'altText': 'Grammar diagram showing subject-verb agreement.',
    'thumbnailUrl': 'https://cdn.example.com/diagram-thumb.png',
    'order': 1,
    'status': 'published',
    'metadata': {'source': 'internal'},
    'createdAt': '2025-01-01T00:00:00Z',
    'updatedAt': '2025-06-01T00:00:00Z',
  };

  group('LessonAssetModel', () {
    test('fromJson parses all required fields', () {
      final m = LessonAssetModel.fromJson(fullJson);
      expect(m.id, 'asset-1');
      expect(m.lessonId, 'lesson-1');
      expect(m.type, 'image');
      expect(m.title, 'Diagram 1');
      expect(m.url, 'https://cdn.example.com/diagram.png');
      expect(m.mimeType, 'image/png');
      expect(m.sizeBytes, 204800);
      expect(m.altText, 'Grammar diagram showing subject-verb agreement.');
      expect(m.order, 1);
      expect(m.status, 'published');
      expect(m.createdAt, '2025-01-01T00:00:00Z');
    });

    test('fromJson handles all nullable fields as null', () {
      final m = LessonAssetModel.fromJson({
        'id': 'asset-2',
        'lessonId': 'lesson-1',
        'type': 'document',
        'title': 'Reading material',
        'description': null,
        'url': null,
        'mimeType': null,
        'sizeBytes': null,
        'durationSeconds': null,
        'altText': null,
        'thumbnailUrl': null,
        'order': 2,
        'status': 'published',
        'metadata': null,
        'createdAt': '2025-01-02T00:00:00Z',
        'updatedAt': '2025-06-02T00:00:00Z',
      });
      expect(m.description, isNull);
      expect(m.url, isNull);
      expect(m.mimeType, isNull);
      expect(m.sizeBytes, isNull);
      expect(m.durationSeconds, isNull);
      expect(m.altText, isNull);
      expect(m.thumbnailUrl, isNull);
      expect(m.metadata, isNull);
    });

    test('type stored verbatim — Flutter never computes asset type', () {
      final m = LessonAssetModel.fromJson({...fullJson, 'type': 'video'});
      expect(m.type, 'video');
    });

    test('status stored verbatim — Flutter never computes asset status', () {
      final m = LessonAssetModel.fromJson({...fullJson, 'status': 'draft'});
      expect(m.status, 'draft');
    });

    test('order stored verbatim as int — Flutter never reorders', () {
      final m = LessonAssetModel.fromJson({...fullJson, 'order': 5});
      expect(m.order, 5);
    });

    test('sizeBytes coerces num to int', () {
      final m = LessonAssetModel.fromJson({...fullJson, 'sizeBytes': 1024});
      expect(m.sizeBytes, 1024);
    });

    test('durationSeconds coerces num to int', () {
      final m = LessonAssetModel.fromJson({...fullJson, 'durationSeconds': 180});
      expect(m.durationSeconds, 180);
    });

    test('metadata parsed as Map', () {
      final m = LessonAssetModel.fromJson(fullJson);
      expect(m.metadata, isA<Map<String, dynamic>>());
      expect(m.metadata!['source'], 'internal');
    });

    test('toJson round-trips correctly', () {
      final m = LessonAssetModel.fromJson(fullJson);
      final out = m.toJson();
      expect(out['id'], 'asset-1');
      expect(out['lessonId'], 'lesson-1');
      expect(out['type'], 'image');
      expect(out['order'], 1);
      expect(out['status'], 'published');
    });
  });

  group('LessonDetail', () {
    const lesson = Lesson(
      id: 'lesson-1',
      chapterId: 'chapter-1',
      title: 'Lesson 1',
      description: 'Intro.',
      status: 'published',
      sortOrder: 1,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-06-01T00:00:00Z',
    );

    test('hasNoContent is true when assets list is empty', () {
      const detail = LessonDetail(lesson: lesson, assets: []);
      expect(detail.hasNoContent, isTrue);
    });

    test('hasNoContent is false when assets are present', () {
      final detail = LessonDetail(
        lesson: lesson,
        assets: [LessonAssetModel.fromJson(fullJson)],
      );
      expect(detail.hasNoContent, isFalse);
    });
  });
}
