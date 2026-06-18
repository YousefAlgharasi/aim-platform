// Phase 6 — P6-073
// CoursesNotifier — manages the course list screen state.
//
// Scope: Course list screen only.
//
// Responsibilities:
//   1. Fetch published courses from backend via LessonsRepository.
//   2. Expose AppAsyncState<List<CourseModel>> to the UI.
//   3. Support refresh.
//
// Security rules:
// - Flutter never computes status, sortOrder, or curriculum hierarchy.
// - Bearer token sourced from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

class CoursesNotifier extends AppStateNotifier<List<CourseModel>> {
  CoursesNotifier({required LessonsRepository repository})
      : _repository = repository;

  final LessonsRepository _repository;

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
        code: 'COURSES_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({required String bearerToken}) =>
      load(bearerToken: bearerToken);
}
