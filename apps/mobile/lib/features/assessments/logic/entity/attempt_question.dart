// AttemptQuestion / AttemptQuestionOption — domain entities for the
// question list delivered during an active assessment attempt.
//
// Maps to GET /student/assessments/attempts/:attemptId/questions
// (DeliveredQuestion / DeliveredOption, question-delivery.service.ts).
// All fields are backend-supplied verbatim — correct_answer, is_correct,
// points, and weight are never included by the backend and Flutter never
// computes or infers them.

class AttemptQuestionOption {
  const AttemptQuestionOption({
    required this.id,
    required this.label,
    required this.text,
  });

  final String id;
  final String label;
  final String text;
}

class AttemptQuestion {
  const AttemptQuestion({
    required this.id,
    required this.assessmentQuestionLinkId,
    required this.sectionId,
    required this.order,
    required this.type,
    required this.prompt,
    required this.options,
  });

  final String id;

  /// Used as the key when submitting an answer for this question
  /// (POST /student/assessments/attempts/:attemptId/answers).
  final String assessmentQuestionLinkId;

  final String? sectionId;
  final int order;
  final String type;
  final String prompt;
  final List<AttemptQuestionOption> options;
}
