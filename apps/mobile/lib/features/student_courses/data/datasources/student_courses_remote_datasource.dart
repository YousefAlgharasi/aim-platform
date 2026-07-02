// StudentCoursesRemoteDatasource — abstract interface for the backend
// enriched course list read API.
//
// Scope: Read-only course summaries (level, lesson count, real progress)
// for the authenticated student.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes lesson counts or progress percentages. All data
//   comes from the backend-persisted read endpoint.
// - studentId is JWT-resolved by the backend; the endpoint takes no
//   path/query parameters.
// - Bearer token injected from provider layer; never stored here.

import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';

abstract class StudentCoursesRemoteDatasource {
  /// GET /student/courses
  Future<List<StudentCourseModel>> getCourses({
    required String bearerToken,
  });
}
