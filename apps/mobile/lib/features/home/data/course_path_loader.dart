// CoursePathLoader — what the Home roadmap needs for one course.
//
// Reads GET /student/courses/:courseId/path (levels, chapters, final exam and
// the active chapter's lessons in one response). Which chapter is active and
// every chapter/lesson status come from the backend; nothing is computed here.
//
// When the backend has no such endpoint yet (or the call fails) it falls back
// to the separate levels/chapters/lessons requests, so an older backend keeps
// working.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/lessons/data/models/chapter_progress_model.dart';
import 'package:aim_mobile/features/lessons/data/models/chapter_quiz_summary_model.dart';
import 'package:aim_mobile/features/lessons/data/models/final_exam_summary_model.dart';
import 'package:aim_mobile/features/lessons/data/models/lesson_progress_model.dart';
import 'package:aim_mobile/features/lessons/logic/entity/chapter_quiz_summary.dart';
import 'package:aim_mobile/features/lessons/logic/entity/final_exam_summary.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_progress.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';

class CoursePathData {
  const CoursePathData({
    this.activeChapterId,
    this.activeChapterTitle,
    this.lessons = const [],
    this.quiz,
    this.finalExam,
  });

  /// Null when every chapter is completed.
  final String? activeChapterId;
  final String? activeChapterTitle;
  final List<LessonProgress> lessons;
  final ChapterQuizSummary? quiz;
  final FinalExamSummary? finalExam;
}

class CoursePathLoader {
  CoursePathLoader({
    required BackendApiClient Function() apiClient,
    required LessonsRepository lessonsRepository,
  })  : _apiClient = apiClient,
        _lessons = lessonsRepository;

  final BackendApiClient Function() _apiClient;
  final LessonsRepository _lessons;

  /// Null when the course has no published levels.
  Future<CoursePathData?> load({
    required String bearerToken,
    required String courseId,
  }) async {
    try {
      return await _viaCoursePath(bearerToken, courseId);
    } catch (_) {
      return _viaSeparateEndpoints(bearerToken, courseId);
    }
  }

  Future<CoursePathData?> _viaCoursePath(
      String bearerToken, String courseId) async {
    final envelope = await _apiClient().get<Map<String, dynamic>>(
      BackendApiPaths.studentCoursePath(courseId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException('Unexpected course path response shape');
        }
        return json;
      },
    );
    final data = envelope.data;
    if (data == null) throw const FormatException('Empty course path');

    final levels = data['levels'];
    if (levels is! List || levels.isEmpty) return null;

    final finalExamJson = data['finalExam'];
    final finalExam = finalExamJson is Map<String, dynamic>
        ? FinalExamSummaryModel.fromJson(finalExamJson)
        : null;

    final active = data['activeChapter'];
    if (active is! Map<String, dynamic>) {
      return CoursePathData(finalExam: finalExam);
    }

    final chapterId = active['chapterId'] as String;
    String? title;
    for (final level in levels.whereType<Map<String, dynamic>>()) {
      final chapters = level['chapters'];
      if (chapters is! List) continue;
      for (final c in chapters.whereType<Map<String, dynamic>>()) {
        if (c['chapterId'] == chapterId) {
          title = ChapterProgressModel.fromJson(c).title;
        }
      }
    }

    final lessons = active['lessons'];
    final quiz = active['quiz'];
    return CoursePathData(
      activeChapterId: chapterId,
      activeChapterTitle: title ?? '',
      lessons: lessons is List
          ? lessons
              .whereType<Map<String, dynamic>>()
              .map(LessonProgressModel.fromJson)
              .toList()
          : const [],
      quiz: quiz is Map<String, dynamic>
          ? ChapterQuizSummaryModel.fromJson(quiz)
          : null,
      finalExam: finalExam,
    );
  }

  Future<CoursePathData?> _viaSeparateEndpoints(
      String bearerToken, String courseId) async {
    final levels =
        await _lessons.getLevels(bearerToken: bearerToken, courseId: courseId);
    if (levels.isEmpty) return null;
    final levelId = levels.first.id;

    final (chapters, finalExam) = await (
      _lessons.getChaptersWithProgress(
          bearerToken: bearerToken, levelId: levelId),
      _lessons.getFinalExamForLevel(bearerToken: bearerToken, levelId: levelId),
    ).wait;

    final active = chapters.where((c) => !c.isCompleted).firstOrNull;
    if (active == null) return CoursePathData(finalExam: finalExam);

    final (lessons, quiz) = await (
      _lessons.getLessonsWithProgress(
          bearerToken: bearerToken, chapterId: active.chapterId),
      _lessons.getChapterQuiz(
          bearerToken: bearerToken, chapterId: active.chapterId),
    ).wait;

    return CoursePathData(
      activeChapterId: active.chapterId,
      activeChapterTitle: active.title,
      lessons: lessons,
      quiz: quiz,
      finalExam: finalExam,
    );
  }
}
