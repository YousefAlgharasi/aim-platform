// Phase 6 — P6-064
// LearningPathSkillState — domain entity for a full skill-state entry on the
// Learning Plan screen.
//
// All values are backend-computed.
// Flutter must never calculate, infer, or reorder these fields locally.

class LearningPathSkillState {
  const LearningPathSkillState({
    required this.skillId,
    required this.masteryScore,
    required this.masteryConfidence,
    required this.masteryTrend,
    this.previousMasteryScore,
    required this.lastAttemptId,
    required this.lastEvaluatedAt,
    required this.updatedAt,
  });

  final String skillId;
  final double masteryScore;
  final double masteryConfidence;
  final String masteryTrend;
  final double? previousMasteryScore;
  final String lastAttemptId;
  final String lastEvaluatedAt;
  final String updatedAt;
}
