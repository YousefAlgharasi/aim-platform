/// Mastery data for a single skill code.
///
/// Computed by backend — Flutter must never calculate or infer mastery scores.
/// Scope: Phase 4 — Placement Test only.
///
/// P4-070 fix: [signal] is required and must come from the backend response.
/// Flutter must NEVER derive signal from masteryScore locally.
/// Threshold constants (0.75, 0.40, etc.) are backend config — never Flutter config.
class PlacementSkillMastery {
  const PlacementSkillMastery({
    required this.skillCode,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.masteryScore,
    required this.signal,
  });

  /// One of: grammar, vocabulary, reading, listening.
  final String skillCode;

  /// Total questions answered for this skill.
  final int totalQuestions;

  /// Number of correct answers for this skill.
  /// Populated only after attempt completion — always 0 during attempt.
  final int correctAnswers;

  /// Percentage correct (0.0 to 1.0). Backend-computed — never inferred by Flutter.
  final double masteryScore;

  /// Qualitative signal: 'strong', 'developing', or 'emerging'.
  /// Backend-computed — Flutter must NEVER derive this from masteryScore locally.
  /// Signal thresholds are backend config and must not appear in Flutter code.
  final String signal;
}

/// A single skill weakness entry from the backend weakness map.
///
/// Computed by backend — Flutter must never calculate or infer weaknesses.
/// Scope: Phase 4 — Placement Test only.
class PlacementWeakness {
  const PlacementWeakness({
    required this.skillCode,
    required this.masteryScore,
    required this.priority,
    this.signal,
  });

  /// One of: grammar, vocabulary, reading, listening.
  final String skillCode;

  /// Score below the weakness threshold. Backend-computed.
  final double masteryScore;

  /// Priority rank (1 = highest priority weakness).
  final int priority;

  /// 'developing' or 'emerging'. Backend-computed — never derived locally.
  final String? signal;
}
