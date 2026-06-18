// Phase 6 — P6-094
// AimSkillState — read-only entity for a backend-persisted AIM skill state.
//
// Mirrors SkillStateEntry (student-skill-state-read.service.ts).
// All fields are AIM Engine outputs persisted by the backend.
// Flutter NEVER computes masteryScore, masteryTrend, or any mastery value.

class AimSkillState {
  const AimSkillState({
    required this.skillId,
    required this.masteryScore,
    required this.masteryConfidence,
    required this.masteryTrend,
    required this.lastAttemptId,
    required this.lastEvaluatedAt,
    required this.updatedAt,
    this.previousMasteryScore,
  });

  final String skillId;

  /// AIM Engine mastery estimate 0.00–1.00. Backend-computed; never modified.
  final double masteryScore;

  /// AIM Engine confidence in masteryScore 0.00–1.00. Display hint only.
  final double masteryConfidence;

  /// Directional trend: 'improving' | 'stable' | 'declining' |
  /// 'insufficient_data'. AIM Engine output; displayed verbatim.
  final String masteryTrend;

  /// Prior mastery score before this evaluation. May be null for first eval.
  final double? previousMasteryScore;

  final String lastAttemptId;
  final String lastEvaluatedAt;
  final String updatedAt;
}
