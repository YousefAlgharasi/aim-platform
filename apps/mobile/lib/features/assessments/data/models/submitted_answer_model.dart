// SubmittedAnswerModel — data-layer model for SubmittedAnswer.
// Parses POST /student/assessments/attempts/:attemptId/answers response.

import '../../logic/entity/submitted_answer.dart';

class SubmittedAnswerModel extends SubmittedAnswer {
  const SubmittedAnswerModel({
    required super.answerId,
    required super.assessmentQuestionLinkId,
    required super.submittedAt,
  });

  factory SubmittedAnswerModel.fromJson(Map<String, dynamic> json) {
    return SubmittedAnswerModel(
      answerId: json['answerId'] as String,
      assessmentQuestionLinkId: json['assessmentQuestionLinkId'] as String,
      submittedAt: json['submittedAt'] as String,
    );
  }
}
