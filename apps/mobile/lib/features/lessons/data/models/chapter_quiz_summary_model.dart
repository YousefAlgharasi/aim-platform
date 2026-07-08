// ChapterQuizSummaryModel — data-layer model for ChapterQuizSummary.
// Parses the `quiz` field of GET /student/lessons?chapterId=.

import '../../logic/entity/chapter_quiz_summary.dart';

class ChapterQuizSummaryModel extends ChapterQuizSummary {
  const ChapterQuizSummaryModel({
    required super.assessmentId,
    required super.title,
  });

  factory ChapterQuizSummaryModel.fromJson(Map<String, dynamic> json) {
    return ChapterQuizSummaryModel(
      assessmentId: json['assessmentId'] as String,
      title: json['title'] as String,
    );
  }
}
