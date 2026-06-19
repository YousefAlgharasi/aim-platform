// Phase 6 — P6-059
// HomeRecommendation — domain entity for an AIM recommendation card on the
// home screen.
//
// All recommendation logic (topic selection, action, reason) is
// backend-computed. Flutter must never generate or rewrite recommendation
// content locally.

/// Domain entity representing a single recommendation entry
/// returned by GET /aim/students/:studentId/recommendations.
///
/// Backend is the sole authority for [action] and [reason].
class HomeRecommendation {
  const HomeRecommendation({
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
