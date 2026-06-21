// Phase 6 — P6-094
// AimRecommendation — read-only entity for a backend-persisted AIM
// recommendation.
//
// Mirrors RecommendationEntry (recommendation-read.service.ts).
// All content is AIM Engine output. Flutter never generates or rewrites it.

class AimRecommendation {
  const AimRecommendation({
    required this.id,
    required this.kind,
    required this.targetSkillId,
    required this.rank,
    required this.reason,
    required this.generatedAt,
    required this.status,
    required this.updatedAt,
    this.targetLessonId,
    this.basedOnWeaknessId,
    this.expiresAt,
  });

  final String id;

  /// 'lesson' | 'targeted_practice' | 'review_session'. AIM Engine output.
  final String kind;

  final String targetSkillId;
  final String? targetLessonId;

  /// Backend rank (1 = top). Flutter renders in received order; never re-ranks.
  final int rank;

  /// AIM Engine reason string. Displayed verbatim.
  final String reason;

  final String? basedOnWeaknessId;
  final String generatedAt;
  final String? expiresAt;
  final String status;
  final String updatedAt;
}
