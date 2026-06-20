// P10-050: AssessmentDetail domain entity.
// Maps to GET /student/assessments/:id response.
// All fields are backend-supplied; Flutter never modifies them.

class AssessmentSection {
  const AssessmentSection({
    required this.id,
    required this.title,
    required this.order,
    required this.questionCount,
  });

  final String id;
  final String title;
  final int order;
  final int questionCount;
}

class AssessmentDeadline {
  const AssessmentDeadline({
    required this.deadlineId,
    required this.opensAt,
    required this.closesAt,
    required this.extendedClosesAt,
    required this.status,
  });

  final String deadlineId;
  final String opensAt;
  final String closesAt;
  final String? extendedClosesAt;
  final String status;
}

class AssessmentDetail {
  const AssessmentDetail({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.sections,
    required this.maxAttempts,
    required this.timeLimitSeconds,
    required this.deadline,
  });

  final String id;
  final String type;
  final String title;
  final String? description;
  final List<AssessmentSection> sections;
  final int maxAttempts;
  final int? timeLimitSeconds;
  final AssessmentDeadline? deadline;
}
