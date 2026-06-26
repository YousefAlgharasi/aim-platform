// Phase 6 — P6-059
// HomeSkillState — domain entity for a student's AIM skill-state summary card.
//
// All values are backend-computed.
// Flutter must never calculate or infer these fields locally.

class HomeSkillState {
  const HomeSkillState({
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
