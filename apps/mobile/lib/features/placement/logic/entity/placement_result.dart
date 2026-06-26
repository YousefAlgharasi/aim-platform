import 'placement_skill_mastery.dart';

/// Domain entity for a placement test result (student-safe fields only).
///
/// All scoring fields are backend-computed. Flutter must never calculate
/// or infer estimated_level, skill_mastery_map, weakness_map, or initial_path_id.
/// Flutter retrieves this only after attempt status = completed.
///
/// Scope: Phase 4 — Placement Test only.
class PlacementResult {
  const PlacementResult({
    required this.id,
    required this.placementAttemptId,
    required this.estimatedLevel,
    required this.skillMasteryMap,
    required this.weaknesses,
    required this.initialPathId,
    required this.createdAt,
  });

  /// Backend-generated UUID.
  final String id;

  /// Foreign key to placement_attempts.
  final String placementAttemptId;

  /// One of: beginner, elementary, intermediate, upper_intermediate, advanced.
  /// Computed by backend — never set or inferred by Flutter.
  final String estimatedLevel;

  /// Per-skill mastery data. Computed by backend — never calculated by Flutter.
  final Map<String, PlacementSkillMastery> skillMasteryMap;

  /// Ordered list of skill weaknesses. Computed by backend.
  final List<PlacementWeakness> weaknesses;

  /// Assigned by backend based on estimatedLevel and weaknesses.
  /// Flutter must not select or override this. Null when no path assigned yet.
  final String? initialPathId;

  /// Set by backend on result creation.
  final String createdAt;

  // Note: student_id is intentionally excluded — internal field.
}
