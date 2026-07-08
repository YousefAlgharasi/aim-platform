// ChapterQuizSummary — the quiz linked to a chapter (assessments.chapter_id),
// if any. Backend-supplied from GET /student/lessons?chapterId= (sibling
// `quiz` field alongside the lesson list). Flutter never infers this.

class ChapterQuizSummary {
  const ChapterQuizSummary({
    required this.assessmentId,
    required this.title,
  });

  final String assessmentId;
  final String title;
}
