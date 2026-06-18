// Phase 6 — P6-094
// AimSkillStateModel — data-layer model for AimSkillState.
//
// Parses SkillStateEntry items from StudentSkillStateReadResponse
// (GET /aim/students/:studentId/skill-states).

import '../../logic/entity/aim_skill_state.dart';

class AimSkillStateModel extends AimSkillState {
  const AimSkillStateModel({
    required super.skillId,
    required super.masteryScore,
    required super.masteryConfidence,
    required super.masteryTrend,
    required super.lastAttemptId,
    required super.lastEvaluatedAt,
    required super.updatedAt,
    super.previousMasteryScore,
  });

  factory AimSkillStateModel.fromJson(Map<String, dynamic> json) {
    return AimSkillStateModel(
      skillId: json['skillId'] as String,
      masteryScore: (json['masteryScore'] as num).toDouble(),
      masteryConfidence: (json['masteryConfidence'] as num).toDouble(),
      masteryTrend: json['masteryTrend'] as String,
      previousMasteryScore:
          (json['previousMasteryScore'] as num?)?.toDouble(),
      lastAttemptId: json['lastAttemptId'] as String,
      lastEvaluatedAt: json['lastEvaluatedAt'] as String,
      updatedAt: json['updatedAt'] as String,
    );
  }
}
