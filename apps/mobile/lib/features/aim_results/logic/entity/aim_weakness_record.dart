// Phase 6 — P6-094
// AimWeaknessRecord — read-only entity for a backend-persisted AIM weakness.
//
// Mirrors WeaknessRecordEntry (weakness-records-read.service.ts).
// severity and status are AIM Engine outputs. Flutter never derives them.

class AimWeaknessRecord {
  const AimWeaknessRecord({
    required this.weaknessId,
    required this.skillId,
    required this.severity,
    required this.status,
    required this.triggerAttemptIds,
    required this.detectedAt,
    required this.updatedAt,
    this.resolvedAt,
  });

  final String weaknessId;
  final String skillId;

  /// AIM Engine severity: 'high' | 'medium' | 'low'. Display only.
  final String severity;

  /// Lifecycle status: 'open' | 'improving' | 'resolved'. Display only.
  final String status;

  final List<String> triggerAttemptIds;
  final String detectedAt;
  final String? resolvedAt;
  final String updatedAt;
}
