// LessonProgress — domain entity for the mobile Lesson List screen.
//
// Maps to StudentLessonSummary returned by GET /student/lessons?chapterId=.
// `completed` and `current` are backend-computed and supplied verbatim;
// Flutter never derives them. This is a distinct entity from [Lesson]
// (GET /curriculum/lessons), which stays the admin/content-management
// shape with no per-student data.

class LessonProgress {
  const LessonProgress({
    required this.id,
    required this.title,
    required this.description,
    required this.xpValue,
    required this.completed,
    required this.current,
  });

  final String id;
  final String title;
  final String description;

  /// Gamification points awarded on completion. Display-only.
  final int xpValue;

  /// From lesson_progress.completed for this student.
  final bool completed;

  /// Backend-computed: true for exactly the first non-completed lesson.
  final bool current;
}
