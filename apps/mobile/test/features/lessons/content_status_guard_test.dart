// Phase 6 — P6-081
// content_status_guard_test.dart — unit tests for ContentStatusGuard.
//
// Covers:
//   1. isPublished returns true only for 'published'.
//   2. isPublished returns false for 'draft'.
//   3. isPublished returns false for 'archived'.
//   4. filterCourses removes non-published courses.
//   5. filterCourses keeps published courses.
//   6. filterChapters removes non-published chapters.
//   7. filterLessons removes non-published lessons.
//   8. filterAssets removes non-published assets.
//   9. filterAssets keeps published assets.
//  10. All filter methods handle empty lists without crash.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/content_status_guard.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';

void main() {
  group('ContentStatusGuard.isPublished', () {
    test('returns true for published', () {
      expect(ContentStatusGuard.isPublished('published'), isTrue);
    });

    test('returns false for draft', () {
      expect(ContentStatusGuard.isPublished('draft'), isFalse);
    });

    test('returns false for archived', () {
      expect(ContentStatusGuard.isPublished('archived'), isFalse);
    });
  });

  group('ContentStatusGuard.filterCourses', () {
    const published = CourseModel(
      id: 'c-1', title: 'A', status: 'published',
      sortOrder: 1, createdAt: '', updatedAt: '',
    );
    const draft = CourseModel(
      id: 'c-2', title: 'B', status: 'draft',
      sortOrder: 2, createdAt: '', updatedAt: '',
    );
    const archived = CourseModel(
      id: 'c-3', title: 'C', status: 'archived',
      sortOrder: 3, createdAt: '', updatedAt: '',
    );

    test('removes non-published courses', () {
      final result = ContentStatusGuard.filterCourses([published, draft, archived]);
      expect(result.length, 1);
      expect(result.first.id, 'c-1');
    });

    test('keeps all published courses', () {
      final result = ContentStatusGuard.filterCourses([published]);
      expect(result.length, 1);
    });

    test('handles empty list', () {
      expect(ContentStatusGuard.filterCourses([]), isEmpty);
    });
  });

  group('ContentStatusGuard.filterChapters', () {
    const published = ChapterModel(
      id: 'ch-1', levelId: 'l-1', title: 'A', status: 'published',
      sortOrder: 1, createdAt: '', updatedAt: '',
    );
    const draft = ChapterModel(
      id: 'ch-2', levelId: 'l-1', title: 'B', status: 'draft',
      sortOrder: 2, createdAt: '', updatedAt: '',
    );

    test('removes non-published chapters', () {
      final result = ContentStatusGuard.filterChapters([published, draft]);
      expect(result.length, 1);
      expect(result.first.id, 'ch-1');
    });

    test('handles empty list', () {
      expect(ContentStatusGuard.filterChapters([]), isEmpty);
    });
  });

  group('ContentStatusGuard.filterLessons', () {
    const published = LessonModel(
      id: 'l-1', chapterId: 'ch-1', title: 'A', description: '',
      status: 'published', sortOrder: 1, createdAt: '', updatedAt: '',
    );
    const draft = LessonModel(
      id: 'l-2', chapterId: 'ch-1', title: 'B', description: '',
      status: 'draft', sortOrder: 2, createdAt: '', updatedAt: '',
    );

    test('removes non-published lessons', () {
      final result = ContentStatusGuard.filterLessons([published, draft]);
      expect(result.length, 1);
      expect(result.first.id, 'l-1');
    });

    test('handles empty list', () {
      expect(ContentStatusGuard.filterLessons([]), isEmpty);
    });
  });

  group('ContentStatusGuard.filterAssets', () {
    final published = LessonAssetModel.fromJson({
      'id': 'a-1', 'lessonId': 'l-1', 'type': 'image', 'title': 'Img',
      'description': null, 'url': null, 'mimeType': null, 'sizeBytes': null,
      'durationSeconds': null, 'altText': null, 'thumbnailUrl': null,
      'order': 1, 'status': 'published', 'metadata': null,
      'createdAt': '', 'updatedAt': '',
    });
    final draft = LessonAssetModel.fromJson({
      'id': 'a-2', 'lessonId': 'l-1', 'type': 'audio', 'title': 'Audio',
      'description': null, 'url': null, 'mimeType': null, 'sizeBytes': null,
      'durationSeconds': null, 'altText': null, 'thumbnailUrl': null,
      'order': 2, 'status': 'draft', 'metadata': null,
      'createdAt': '', 'updatedAt': '',
    });

    test('removes non-published assets', () {
      final result = ContentStatusGuard.filterAssets([published, draft]);
      expect(result.length, 1);
      expect(result.first.id, 'a-1');
    });

    test('keeps published assets', () {
      final result = ContentStatusGuard.filterAssets([published]);
      expect(result.length, 1);
    });

    test('handles empty list', () {
      expect(ContentStatusGuard.filterAssets([]), isEmpty);
    });
  });
}
