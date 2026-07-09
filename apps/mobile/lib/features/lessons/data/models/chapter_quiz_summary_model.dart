// ChapterQuizSummaryModel — data-layer model for ChapterQuizSummary.
// Parses the `quiz` field of GET /student/lessons?chapterId=.

import '../../logic/entity/chapter_quiz_summary.dart';

class ChapterQuizSummaryModel extends ChapterQuizSummary {
  const ChapterQuizSummaryModel({
    required super.assessmentId,
    required super.title,
    required super.completed,
    required super.locked,
  });

  factory ChapterQuizSummaryModel.fromJson(Map<String, dynamic> json) {
    return ChapterQuizSummaryModel(
      assessmentId: json['assessmentId'] as String,
      title: json['title'] as String,
      completed: json['completed'] as bool? ?? false,
      locked: json['locked'] as bool? ?? true,
    );
  }
}
