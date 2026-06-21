// Phase 6 — P6-059
// HomeSkillState — domain entity for a student's AIM skill-state summary card.
//
// All values (band, masteryLevel) are backend-computed.
// Flutter must never calculate or infer these fields locally.

/// Domain entity representing a single skill-state entry
/// returned by GET /aim/students/:studentId/skill-states.
///
/// Backend is the sole authority for [band] and [masteryLevel].
/// Flutter renders these as-is; no local computation is permitted.
class HomeSkillState {
  const HomeSkillState({
    required this.topic,
    required this.band,
    required this.masteryLevel,
  });

  /// Subject / curriculum topic identifier (e.g. "algebra", "grammar").
  final String topic;

  /// AIM band label (e.g. "Developing", "Proficient"). Backend-computed.
  final String band;

  /// AIM mastery level value. Backend-computed.
  final String masteryLevel;
}
