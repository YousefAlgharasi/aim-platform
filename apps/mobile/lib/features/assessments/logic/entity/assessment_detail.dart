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
    required this.passed,
    int? questionCount,
    this.attemptsUsed = 0,
    required this.attemptsRemaining,
    this.hasActiveAttempt = false,
    this.bestScorePercent,
    this.canStart = true,
    this.blockedReason,
  }) : _questionCount = questionCount;

  final String id;
  final String type;
  final String title;
  final String? description;
  final List<AssessmentSection> sections;
  final int maxAttempts;
  final int? timeLimitSeconds;
  final AssessmentDeadline? deadline;

  final int? _questionCount;

  /// Total questions (backend-supplied; falls back to the section sum).
  int get questionCount =>
      _questionCount ?? sections.fold<int>(0, (sum, s) => sum + s.questionCount);

  /// Attempts already started by this student (backend-counted).
  final int attemptsUsed;

  /// Backend-counted attempts left.
  final int attemptsRemaining;

  /// An unfinished attempt exists; starting resumes it.
  final bool hasActiveAttempt;

  /// Backend-computed: true once any attempt has passed.
  final bool passed;

  /// Backend-computed best score, 0-100. Null before any result.
  final int? bestScorePercent;

  /// Backend-computed: whether Start is allowed right now.
  final bool canStart;

  /// Backend reason Start is blocked: CHAPTER_NOT_COMPLETE,
  /// COURSE_NOT_COMPLETE or MAX_ATTEMPTS_REACHED. Null when [canStart].
  final String? blockedReason;
}
