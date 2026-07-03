// ChapterProgress — domain entity for the mobile Chapter List screen.
//
// Maps to StudentChapterSummary returned by GET /student/chapters?levelId=.
// All fields — including percent/completedLessonCount/status — are
// backend-computed and supplied verbatim; Flutter never derives them. This
// is a distinct entity from [Chapter] (GET /curriculum/chapters), which
// stays the admin/content-management shape with no per-student data.

class ChapterProgress {
  const ChapterProgress({
    required this.chapterId,
    required this.title,
    required this.description,
    required this.levelCode,
    required this.lessonCount,
    required this.completedLessonCount,
    required this.percent,
    required this.status,
  });

  final String chapterId;
  final String title;
  final String? description;

  /// Code of the chapter's parent level (e.g. 'A1'), or null.
  final String? levelCode;

  /// Count of published lessons under this chapter.
  final int lessonCount;

  /// Count of those lessons the student has completed.
  final int completedLessonCount;

  /// Backend-computed: round(completedLessonCount / lessonCount * 100).
  final int percent;

  /// Backend-computed: 'not_started' | 'in_progress' | 'completed'.
  final String status;

  bool get isCompleted => status == 'completed';
  bool get isInProgress => status == 'in_progress';
}
