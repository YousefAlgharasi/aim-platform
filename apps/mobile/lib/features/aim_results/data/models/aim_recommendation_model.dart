// Phase 6 — P6-094
// AimRecommendationModel — data-layer model for AimRecommendation.
//
// Parses RecommendationEntry items from RecommendationReadResponse
// (GET /aim/students/:studentId/recommendations).

import '../../logic/entity/aim_recommendation.dart';

class AimRecommendationModel extends AimRecommendation {
  const AimRecommendationModel({
    required super.id,
    required super.kind,
    required super.targetSkillId,
    required super.rank,
    required super.reason,
    required super.generatedAt,
    required super.status,
    required super.updatedAt,
    super.targetLessonId,
    super.basedOnWeaknessId,
    super.expiresAt,
  });

  factory AimRecommendationModel.fromJson(Map<String, dynamic> json) {
    return AimRecommendationModel(
      id: json['id'] as String,
      kind: json['kind'] as String,
      targetSkillId: json['targetSkillId'] as String,
      targetLessonId: json['targetLessonId'] as String?,
      rank: json['rank'] as int,
      reason: json['reason'] as String,
      basedOnWeaknessId: json['basedOnWeaknessId'] as String?,
      generatedAt: json['generatedAt'] as String,
      expiresAt: json['expiresAt'] as String?,
      status: json['status'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
