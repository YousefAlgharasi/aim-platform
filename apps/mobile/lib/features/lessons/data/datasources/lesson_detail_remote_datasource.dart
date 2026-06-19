// Phase 6 — P6-077
// LessonDetailRemoteDatasource — abstract interface (data layer).
//
// Scope: Lesson detail screen only.
//
// Fetches lesson detail and published assets from the backend.
// All values (type, status, order, url) are backend-controlled.
// Flutter renders verbatim.
//
// Security rules:
// - Bearer token injected by the provider layer; never stored here.
// - lessonId is always a backend-supplied value from a prior LessonModel
//   response; never constructed from user input.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

abstract class LessonDetailRemoteDatasource {
  /// GET /curriculum/lessons/:lessonId
  ///
  /// Returns the lesson summary for the given backend-supplied [lessonId].
  Future<LessonModel> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  });

  /// GET /curriculum/lesson-assets?lessonId=:lessonId&status=published
  ///
  /// Returns published assets for the given backend-supplied [lessonId].
  /// Flutter only fetches published assets; status filter is backend-enforced.
  Future<List<LessonAssetModel>> getLessonAssets({
    required String bearerToken,
    required String lessonId,
  });
}
