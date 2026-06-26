// Phase 6 — P6-064
// LearningPathWeaknessRecord — domain entity for a weakness detail entry on
// the Learning Plan screen.
//
// All values are backend-computed. Flutter must never compute or infer them.

class LearningPathWeaknessRecord {
  const LearningPathWeaknessRecord({
    required this.weaknessId,
    required this.skillId,
    required this.severity,
    required this.status,
    required this.triggerAttemptIds,
    required this.detectedAt,
    this.resolvedAt,
    required this.updatedAt,
  });

  final String weaknessId;
  final String skillId;
  final String severity;
  final String status;
  final List<String> triggerAttemptIds;
  final String detectedAt;
  final String? resolvedAt;
  final String updatedAt;
}
