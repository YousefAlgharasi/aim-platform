// P4-052: Response model for POST /placement/attempts/:id/answers/speaking.

class PlacementSpeakingAnswerModel {
  const PlacementSpeakingAnswerModel({
    required this.id,
    required this.placementAttemptId,
    required this.placementQuestionId,
    required this.transcript,
    required this.createdAt,
  });

  final String id;
  final String placementAttemptId;
  final String placementQuestionId;
  final String transcript;
  final String createdAt;

  factory PlacementSpeakingAnswerModel.fromJson(Map<String, dynamic> json) {
    return PlacementSpeakingAnswerModel(
      id: json['id'] as String,
      placementAttemptId: json['placement_attempt_id'] as String,
      placementQuestionId: json['placement_question_id'] as String,
      transcript: json['transcript'] as String? ?? '',
      createdAt: json['created_at'] as String,
    );
  }
}
