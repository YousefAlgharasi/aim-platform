// ChapterQuizSummary — the quiz linked to a chapter (assessments.chapter_id),
// if any. Backend-supplied from GET /student/lessons?chapterId= (sibling
// `quiz` field alongside the lesson list). Flutter never infers this.

class ChapterQuizSummary {
  const ChapterQuizSummary({
    required this.assessmentId,
    required this.title,
    required this.completed,
    required this.locked,
  });

  final String assessmentId;
  final String title;

  /// Backend-computed: true when the student has a passing result for this quiz.
  final bool completed;

  /// Backend-computed: true until every lesson in the chapter is completed.
  final bool locked;
}
