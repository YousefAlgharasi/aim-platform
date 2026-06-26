// Phase 6 — P6-064
// LearningPathSkillStateModel — data-layer model for LearningPathSkillState.
//
// Parses SkillStateEntry items from StudentSkillStateReadResponse
// (GET /aim/students/:studentId/skill-states).
//
// Backend is the sole authority for mastery values.
// Flutter must never compute these fields locally.

import '../../logic/entity/learning_path_skill_state.dart';

class LearningPathSkillStateModel extends LearningPathSkillState {
  const LearningPathSkillStateModel({
    required super.skillId,
    required super.masteryScore,
    required super.masteryConfidence,
    required super.masteryTrend,
    super.previousMasteryScore,
    required super.lastAttemptId,
    required super.lastEvaluatedAt,
    required super.updatedAt,
  });

  factory LearningPathSkillStateModel.fromJson(Map<String, dynamic> json) {
    return LearningPathSkillStateModel(
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
