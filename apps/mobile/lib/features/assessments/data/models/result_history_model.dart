// P10-050: ResultHistoryModel — data-layer model.
// Parses JSON from GET /student/assessments/:id/history.

import '../../logic/entity/result_history.dart';

class ResultHistoryItemModel extends ResultHistoryItem {
  const ResultHistoryItemModel({
    required super.resultId,
    required super.attemptId,
    required super.attemptNumber,
    required super.score,
    required super.maxScore,
    required super.passed,
    required super.latePenaltyApplied,
    required super.gradedAt,
    required super.submittedAt,
  });

  factory ResultHistoryItemModel.fromJson(Map<String, dynamic> json) {
    return ResultHistoryItemModel(
      resultId: json['resultId'] as String,
      attemptId: json['attemptId'] as String,
      attemptNumber: (json['attemptNumber'] as num).toInt(),
      score: (json['score'] as num).toDouble(),
      maxScore: (json['maxScore'] as num).toDouble(),
      passed: json['passed'] as bool,
      latePenaltyApplied: json['latePenaltyApplied'] as bool,
      gradedAt: json['gradedAt'] as String,
      submittedAt: json['submittedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'resultId': resultId,
        'attemptId': attemptId,
        'attemptNumber': attemptNumber,
        'score': score,
        'maxScore': maxScore,
        'passed': passed,
        'latePenaltyApplied': latePenaltyApplied,
        'gradedAt': gradedAt,
        'submittedAt': submittedAt,
      };
}

class ResultHistoryModel extends ResultHistory {
  const ResultHistoryModel({
    required super.assessmentId,
    required super.totalAttempts,
    required super.results,
  });

  factory ResultHistoryModel.fromJson(Map<String, dynamic> json) {
    return ResultHistoryModel(
      assessmentId: json['assessmentId'] as String,
      totalAttempts: (json['totalAttempts'] as num).toInt(),
      results: (json['results'] as List<dynamic>)
          .map((r) =>
              ResultHistoryItemModel.fromJson(r as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'assessmentId': assessmentId,
        'totalAttempts': totalAttempts,
        'results':
            results.map((r) => (r as ResultHistoryItemModel).toJson()).toList(),
      };
}
