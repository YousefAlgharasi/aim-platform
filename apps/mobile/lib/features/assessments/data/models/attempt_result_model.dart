// P10-050: Attempt lifecycle and result models — data-layer.
// Parses JSON from start/resume/submit/result API responses.

import '../../logic/entity/attempt_result.dart';

class StartAttemptResultModel extends StartAttemptResult {
  const StartAttemptResultModel({
    required super.attemptId,
    required super.assessmentId,
    required super.attemptNumber,
    required super.status,
    required super.startedAt,
    required super.expiresAt,
  });

  factory StartAttemptResultModel.fromJson(Map<String, dynamic> json) {
    return StartAttemptResultModel(
      attemptId: json['attemptId'] as String,
      assessmentId: json['assessmentId'] as String,
      attemptNumber: (json['attemptNumber'] as num).toInt(),
      status: json['status'] as String,
      startedAt: json['startedAt'] as String,
      expiresAt: json['expiresAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'attemptId': attemptId,
        'assessmentId': assessmentId,
        'attemptNumber': attemptNumber,
        'status': status,
        'startedAt': startedAt,
        'expiresAt': expiresAt,
      };
}

class ResumeAttemptResultModel extends ResumeAttemptResult {
  const ResumeAttemptResultModel({
    required super.attemptId,
    required super.status,
    required super.expiresAt,
  });

  factory ResumeAttemptResultModel.fromJson(Map<String, dynamic> json) {
    return ResumeAttemptResultModel(
      attemptId: json['attemptId'] as String,
      status: json['status'] as String,
      expiresAt: json['expiresAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'attemptId': attemptId,
        'status': status,
        'expiresAt': expiresAt,
      };
}

class SubmitAttemptResultModel extends SubmitAttemptResult {
  const SubmitAttemptResultModel({
    required super.attemptId,
    required super.status,
    required super.submittedAt,
    required super.resultId,
  });

  factory SubmitAttemptResultModel.fromJson(Map<String, dynamic> json) {
    return SubmitAttemptResultModel(
      attemptId: json['attemptId'] as String,
      status: json['status'] as String,
      submittedAt: json['submittedAt'] as String,
      resultId: json['resultId'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'attemptId': attemptId,
        'status': status,
        'submittedAt': submittedAt,
        'resultId': resultId,
      };
}

class BreakdownItemModel extends BreakdownItem {
  const BreakdownItemModel({
    required super.assessmentQuestionLinkId,
    required super.sectionId,
    required super.pointsAwarded,
    required super.pointsPossible,
    super.isCorrect,
  });

  factory BreakdownItemModel.fromJson(Map<String, dynamic> json) {
    return BreakdownItemModel(
      assessmentQuestionLinkId: json['assessmentQuestionLinkId'] as String,
      sectionId: json['sectionId'] as String?,
      pointsAwarded: (json['pointsAwarded'] as num).toDouble(),
      pointsPossible: (json['pointsPossible'] as num).toDouble(),
      isCorrect: json['isCorrect'] as bool?,
    );
  }

  Map<String, dynamic> toJson() => {
        'assessmentQuestionLinkId': assessmentQuestionLinkId,
        'sectionId': sectionId,
        'pointsAwarded': pointsAwarded,
        'pointsPossible': pointsPossible,
        if (isCorrect != null) 'isCorrect': isCorrect,
      };
}

class AttemptResultDetailModel extends AttemptResultDetail {
  const AttemptResultDetailModel({
    required super.resultId,
    required super.attemptId,
    required super.score,
    required super.maxScore,
    required super.passed,
    required super.latePenaltyApplied,
    required super.gradedAt,
    required super.feedbackAllowed,
    required super.breakdown,
    super.assessmentType,
    super.courseId,
    super.percentScore,
    super.totalQuestions,
    super.correctCount,
    super.wrongCount,
    super.skippedCount,
    super.answersRevealed,
    super.certificateId,
    super.review,
  });

  factory AttemptResultDetailModel.fromJson(Map<String, dynamic> json) {
    return AttemptResultDetailModel(
      resultId: json['resultId'] as String,
      attemptId: json['attemptId'] as String,
      score: (json['score'] as num).toDouble(),
      maxScore: (json['maxScore'] as num).toDouble(),
      passed: json['passed'] as bool,
      latePenaltyApplied: json['latePenaltyApplied'] as bool,
      gradedAt: json['gradedAt'] as String,
      feedbackAllowed: json['feedbackAllowed'] as bool,
      breakdown: (json['breakdown'] as List<dynamic>)
          .map((b) => BreakdownItemModel.fromJson(b as Map<String, dynamic>))
          .toList(),
      assessmentType: json['assessmentType'] as String?,
      courseId: json['courseId'] as String?,
      percentScore: (json['percentScore'] as num?)?.round(),
      totalQuestions: (json['totalQuestions'] as num?)?.toInt() ?? 0,
      correctCount: (json['correctCount'] as num?)?.toInt() ?? 0,
      wrongCount: (json['wrongCount'] as num?)?.toInt() ?? 0,
      skippedCount: (json['skippedCount'] as num?)?.toInt() ?? 0,
      answersRevealed: json['answersRevealed'] as bool? ?? false,
      certificateId: json['certificateId'] as String?,
      review: (json['review'] as List<dynamic>? ?? const [])
          .map((r) => _reviewItemFromJson(r as Map<String, dynamic>))
          .toList(),
    );
  }

  static ReviewItem _reviewItemFromJson(Map<String, dynamic> json) {
    return ReviewItem(
      assessmentQuestionLinkId: json['assessmentQuestionLinkId'] as String,
      number: (json['number'] as num).toInt(),
      prompt: json['prompt'] as String? ?? '',
      options: (json['options'] as List<dynamic>? ?? const [])
          .map((o) => o as Map<String, dynamic>)
          .map((o) => ReviewOption(
                id: o['id'] as String,
                label: o['label'] as String? ?? '',
                text: o['text'] as String? ?? '',
              ))
          .toList(),
      selectedOptionId: json['selectedOptionId'] as String?,
      correctOptionIds: (json['correctOptionIds'] as List<dynamic>? ?? const [])
          .cast<String>(),
      status: switch (json['status']) {
        'correct' => ReviewStatus.correct,
        'wrong' => ReviewStatus.wrong,
        _ => ReviewStatus.skipped,
      },
    );
  }

  Map<String, dynamic> toJson() => {
        'resultId': resultId,
        'attemptId': attemptId,
        'score': score,
        'maxScore': maxScore,
        'passed': passed,
        'latePenaltyApplied': latePenaltyApplied,
        'gradedAt': gradedAt,
        'feedbackAllowed': feedbackAllowed,
        'breakdown':
            breakdown.map((b) => (b as BreakdownItemModel).toJson()).toList(),
      };
}
