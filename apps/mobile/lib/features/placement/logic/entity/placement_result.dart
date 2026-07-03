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
    this.recommendedCourseId,
    this.unlockedCourseIds = const [],
    this.note,
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

  /// The course whose cefr_rank matches estimatedLevel (P20-014). Backend-
  /// computed — never chosen by Flutter. Null if no course is available yet
  /// for this level (see [note]).
  final String? recommendedCourseId;

  /// Every course id currently unlocked for the student (cefr_rank <=
  /// their max_unlocked_cefr_rank). Backend-computed — never derived by
  /// Flutter from estimatedLevel.
  final List<String> unlockedCourseIds;

  /// Explanatory note when recommendedCourseId falls back to a
  /// lower/different rank than the exact estimated level (e.g. no course
  /// exists yet at that level). Null when the exact-rank course was found.
  final String? note;

  // Note: student_id is intentionally excluded — internal field.
}
