// Phase 6 — P6-064
// LearningPathSkillState — domain entity for a full skill-state entry on the
// Learning Plan screen.
//
// This is the full payload variant of the skill-state (vs. the summary card
// used on Home). It includes [coveragePercent] which the home variant omits.
//
// All values (band, masteryLevel, coveragePercent) are backend-computed.
// Flutter must never calculate, infer, or reorder these fields locally.

/// Domain entity representing a single skill-state entry from
/// GET /aim/students/:studentId/skill-states (full payload).
///
/// Backend is the sole authority for [band], [masteryLevel], and
/// [coveragePercent].
class LearningPathSkillState {
  const LearningPathSkillState({
    required this.topic,
    required this.band,
    required this.masteryLevel,
    required this.coveragePercent,
  });

  /// Subject / curriculum topic identifier (e.g. "algebra", "grammar").
  final String topic;

  /// AIM band label (e.g. "Developing", "Proficient"). Backend-computed.
  final String band;

  /// AIM mastery level value. Backend-computed.
  final String masteryLevel;

  /// Percentage of the topic covered so far. Backend-computed.
  final double coveragePercent;
}
