// Phase 6 — P6-064
// LearningPathRecommendation — domain entity for a recommendation entry on
// the Learning Plan screen.
//
// Same shape as HomeRecommendation. Kept as a separate entity so the
// learning_path feature is self-contained and does not create a hard import
// dependency on the home feature's logic layer.
//
// All recommendation content ([action], [reason]) is backend-computed.
// Flutter must never generate or rewrite recommendation content locally.

/// Domain entity representing a single recommendation entry from
/// GET /aim/students/:studentId/recommendations.
///
/// Backend is the sole authority for [action] and [reason].
class LearningPathRecommendation {
  const LearningPathRecommendation({
    required this.topic,
    required this.action,
    required this.reason,
  });

  /// Subject / curriculum topic identifier.
  final String topic;

  /// AIM-recommended action (e.g. "review", "practice"). Backend-computed.
  final String action;

  /// Human-readable reason for the recommendation. Backend-computed.
  final String reason;
}
