// Phase 6 — P6-072
// LessonsRepositoryImpl — data-layer implementation of LessonsRepository.
//
// Scope: Lessons / curriculum browser only.
//
// Wraps LessonsRemoteDatasource and maps ApiClientException to AppException
// so that the logic layer deals in domain errors only.
//
// Security rules:
// - All curriculum values passed verbatim from datasource to logic layer.
// - No difficulty, ordering, mastery, or AIM Engine logic here.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lessons_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/content_status_guard.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

class LessonsRepositoryImpl implements LessonsRepository {
  const LessonsRepositoryImpl({
    required LessonsRemoteDatasource datasource,
  }) : _datasource = datasource;

  final LessonsRemoteDatasource _datasource;

  @override
  @override
  Future<List<CourseModel>> getCourses({
    required String bearerToken,
  }) async {
    final results = await _wrap(() => _datasource.getCourses(bearerToken: bearerToken));
    return ContentStatusGuard.filterCourses(results);
  }

  @override
  @override
  Future<List<LevelModel>> getLevels({
    required String bearerToken,
    required String courseId,
  }) async {
    final results = await _wrap(() => _datasource.getLevels(
          bearerToken: bearerToken,
          courseId: courseId,
        ));
    return ContentStatusGuard.filterLevels(results);
  }

  @override
  @override
  Future<List<ChapterModel>> getChapters({
    required String bearerToken,
    required String levelId,
  }) async {
    final results = await _wrap(() => _datasource.getChapters(
          bearerToken: bearerToken,
          levelId: levelId,
        ));
    return ContentStatusGuard.filterChapters(results);
  }

  @override
  @override
  Future<List<LessonModel>> getLessons({
    required String bearerToken,
    required String chapterId,
  }) async {
    final results = await _wrap(() => _datasource.getLessons(
          bearerToken: bearerToken,
          chapterId: chapterId,
        ));
    return ContentStatusGuard.filterLessons(results);
  }

  @override
  Future<List<ChapterProgressModel>> getChaptersWithProgress({
    required String bearerToken,
    required String levelId,
  }) {
    // No ContentStatusGuard pass here: GET /student/chapters already filters
    // to published-only server-side, and ChapterProgressModel.status is a
    // per-student progress value (not_started/in_progress/completed), not
    // the draft/published/archived lifecycle status the guard checks.
    return _wrap(() => _datasource.getChaptersWithProgress(
          bearerToken: bearerToken,
          levelId: levelId,
        ));
  }

  @override
  Future<List<LessonProgressModel>> getLessonsWithProgress({
    required String bearerToken,
    required String chapterId,
  }) {
    // No ContentStatusGuard pass here: GET /student/lessons already filters
    // to published-only server-side, and LessonProgressModel has no
    // lifecycle status field at all.
    return _wrap(() => _datasource.getLessonsWithProgress(
          bearerToken: bearerToken,
          chapterId: chapterId,
        ));
  }

  @override
  Future<FinalExamSummaryModel?> getFinalExamForLevel({
    required String bearerToken,
    required String levelId,
  }) {
    return _wrap(() => _datasource.getFinalExamForLevel(
          bearerToken: bearerToken,
          levelId: levelId,
        ));
  }

  @override
  Future<ChapterQuizSummaryModel?> getChapterQuiz({
    required String bearerToken,
    required String chapterId,
  }) {
    return _wrap(() => _datasource.getChapterQuiz(
          bearerToken: bearerToken,
          chapterId: chapterId,
        ));
  }

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
