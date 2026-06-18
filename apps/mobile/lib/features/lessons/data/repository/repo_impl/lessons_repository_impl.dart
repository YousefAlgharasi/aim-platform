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
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

class LessonsRepositoryImpl implements LessonsRepository {
  const LessonsRepositoryImpl({
    required LessonsRemoteDatasource datasource,
  }) : _datasource = datasource;

  final LessonsRemoteDatasource _datasource;

  @override
  Future<List<CourseModel>> getCourses({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getCourses(bearerToken: bearerToken));

  @override
  Future<List<ChapterModel>> getChapters({
    required String bearerToken,
    required String levelId,
  }) =>
      _wrap(() => _datasource.getChapters(
            bearerToken: bearerToken,
            levelId: levelId,
          ));

  @override
  Future<List<LessonModel>> getLessons({
    required String bearerToken,
    required String chapterId,
  }) =>
      _wrap(() => _datasource.getLessons(
            bearerToken: bearerToken,
            chapterId: chapterId,
          ));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
