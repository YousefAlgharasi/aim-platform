// Phase 6 — P6-064
// LearningPathWeaknessRecord — domain entity for a weakness detail entry on
// the Learning Plan screen.
//
// This is the full payload variant (vs. Home's HomeWeaknessRecord). It includes
// [recommendedFocus] which the home variant omits.
//
// [severity] and [recommendedFocus] are backend-computed AIM outputs.
// Flutter must never compute, infer, or reorder weakness records locally.

/// Domain entity representing a single weakness-record entry from
/// GET /aim/students/:studentId/weakness-records (full payload).
///
/// Backend is the sole authority for [severity] and [recommendedFocus].
class LearningPathWeaknessRecord {
  const LearningPathWeaknessRecord({
    required this.topic,
    required this.severity,
    required this.recommendedFocus,
  });

  /// Subject / curriculum topic identifier.
  final String topic;

  /// AIM weakness severity (e.g. "high", "medium", "low"). Backend-computed.
  final String severity;

  /// AIM-recommended focus area for this weakness. Backend-computed.
  final String recommendedFocus;
}
