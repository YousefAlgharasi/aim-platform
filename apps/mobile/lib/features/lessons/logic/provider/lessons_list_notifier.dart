// Phase 6 — P6-075
// LessonsListNotifier — manages the lesson list screen state.
//
// Scope: Lesson list screen only.
//
// Security rules:
// - chapterId is always a backend-supplied value from a prior ChapterModel
//   response; never from user input.
// - Flutter never computes status, sortOrder, or curriculum hierarchy.
// - Bearer token sourced from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

class LessonsListNotifier extends AppStateNotifier<List<LessonModel>> {
  LessonsListNotifier({required LessonsRepository repository})
      : _repository = repository;

  final LessonsRepository _repository;

  /// Load lessons for the given [chapterId].
  ///
  /// [chapterId] must be a backend-supplied value from a prior ChapterModel
  /// response. Never pass a user-constructed ID here.
  Future<void> load({
    required String bearerToken,
    required String chapterId,
  }) async {
    setLoading();
    try {
      final lessons = await _repository.getLessons(
        bearerToken: bearerToken,
        chapterId: chapterId,
      );
      setSuccess(lessons);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load lessons',
        code: 'LESSONS_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({
    required String bearerToken,
    required String chapterId,
  }) =>
      load(bearerToken: bearerToken, chapterId: chapterId);
}
