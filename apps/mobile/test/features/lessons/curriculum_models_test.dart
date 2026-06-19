// Phase 6 — P6-070
// curriculum_models_test.dart — unit tests for CourseModel, ChapterModel, LessonModel.
//
// Covers:
//   - fromJson parses all fields correctly.
//   - toJson round-trips correctly.
//   - Nullable fields (slug, description) handle null without error.
//   - sortOrder parsed as int from num.
//   - Values stored verbatim — no Flutter-side computation.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/lessons/data/models/course_model.dart';
import 'package:aim_mobile/features/lessons/data/models/chapter_model.dart';
import 'package:aim_mobile/features/lessons/data/models/lesson_model.dart';

void main() {
  // ── CourseModel ────────────────────────────────────────────────────────────

  group('CourseModel', () {
    const json = {
      'id': 'course-uuid-1',
      'title': 'English B1',
      'slug': 'english-b1',
      'description': 'B1 level English curriculum.',
      'status': 'published',
      'sortOrder': 1,
      'createdAt': '2025-01-01T00:00:00Z',
      'updatedAt': '2025-06-01T00:00:00Z',
    };

    test('fromJson parses all fields', () {
      final m = CourseModel.fromJson(json);
      expect(m.id, 'course-uuid-1');
      expect(m.title, 'English B1');
      expect(m.slug, 'english-b1');
      expect(m.description, 'B1 level English curriculum.');
      expect(m.status, 'published');
      expect(m.sortOrder, 1);
      expect(m.createdAt, '2025-01-01T00:00:00Z');
      expect(m.updatedAt, '2025-06-01T00:00:00Z');
    });

    test('toJson round-trips correctly', () {
      final m = CourseModel.fromJson(json);
      final out = m.toJson();
      expect(out['id'], json['id']);
      expect(out['title'], json['title']);
      expect(out['slug'], json['slug']);
      expect(out['status'], json['status']);
      expect(out['sortOrder'], json['sortOrder']);
    });

    test('fromJson handles null slug and description', () {
      final m = CourseModel.fromJson({
        ...json,
        'slug': null,
        'description': null,
      });
      expect(m.slug, isNull);
      expect(m.description, isNull);
    });

    test('sortOrder is stored verbatim as int', () {
      final m = CourseModel.fromJson({...json, 'sortOrder': 5});
      expect(m.sortOrder, 5);
    });
  });

  // ── ChapterModel ───────────────────────────────────────────────────────────

  group('ChapterModel', () {
    const json = {
      'id': 'chapter-uuid-1',
      'levelId': 'level-uuid-1',
      'title': 'Unit 1: Basics',
      'slug': 'unit-1-basics',
      'description': 'Introduction to B1 content.',
      'status': 'published',
      'sortOrder': 1,
      'createdAt': '2025-01-02T00:00:00Z',
      'updatedAt': '2025-06-02T00:00:00Z',
    };

    test('fromJson parses all fields', () {
      final m = ChapterModel.fromJson(json);
      expect(m.id, 'chapter-uuid-1');
      expect(m.levelId, 'level-uuid-1');
      expect(m.title, 'Unit 1: Basics');
      expect(m.slug, 'unit-1-basics');
      expect(m.description, 'Introduction to B1 content.');
      expect(m.status, 'published');
      expect(m.sortOrder, 1);
    });

    test('toJson round-trips correctly', () {
      final m = ChapterModel.fromJson(json);
      final out = m.toJson();
      expect(out['id'], json['id']);
      expect(out['levelId'], json['levelId']);
      expect(out['title'], json['title']);
      expect(out['status'], json['status']);
    });

    test('fromJson handles null slug and description', () {
      final m = ChapterModel.fromJson({
        ...json,
        'slug': null,
        'description': null,
      });
      expect(m.slug, isNull);
      expect(m.description, isNull);
    });

    test('levelId is stored verbatim — never recomputed', () {
      final m = ChapterModel.fromJson(json);
      expect(m.levelId, 'level-uuid-1');
    });
  });

  // ── LessonModel ────────────────────────────────────────────────────────────

  group('LessonModel', () {
    const json = {
      'id': 'lesson-uuid-1',
      'chapterId': 'chapter-uuid-1',
      'title': 'Lesson 1: Introduction',
      'description': 'Basic grammar overview.',
      'status': 'published',
      'sortOrder': 1,
      'createdAt': '2025-01-03T00:00:00Z',
      'updatedAt': '2025-06-03T00:00:00Z',
    };

    test('fromJson parses all fields', () {
      final m = LessonModel.fromJson(json);
      expect(m.id, 'lesson-uuid-1');
      expect(m.chapterId, 'chapter-uuid-1');
      expect(m.title, 'Lesson 1: Introduction');
      expect(m.description, 'Basic grammar overview.');
      expect(m.status, 'published');
      expect(m.sortOrder, 1);
      expect(m.createdAt, '2025-01-03T00:00:00Z');
      expect(m.updatedAt, '2025-06-03T00:00:00Z');
    });

    test('toJson round-trips correctly', () {
      final m = LessonModel.fromJson(json);
      final out = m.toJson();
      expect(out['id'], json['id']);
      expect(out['chapterId'], json['chapterId']);
      expect(out['title'], json['title']);
      expect(out['description'], json['description']);
      expect(out['status'], json['status']);
      expect(out['sortOrder'], json['sortOrder']);
    });

    test('chapterId is stored verbatim — never recomputed', () {
      final m = LessonModel.fromJson(json);
      expect(m.chapterId, 'chapter-uuid-1');
    });

    test('sortOrder parsed correctly as int from num', () {
      final m = LessonModel.fromJson({...json, 'sortOrder': 3});
      expect(m.sortOrder, 3);
    });

    test('status is stored verbatim from backend', () {
      final m = LessonModel.fromJson({...json, 'status': 'draft'});
      expect(m.status, 'draft');
    });
  });
}
