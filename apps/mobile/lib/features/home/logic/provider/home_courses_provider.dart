// homeCoursesProvider — the student's course list for the home screen.
//
// Shared by the welcome card (current course name + progress) and the
// learning roadmap (current course path, or the next course once the
// current one is completed). Each course's status, percent, locked, current
// and next flags are backend-computed (GET /student/courses); home only
// reads them.

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/provider/student_courses_provider.dart';

final homeCoursesProvider =
    FutureProvider.autoDispose<List<StudentCourseModel>>((ref) async {
  final token = ref.watch(authFlowProvider).accessToken;
  if (token == null || token.isEmpty) return const [];
  return ref
      .read(studentCoursesRepositoryProvider)
      .getCourses(bearerToken: token);
});
