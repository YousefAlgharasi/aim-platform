// Phase 6 — P6-072
// LessonsRepository — abstract interface (logic layer).
//
// Scope: Lessons / curriculum browser only.
//
// Security rules:
// - Flutter never calculates status, sortOrder, difficulty, or any curriculum
//   hierarchy value. All values come from the backend verbatim.
// - levelId and chapterId are backend-supplied IDs from prior responses;
//   never constructed from user input.
// - Bearer token is passed from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

abstract class LessonsRepository {
  /// Fetch the list of published courses.
  /// All values (status, sortOrder) are backend-controlled.
  Future<List<CourseModel>> getCourses({
    required String bearerToken,
  });

  /// Fetch the list of levels for a backend-supplied [courseId].
  /// [courseId] must come from a prior [getCourses] response; never from
  /// user input.
  Future<List<LevelModel>> getLevels({
    required String bearerToken,
    required String courseId,
  });

  /// Fetch chapters for a backend-supplied [levelId].
  /// [levelId] must come from a prior [getCourses] response; never from
  /// user input.
  Future<List<ChapterModel>> getChapters({
    required String bearerToken,
    required String levelId,
  });

  /// Fetch lessons for a backend-supplied [chapterId].
  /// [chapterId] must come from a prior [getChapters] response; never from
  /// user input.
  Future<List<LessonModel>> getLessons({
    required String bearerToken,
    required String chapterId,
  });

  /// Fetch published chapters for a backend-supplied [levelId], enriched
  /// with the authenticated student's real progress (percent,
  /// completedLessonCount, status — all backend-computed).
  /// [levelId] must come from a prior response; never from user input.
  Future<List<ChapterProgressModel>> getChaptersWithProgress({
    required String bearerToken,
    required String levelId,
  });

  /// Fetch published lessons for a backend-supplied [chapterId], enriched
  /// with the authenticated student's real completed/current markers (both
  /// backend-computed).
  /// [chapterId] must come from a prior [getChaptersWithProgress] response;
  /// never from user input.
  Future<List<LessonProgressModel>> getLessonsWithProgress({
    required String bearerToken,
    required String chapterId,
  });
}
