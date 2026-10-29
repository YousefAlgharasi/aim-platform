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

/// Backend verdict for one question in the post-exam review.
enum ReviewStatus { correct, wrong, skipped }

class ReviewOption {
  const ReviewOption({required this.id, required this.label, required this.text});

  final String id;
  final String label;
  final String text;
}

/// One question in the post-submission review. Status and correct options
/// come from the backend; correctOptionIds is empty until the backend
/// reveals answers (passed, no attempts left, or feedback policy allows).
class ReviewItem {
  const ReviewItem({
    required this.assessmentQuestionLinkId,
    required this.number,
    required this.prompt,
    required this.options,
    required this.selectedOptionId,
    required this.correctOptionIds,
    required this.status,
  });

  final String assessmentQuestionLinkId;
  final int number;
  final String prompt;
  final List<ReviewOption> options;
  final String? selectedOptionId;
  final List<String> correctOptionIds;
  final ReviewStatus status;
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
    this.assessmentType,
    this.courseId,
    this.percentScore,
    this.totalQuestions = 0,
    this.correctCount = 0,
    this.wrongCount = 0,
    this.skippedCount = 0,
    this.answersRevealed = false,
    this.certificateId,
    this.review = const [],
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

  /// 'exam' (course final exam) or 'quiz'.
  final String? assessmentType;
  final String? courseId;

  /// Backend-computed score out of 100.
  final int? percentScore;
  final int totalQuestions;
  final int correctCount;
  final int wrongCount;
  final int skippedCount;
  final bool answersRevealed;
  final String? certificateId;
  final List<ReviewItem> review;

  bool get isCourseExam => assessmentType == 'exam' && courseId != null;
}
