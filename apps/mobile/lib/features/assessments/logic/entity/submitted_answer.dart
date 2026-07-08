// SubmittedAnswer — confirmation of a saved answer.
// Maps to POST /student/assessments/attempts/:attemptId/answers response
// (SubmittedAnswerDto, answer-submission.service.ts). Never includes
// isCorrect or score — grading happens later, entirely backend-side, at
// submit time.

class SubmittedAnswer {
  const SubmittedAnswer({
    required this.answerId,
    required this.assessmentQuestionLinkId,
    required this.submittedAt,
  });

  final String answerId;
  final String assessmentQuestionLinkId;
  final String submittedAt;
}
