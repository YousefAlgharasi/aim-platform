// P10-050: Attempt lifecycle and result domain entities.
// Maps to start/resume/submit/result API responses.
// All fields are backend-supplied; Flutter never modifies them.

class StartAttemptResult {
  const StartAttemptResult({
    required this.attemptId,
    required this.assessmentId,
    required this.attemptNumber,
    required this.status,
    required this.startedAt,
    required this.expiresAt,
  });

  final String attemptId;
  final String assessmentId;
  final int attemptNumber;
  final String status;
  final String startedAt;
  final String? expiresAt;
}

class ResumeAttemptResult {
  const ResumeAttemptResult({
    required this.attemptId,
    required this.status,
    required this.expiresAt,
  });

  final String attemptId;
  final String status;
  final String? expiresAt;
}

class SubmitAttemptResult {
  const SubmitAttemptResult({
    required this.attemptId,
    required this.status,
    required this.submittedAt,
    required this.resultId,
  });

  final String attemptId;
  final String status;
  final String submittedAt;
  final String resultId;
}

class BreakdownItem {
  const BreakdownItem({
    required this.assessmentQuestionLinkId,
    required this.sectionId,
    required this.pointsAwarded,
    required this.pointsPossible,
    this.isCorrect,
  });

  final String assessmentQuestionLinkId;
  final String? sectionId;
  final double pointsAwarded;
  final double pointsPossible;
  final bool? isCorrect;
}

class AttemptResultDetail {
  const AttemptResultDetail({
    required this.resultId,
    required this.attemptId,
    required this.score,
    required this.maxScore,
    required this.passed,
    required this.latePenaltyApplied,
    required this.gradedAt,
    required this.feedbackAllowed,
    required this.breakdown,
  });

  final String resultId;
  final String attemptId;
  final double score;
  final double maxScore;
  final bool passed;
  final bool latePenaltyApplied;
  final String gradedAt;
  final bool feedbackAllowed;
  final List<BreakdownItem> breakdown;
}
