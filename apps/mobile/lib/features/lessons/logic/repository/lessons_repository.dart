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
}
