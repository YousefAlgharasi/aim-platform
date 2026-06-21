// Phase 6 — P6-064
// LearningPathSkillStateModel — data-layer model for LearningPathSkillState.
//
// Parses the full API response from
// GET /aim/students/:studentId/skill-states (learning plan variant).
//
// Backend is the sole authority for [band], [masteryLevel], and
// [coveragePercent]. Flutter must never compute these fields locally.

import '../../logic/entity/learning_path_skill_state.dart';

/// Data-layer model for [LearningPathSkillState].
class LearningPathSkillStateModel extends LearningPathSkillState {
  const LearningPathSkillStateModel({
    required super.topic,
    required super.band,
    required super.masteryLevel,
    required super.coveragePercent,
  });

  factory LearningPathSkillStateModel.fromJson(Map<String, dynamic> json) {
    return LearningPathSkillStateModel(
      topic: json['topic'] as String,
      band: json['band'] as String,
      masteryLevel: json['masteryLevel'] as String,
      coveragePercent: (json['coveragePercent'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() => {
        'topic': topic,
        'band': band,
        'masteryLevel': masteryLevel,
        'coveragePercent': coveragePercent,
      };
}
