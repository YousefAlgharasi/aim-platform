// StudentCoursesRepository — abstract interface (logic layer).
//
// Read-only. Flutter NEVER computes lesson counts or progress percentages.
// All values come from the backend.

import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';

abstract class StudentCoursesRepository {
  Future<List<StudentCourseModel>> getCourses({
    required String bearerToken,
  });
}
