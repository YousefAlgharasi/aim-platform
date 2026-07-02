// StudentCoursesNotifier — manages the Courses screen state.
//
// Security rules:
// - studentId is resolved server-side from the JWT; Flutter never passes it.
// - Flutter never computes lesson counts or progress percentages.
// - Bearer token sourced from authFlowProvider; never stored here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/student_courses/data/models/student_course_model.dart';
import 'package:aim_mobile/features/student_courses/logic/repository/student_courses_repository.dart';

class StudentCoursesNotifier extends AppStateNotifier<List<StudentCourseModel>> {
  StudentCoursesNotifier({required StudentCoursesRepository repository})
      : _repository = repository;

  final StudentCoursesRepository _repository;

  Future<void> load({required String bearerToken}) async {
    setLoading();
    try {
      final courses = await _repository.getCourses(bearerToken: bearerToken);
      setSuccess(courses);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load courses',
        code: 'STUDENT_COURSES_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({required String bearerToken}) =>
      load(bearerToken: bearerToken);
}
