// Phase 6 — P6-084
// AnswerOptionModel — data-layer model for AnswerOption.
//
// Parses the student-facing choice shape from the backend.
//
// CRITICAL: is_correct MUST NOT be present in the JSON sent to Flutter.
// The backend is responsible for stripping is_correct before sending.
// This model has no isCorrect field by design.

import '../../logic/entity/answer_option.dart';

class AnswerOptionModel extends AnswerOption {
  const AnswerOptionModel({
    required super.id,
    required super.text,
    required super.order,
    super.richText,
  });

  factory AnswerOptionModel.fromJson(Map<String, dynamic> json) {
    return AnswerOptionModel(
      id: json['id'] as String,
      text: json['text'] as String,
      order: (json['order'] as num).toInt(),
      richText: json['richText'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'text': text,
        'order': order,
        'richText': richText,
      };
}
