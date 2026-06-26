// Phase 6 — P6-059
// HomeRecommendation — domain entity for an AIM recommendation card.
//
// All recommendation content is backend-computed.
// Flutter must never generate or rewrite recommendation content locally.

class HomeRecommendation {
  const HomeRecommendation({
    required this.id,
    required this.kind,
    required this.targetSkillId,
    this.targetLessonId,
    required this.rank,
    required this.reason,
    this.basedOnWeaknessId,
    required this.generatedAt,
    this.expiresAt,
    required this.status,
    required this.updatedAt,
  });

  final String id;
  final String kind;
  final String targetSkillId;
  final String? targetLessonId;
  final int rank;
  final String reason;
  final String? basedOnWeaknessId;
  final String generatedAt;
  final String? expiresAt;
  final String status;
  final String updatedAt;
}
