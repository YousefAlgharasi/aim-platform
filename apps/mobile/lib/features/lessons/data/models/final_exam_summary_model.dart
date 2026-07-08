// FinalExamSummaryModel — data-layer model for FinalExamSummary.
// Parses the `finalExam` field of GET /student/chapters?levelId=.

import '../../logic/entity/final_exam_summary.dart';

class FinalExamSummaryModel extends FinalExamSummary {
  const FinalExamSummaryModel({
    required super.assessmentId,
    required super.title,
    required super.unlocked,
  });

  factory FinalExamSummaryModel.fromJson(Map<String, dynamic> json) {
    return FinalExamSummaryModel(
      assessmentId: json['assessmentId'] as String,
      title: json['title'] as String,
      unlocked: json['unlocked'] as bool,
    );
  }
}
