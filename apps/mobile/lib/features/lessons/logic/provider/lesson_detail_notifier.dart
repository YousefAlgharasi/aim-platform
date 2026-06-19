// Phase 6 — P6-078
// LessonDetailNotifier — manages the lesson detail screen state.
//
// Scope: Lesson detail screen only.
//
// Security rules:
// - lessonId is always a backend-supplied value from a prior LessonModel
//   response; never from user input.
// - Flutter never computes type, status, order, or asset values.
// - Bearer token sourced from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lesson_detail_repository.dart';

class LessonDetailNotifier extends AppStateNotifier<LessonDetail> {
  LessonDetailNotifier({required LessonDetailRepository repository})
      : _repository = repository;

  final LessonDetailRepository _repository;

  /// Load lesson detail and published assets for [lessonId].
  ///
  /// [lessonId] must be a backend-supplied value from a prior LessonModel.
  /// Never pass a user-constructed ID here.
  Future<void> load({
    required String bearerToken,
    required String lessonId,
  }) async {
    setLoading();
    try {
      final detail = await _repository.getLessonDetail(
        bearerToken: bearerToken,
        lessonId: lessonId,
      );
      setSuccess(detail);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load lesson',
        code: 'LESSON_DETAIL_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({
    required String bearerToken,
    required String lessonId,
  }) =>
      load(bearerToken: bearerToken, lessonId: lessonId);
}
