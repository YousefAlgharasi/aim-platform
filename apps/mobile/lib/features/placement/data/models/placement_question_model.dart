import '../../logic/entity/placement_question.dart';

/// Data-layer model for [PlacementQuestion].
/// Parses the student-safe API response shape from
/// GET /placement/active/sections/:id/questions.
class PlacementQuestionModel extends PlacementQuestion {
  const PlacementQuestionModel({
    required super.id,
    required super.questionType,
    required super.prompt,
    super.mediaUrl,
    required super.orderIndex,
    required super.skillCode,
  });

  factory PlacementQuestionModel.fromJson(Map<String, dynamic> json) {
    return PlacementQuestionModel(
      id: json['id'] as String,
      questionType: json['question_type'] as String,
      prompt: json['prompt'] as String,
      mediaUrl: json['media_url'] as String?,
      orderIndex: json['order_index'] as int,
      skillCode: json['skill_code'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'question_type': questionType,
        'prompt': prompt,
        'media_url': mediaUrl,
        'order_index': orderIndex,
        'skill_code': skillCode,
      };
}
