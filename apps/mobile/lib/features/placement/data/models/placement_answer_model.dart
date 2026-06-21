import '../../logic/entity/placement_answer.dart';

/// Data-layer model for [PlacementAnswer].
/// Parses the student-safe API response shape from POST /placement/answers.
///
/// Note: is_correct and skill_code are never included in the student response.
class PlacementAnswerModel extends PlacementAnswer {
  const PlacementAnswerModel({
    required super.id,
    required super.placementAttemptId,
    required super.placementQuestionId,
    required super.answerValue,
    required super.createdAt,
  });

  factory PlacementAnswerModel.fromJson(Map<String, dynamic> json) {
    return PlacementAnswerModel(
      id: json['id'] as String,
      placementAttemptId: json['placement_attempt_id'] as String,
      placementQuestionId: json['placement_question_id'] as String,
      answerValue: json['answer_value'] as String,
      createdAt: json['created_at'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'placement_attempt_id': placementAttemptId,
        'placement_question_id': placementQuestionId,
        'answer_value': answerValue,
        'created_at': createdAt,
      };
}
