// AttemptQuestionModel — data-layer model for AttemptQuestion.
// Parses GET /student/assessments/attempts/:attemptId/questions items.

import '../../logic/entity/attempt_question.dart';

class AttemptQuestionOptionModel extends AttemptQuestionOption {
  const AttemptQuestionOptionModel({
    required super.id,
    required super.label,
    required super.text,
  });

  factory AttemptQuestionOptionModel.fromJson(Map<String, dynamic> json) {
    return AttemptQuestionOptionModel(
      id: json['id'] as String,
      label: json['label'] as String,
      text: json['text'] as String,
    );
  }
}

class AttemptQuestionModel extends AttemptQuestion {
  const AttemptQuestionModel({
    required super.id,
    required super.assessmentQuestionLinkId,
    required super.sectionId,
    required super.order,
    required super.type,
    required super.prompt,
    required super.options,
  });

  factory AttemptQuestionModel.fromJson(Map<String, dynamic> json) {
    final rawOptions = json['options'];
    return AttemptQuestionModel(
      id: json['id'] as String,
      assessmentQuestionLinkId: json['assessmentQuestionLinkId'] as String,
      sectionId: json['sectionId'] as String?,
      order: (json['order'] as num).toInt(),
      type: json['type'] as String,
      prompt: json['prompt'] as String,
      options: rawOptions is List
          ? rawOptions
              .whereType<Map<String, dynamic>>()
              .map(AttemptQuestionOptionModel.fromJson)
              .toList()
          : const [],
    );
  }
}
