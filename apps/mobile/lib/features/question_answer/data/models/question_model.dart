// Phase 6 — P6-084
// QuestionModel — data-layer model for Question.
//
// Parses the student-facing question shape from
// GET /curriculum/questions/:id (QuestionBankDetail per P3-014).
//
// CRITICAL SECURITY RULES:
// - is_correct / correct_answer MUST NOT appear in the response parsed here.
// - Flutter NEVER calculates correctness from this model.
// - difficulty is stored verbatim — never used to compute scores.
// - explanation is stored verbatim — shown only after backend confirms attempt.

import 'answer_option_model.dart';
import '../../logic/entity/question.dart';

class QuestionModel extends Question {
  const QuestionModel({
    required super.id,
    required super.type,
    required super.stem,
    required super.difficulty,
    required super.options,
    super.richStem,
    super.hint,
    super.explanation,
    super.tags,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    final rawOptions = json['options'] as List<dynamic>? ?? [];
    final options = rawOptions
        .whereType<Map<String, dynamic>>()
        .map(AnswerOptionModel.fromJson)
        .toList();

    return QuestionModel(
      id: json['id'] as String,
      type: json['type'] as String,
      stem: json['stem'] as String,
      richStem: json['richStem'] as Map<String, dynamic>?,
      difficulty: json['difficulty'] as String,
      hint: json['hint'] as String?,
      explanation: json['explanation'] as String?,
      tags: (json['tags'] as List<dynamic>?)
              ?.whereType<String>()
              .toList() ??
          const [],
      options: options,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'stem': stem,
        'richStem': richStem,
        'difficulty': difficulty,
        'hint': hint,
        'explanation': explanation,
        'tags': tags,
        'options': (options as List<AnswerOptionModel>)
            .map((o) => o.toJson())
            .toList(),
      };
}
