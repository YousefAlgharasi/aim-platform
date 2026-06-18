// Phase 6 — P6-059
// HomeSkillStateModel — data-layer model for HomeSkillState.
//
// Parses the student-safe API response from
// GET /aim/students/:studentId/skill-states.
//
// Backend is the sole authority for [band] and [masteryLevel].
// Flutter must never compute or infer these fields locally.

import '../../logic/entity/home_skill_state.dart';

/// Data-layer model for [HomeSkillState].
/// Extends the entity so it can be used directly in domain logic.
class HomeSkillStateModel extends HomeSkillState {
  const HomeSkillStateModel({
    required super.topic,
    required super.band,
    required super.masteryLevel,
  });

  factory HomeSkillStateModel.fromJson(Map<String, dynamic> json) {
    return HomeSkillStateModel(
      topic: json['topic'] as String,
      band: json['band'] as String,
      masteryLevel: json['masteryLevel'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'topic': topic,
        'band': band,
        'masteryLevel': masteryLevel,
      };
}
