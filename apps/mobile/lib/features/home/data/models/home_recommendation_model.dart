// Phase 6 — P6-059
// HomeRecommendationModel — data-layer model for HomeRecommendation.
//
// Parses RecommendationEntry items from RecommendationReadResponse
// (GET /aim/students/:studentId/recommendations).
//
// All recommendation content is backend-computed.
// Flutter must never generate or rewrite recommendation content locally.

import '../../logic/entity/home_recommendation.dart';

class HomeRecommendationModel extends HomeRecommendation {
  const HomeRecommendationModel({
    required super.id,
    required super.kind,
    required super.targetSkillId,
    super.targetLessonId,
    required super.rank,
    required super.reason,
    super.basedOnWeaknessId,
    required super.generatedAt,
    super.expiresAt,
    required super.status,
    required super.updatedAt,
  });

  factory HomeRecommendationModel.fromJson(Map<String, dynamic> json) {
    return HomeRecommendationModel(
      id: json['id'] as String,
      kind: json['kind'] as String,
      targetSkillId: json['targetSkillId'] as String,
      targetLessonId: json['targetLessonId'] as String?,
      rank: (json['rank'] as num).toInt(),
      reason: json['reason'] as String,
      basedOnWeaknessId: json['basedOnWeaknessId'] as String?,
      generatedAt: json['generatedAt'] as String,
      expiresAt: json['expiresAt'] as String?,
      status: json['status'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
