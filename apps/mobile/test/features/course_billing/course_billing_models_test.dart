import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/course_billing/data/course_billing_models.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';

void main() {
  test('parses price and access from the course list', () {
    final course = StudentCourseModel.fromJson({
      'courseId': 'c1', 'title': 'English Basics', 'lessonCount': 10, 'completedLessonCount': 0,
      'percent': 0, 'status': 'not_started', 'locked': false,
      'price': {'isFree': false, 'currency': 'SAR', 'originalAmount': 100, 'discountAmount': 0, 'amount': 100, 'discountActive': false, 'accessDays': 30},
      'access': {'status': 'none', 'hasAccess': false},
    });
    expect(course.price!.currency, 'SAR');
    expect(course.access!.status, CourseAccessStatus.none);
    expect(course.needsPayment, isTrue);
  });

  test('courses from an older backend without billing stay open', () {
    final course = StudentCourseModel.fromJson({
      'courseId': 'c1', 'title': 'Starter', 'lessonCount': 1, 'completedLessonCount': 0,
      'percent': 0, 'status': 'not_started', 'locked': false,
    });
    expect(course.needsPayment, isFalse);
  });

  test('active access keeps the deadline', () {
    final access = CourseAccess.fromJson({
      'status': 'active', 'hasAccess': true, 'expiresAt': '2026-11-30T00:00:00Z', 'daysLeft': 4,
    });
    expect(access.needsPayment, isFalse);
    expect(access.daysLeft, 4);
    expect(access.expiresAt!.toUtc(), DateTime.utc(2026, 11, 30));
  });
}
