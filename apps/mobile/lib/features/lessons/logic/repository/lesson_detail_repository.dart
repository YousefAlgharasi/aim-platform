// Phase 6 — P6-078
// LessonDetailRepository — abstract interface (logic layer).
//
// Scope: Lesson detail screen only.
//
// Security rules:
// - lessonId is always a backend-supplied value from a prior LessonModel
//   response; never constructed from user input.
// - Bearer token is passed from the provider layer; never stored here.
// - Flutter never computes type, status, order, or any asset values.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';

abstract class LessonDetailRepository {
  /// Fetch the lesson summary and its published assets for [lessonId].
  ///
  /// [lessonId] must be a backend-supplied value from a prior LessonModel
  /// response. Never pass a user-constructed ID here.
  ///
  /// Runs both backend calls in parallel and returns a [LessonDetail]
  /// aggregate combining the lesson and its published assets.
  Future<LessonDetail> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  });
}
