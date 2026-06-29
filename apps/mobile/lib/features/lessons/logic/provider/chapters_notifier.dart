// Phase 6 — P6-074
// ChaptersNotifier — manages the chapter list screen state.
//
// Scope: Chapter list screen only.
//
// Security rules:
// - levelId/courseId are always backend-supplied values from prior API
//   responses; never from user input.
// - Flutter never computes status, sortOrder, or curriculum hierarchy.
// - Bearer token sourced from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

class ChaptersNotifier extends AppStateNotifier<List<ChapterModel>> {
  ChaptersNotifier({required LessonsRepository repository})
      : _repository = repository;

  final LessonsRepository _repository;

  /// Load chapters for the given [levelId].
  ///
  /// [levelId] must be a backend-supplied value from a prior API response.
  /// Never pass a user-constructed ID here.
  Future<void> load({
    required String bearerToken,
    required String levelId,
  }) async {
    setLoading();
    try {
      final chapters = await _repository.getChapters(
        bearerToken: bearerToken,
        levelId: levelId,
      );
      setSuccess(chapters);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load chapters',
        code: 'CHAPTERS_LOAD_FAILED',
      );
    }
  }

  Future<void> refresh({
    required String bearerToken,
    required String levelId,
  }) =>
      load(bearerToken: bearerToken, levelId: levelId);

  /// Load chapters for the given [courseId] by first resolving the course's
  /// levels and using the first one. A course's chapters are stored under
  /// its level(s), not directly under the course, so the levelId must be
  /// resolved before chapters can be fetched.
  ///
  /// [courseId] must be a backend-supplied value from a prior CourseModel
  /// response. Never pass a user-constructed ID here.
  Future<void> loadForCourse({
    required String bearerToken,
    required String courseId,
  }) async {
    setLoading();
    try {
      final levels = await _repository.getLevels(
        bearerToken: bearerToken,
        courseId: courseId,
      );
      if (levels.isEmpty) {
        setSuccess(const []);
        return;
      }
      final chapters = await _repository.getChapters(
        bearerToken: bearerToken,
        levelId: levels.first.id,
      );
      setSuccess(chapters);
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: 'Failed to load chapters',
        code: 'CHAPTERS_LOAD_FAILED',
      );
    }
  }
}
