// Phase 6 — P6-064
// LearningPathRecommendationModel — data-layer model for
// LearningPathRecommendation.
//
// Parses the API response from
// GET /aim/students/:studentId/recommendations.
//
// All recommendation content ([action], [reason]) is backend-computed.
// Flutter must never generate or rewrite recommendation content locally.

import '../../logic/entity/learning_path_recommendation.dart';

/// Data-layer model for [LearningPathRecommendation].
class LearningPathRecommendationModel extends LearningPathRecommendation {
  const LearningPathRecommendationModel({
    required super.topic,
    required super.action,
    required super.reason,
  });

  factory LearningPathRecommendationModel.fromJson(
      Map<String, dynamic> json) {
    return LearningPathRecommendationModel(
      topic: json['topic'] as String,
      action: json['action'] as String,
      reason: json['reason'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'topic': topic,
        'action': action,
        'reason': reason,
      };
}
