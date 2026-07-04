// P21-001 — StudentCourseModel.fromJson parses the backend's `locked` field.
//
// `locked` is backend-computed (cefr_rank > max_unlocked_cefr_rank); the
// model must read it verbatim, never derive it.

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/entity/student_course.dart';

void main() {
  group('StudentCourseModel.fromJson', () {
    test('parses locked: true from the backend response', () {
      final json = {
        'courseId': 'course-1',
        'title': 'English B2',
        'description': null,
        'levelCode': 'B2',
        'lessonCount': 20,
        'completedLessonCount': 0,
        'percent': 0,
        'status': 'not_started',
        'locked': true,
      };

      final model = StudentCourseModel.fromJson(json);

      expect(model.locked, isTrue);
    });

    test('parses locked: false from the backend response', () {
      final json = {
        'courseId': 'course-2',
        'title': 'English A1',
        'description': null,
        'levelCode': 'A1',
        'lessonCount': 10,
        'completedLessonCount': 5,
        'percent': 50,
        'status': 'in_progress',
        'locked': false,
      };

      final model = StudentCourseModel.fromJson(json);

      expect(model.locked, isFalse);
      expect(model.status, StudentCourseStatus.inProgress);
    });
  });
}
