// Phase 6 — P6-059
// HomeWeaknessRecord — domain entity for a student's weakness entry.
//
// All values are backend-computed. Flutter must never compute or infer them.

class HomeWeaknessRecord {
  const HomeWeaknessRecord({
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
