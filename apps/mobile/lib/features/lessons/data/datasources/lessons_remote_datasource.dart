// Phase 6 — P6-071
// LessonsRemoteDatasource — abstract interface (data layer).
//
// Scope: Lessons / curriculum browser only.
//
// Fetches published curriculum data from the backend. All values (status,
// sortOrder, hierarchy IDs) are backend-controlled. Flutter renders verbatim.
//
// Security rules:
// - Bearer token is injected by the provider layer; never stored here.
// - levelId and chapterId are backend-supplied IDs from prior responses;
//   never constructed from user input.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';

abstract class LessonsRemoteDatasource {
  /// GET /curriculum/courses?status=published
  ///
  /// Returns the list of published courses for the browser.
  /// [status] and [sortOrder] are never set or modified by Flutter.
  Future<List<CourseModel>> getCourses({
    required String bearerToken,
  });

  /// GET /curriculum/courses/:courseId/levels
  ///
  /// Returns the list of levels for the given backend-supplied [courseId].
  /// [courseId] must come from a prior [getCourses] response; never from
  /// user input.
  Future<List<LevelModel>> getLevels({
    required String bearerToken,
    required String courseId,
  });

  /// GET /curriculum/chapters?levelId=:levelId
  ///
  /// Returns chapters for the given backend-supplied [levelId].
  /// [levelId] must come from a prior [getCourses] response; never from
  /// user input.
  Future<List<ChapterModel>> getChapters({
    required String bearerToken,
    required String levelId,
  });

  /// GET /curriculum/lessons?chapterId=:chapterId
  ///
  /// Returns lessons for the given backend-supplied [chapterId].
  /// [chapterId] must come from a prior [getChapters] response; never from
  /// user input.
  Future<List<LessonModel>> getLessons({
    required String bearerToken,
    required String chapterId,
  });

  /// GET /student/chapters?levelId=:levelId
  ///
  /// Returns published chapters for the given backend-supplied [levelId],
  /// enriched with the authenticated student's real progress (percent,
  /// completedLessonCount, status). studentId is resolved by the backend
  /// from the JWT — never sent from Flutter.
  Future<List<ChapterProgressModel>> getChaptersWithProgress({
    required String bearerToken,
    required String levelId,
  });

  /// GET /student/lessons?chapterId=:chapterId
  ///
  /// Returns published lessons for the given backend-supplied [chapterId],
  /// enriched with the authenticated student's real completed/current
  /// markers. studentId is resolved by the backend from the JWT — never
  /// sent from Flutter.
  Future<List<LessonProgressModel>> getLessonsWithProgress({
    required String bearerToken,
    required String chapterId,
  });

  /// GET /student/chapters?levelId=:levelId — reads the sibling `finalExam`
  /// field alongside the chapter list. Null when the course has no
  /// published final exam.
  Future<FinalExamSummaryModel?> getFinalExamForLevel({
    required String bearerToken,
    required String levelId,
  });

  /// GET /student/lessons?chapterId=:chapterId — reads the sibling `quiz`
  /// field alongside the lesson list. Null when the chapter has no linked
  /// quiz.
  Future<ChapterQuizSummaryModel?> getChapterQuiz({
    required String bearerToken,
    required String chapterId,
  });
}
