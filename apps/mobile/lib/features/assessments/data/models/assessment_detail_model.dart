// P10-050: AssessmentDetailModel — data-layer model.
// Parses JSON from GET /student/assessments/:id.

import '../../logic/entity/assessment_detail.dart';

class AssessmentSectionModel extends AssessmentSection {
  const AssessmentSectionModel({
    required super.id,
    required super.title,
    required super.order,
    required super.questionCount,
  });

  factory AssessmentSectionModel.fromJson(Map<String, dynamic> json) {
    return AssessmentSectionModel(
      id: json['id'] as String,
      title: json['title'] as String,
      order: (json['order'] as num).toInt(),
      questionCount: (json['questionCount'] as num).toInt(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'order': order,
        'questionCount': questionCount,
      };
}

class AssessmentDeadlineModel extends AssessmentDeadline {
  const AssessmentDeadlineModel({
    required super.deadlineId,
    required super.opensAt,
    required super.closesAt,
    required super.extendedClosesAt,
    required super.status,
  });

  factory AssessmentDeadlineModel.fromJson(Map<String, dynamic> json) {
    return AssessmentDeadlineModel(
      deadlineId: json['deadlineId'] as String,
      opensAt: json['opensAt'] as String,
      closesAt: json['closesAt'] as String,
      extendedClosesAt: json['extendedClosesAt'] as String?,
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'deadlineId': deadlineId,
        'opensAt': opensAt,
        'closesAt': closesAt,
        'extendedClosesAt': extendedClosesAt,
        'status': status,
      };
}

class AssessmentDetailModel extends AssessmentDetail {
  const AssessmentDetailModel({
    required super.id,
    required super.type,
    required super.title,
    required super.description,
    required super.sections,
    required super.maxAttempts,
    required super.timeLimitSeconds,
    required super.deadline,
    required super.passed,
    required super.attemptsRemaining,
    super.questionCount,
    super.attemptsUsed,
    super.hasActiveAttempt,
    super.bestScorePercent,
    super.canStart,
    super.blockedReason,
  });

  factory AssessmentDetailModel.fromJson(Map<String, dynamic> json) {
    return AssessmentDetailModel(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      sections: (json['sections'] as List<dynamic>)
          .map((s) => AssessmentSectionModel.fromJson(s as Map<String, dynamic>))
          .toList(),
      maxAttempts: (json['maxAttempts'] as num).toInt(),
      timeLimitSeconds: json['timeLimitSeconds'] != null
          ? (json['timeLimitSeconds'] as num).toInt()
          : null,
      deadline: json['deadline'] != null
          ? AssessmentDeadlineModel.fromJson(
              json['deadline'] as Map<String, dynamic>)
          : null,
      questionCount: (json['questionCount'] as num?)?.toInt(),
      attemptsUsed: (json['attemptsUsed'] as num?)?.toInt() ?? 0,
      // Older backends don't send attemptsRemaining; their maxAttempts was the
      // only attempt figure they reported.
      attemptsRemaining: (json['attemptsRemaining'] as num?)?.toInt() ?? (json['maxAttempts'] as num).toInt(),
      hasActiveAttempt: json['hasActiveAttempt'] as bool? ?? false,
      passed: json['passed'] as bool? ?? false,
      bestScorePercent: (json['bestScorePercent'] as num?)?.toInt(),
      canStart: json['canStart'] as bool? ?? true,
      blockedReason: json['blockedReason'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'title': title,
        'description': description,
        'sections': sections
            .map((s) => (s as AssessmentSectionModel).toJson())
            .toList(),
        'maxAttempts': maxAttempts,
        'timeLimitSeconds': timeLimitSeconds,
        'questionCount': questionCount,
        'attemptsUsed': attemptsUsed,
        'attemptsRemaining': attemptsRemaining,
        'hasActiveAttempt': hasActiveAttempt,
        'passed': passed,
        'bestScorePercent': bestScorePercent,
        'canStart': canStart,
        'blockedReason': blockedReason,
        'deadline':
            deadline != null ? (deadline as AssessmentDeadlineModel).toJson() : null,
      };
}
