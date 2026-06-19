// Phase 6 — P6-059
// HomeRecommendationModel — data-layer model for HomeRecommendation.
//
// Parses the student-safe API response from
// GET /aim/students/:studentId/recommendations.
//
// All recommendation content ([action], [reason]) is backend-computed.
// Flutter must never generate or rewrite recommendation content locally.

import '../../logic/entity/home_recommendation.dart';

/// Data-layer model for [HomeRecommendation].
class HomeRecommendationModel extends HomeRecommendation {
  const HomeRecommendationModel({
    required super.topic,
    required super.action,
    required super.reason,
  });

  factory HomeRecommendationModel.fromJson(Map<String, dynamic> json) {
    return HomeRecommendationModel(
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
