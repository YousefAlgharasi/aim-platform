// Phase 6 — P6-078
// LessonDetailRepositoryImpl — data-layer implementation of
// LessonDetailRepository.
//
// Scope: Lesson detail screen only.
//
// Wraps LessonDetailRemoteDatasource, runs both calls in parallel, and
// maps ApiClientException → AppException so the logic layer deals in
// domain errors only.
//
// Security rules:
// - All values passed verbatim from datasource to logic layer.
// - No asset filtering, reordering, or type inference here.
// - No AIM Engine logic, AI Teacher calls, or secrets here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/lessons/data/datasources/lesson_detail_remote_datasource.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/content_status_guard.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lesson_detail_repository.dart';

class LessonDetailRepositoryImpl implements LessonDetailRepository {
  const LessonDetailRepositoryImpl({
    required LessonDetailRemoteDatasource datasource,
  }) : _datasource = datasource;

  final LessonDetailRemoteDatasource _datasource;

  @override
  Future<LessonDetail> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  }) async {
    try {
      // Run both backend calls in parallel for speed.
      final lessonFuture = _datasource.getLessonDetail(
        bearerToken: bearerToken,
        lessonId: lessonId,
      );
      final assetsFuture = _datasource.getLessonAssets(
        bearerToken: bearerToken,
        lessonId: lessonId,
      );

      final results = await Future.wait<Object>([
        lessonFuture,
        assetsFuture,
      ]);

      // Defensive guard: only render published assets in the student app.
      // The datasource already requests status=published; this is a second layer.
      return LessonDetail(
        lesson: lesson,
        assets: ContentStatusGuard.filterAssets(assets),
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
