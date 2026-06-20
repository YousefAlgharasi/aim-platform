// P10-050: Result history domain entities.
// Maps to GET /student/assessments/:id/history response.
// All fields are backend-supplied; Flutter never modifies them.

class ResultHistoryItem {
  const ResultHistoryItem({
    required this.resultId,
    required this.attemptId,
    required this.attemptNumber,
    required this.score,
    required this.maxScore,
    required this.passed,
    required this.latePenaltyApplied,
    required this.gradedAt,
    required this.submittedAt,
  });

  final String resultId;
  final String attemptId;
  final int attemptNumber;
  final double score;
  final double maxScore;
  final bool passed;
  final bool latePenaltyApplied;
  final String gradedAt;
  final String? submittedAt;
}

class ResultHistory {
  const ResultHistory({
    required this.assessmentId,
    required this.totalAttempts,
    required this.results,
  });

  final String assessmentId;
  final int totalAttempts;
  final List<ResultHistoryItem> results;
}
