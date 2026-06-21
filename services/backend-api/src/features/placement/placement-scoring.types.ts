// Phase 4 — P4-045
// Placement scoring types.
//
// Scope: Placement Test scoring only.
//
// Security rules:
//   - correctnessRatio, correctCount, totalAnswered, lowCoverage, and skillKey
//     are INTERNAL — never returned to Flutter or any client.
//   - Flutter receives only: skillId, skillName, signal (per P4-032 §9.2).
//   - No AIM Engine runtime, lesson scoring, AI Teacher, or progress data here.

// ---------------------------------------------------------------------------
// Internal scoring types (backend-only — never sent to clients)
// ---------------------------------------------------------------------------

/** Per-skill score record produced by PlacementScoringService. Internal only. */
export interface SkillScore {
  readonly skillId: string;
  readonly skillKey: string;
  readonly skillName: string;
  readonly correctCount: number;
  readonly totalAnswered: number;
  /** correct_count / total_answered. 0.0 if totalAnswered === 0. */
  readonly correctnessRatio: number;
  /** strong / developing / emerging — per P4-032 §4.2. */
  readonly signal: 'strong' | 'developing' | 'emerging';
  /** True if totalAnswered < 2 — low confidence signal. */
  readonly lowCoverage: boolean;
}

/** Per-section mastery record. Internal only. */
export interface SectionScore {
  readonly skillCode: string;
  readonly correctAnswers: number;
  readonly totalQuestions: number;
  /** correctAnswers / totalQuestions. Range 0.0–1.0. */
  readonly masteryScore: number;
  /** True if masteryScore < section weakness threshold (P4-031 §3). */
  readonly isWeakness: boolean;
  /** threshold - masteryScore. Used for weakness ranking. */
  readonly weaknessGap: number;
}

/**
 * Full scoring result produced by PlacementScoringService for a completed attempt.
 * Consumed by P4-046 (PlacementResultService) to write placement_results row.
 * NEVER returned directly to Flutter.
 */
export interface PlacementScoringResult {
  /** Weighted overall score 0.0–1.0 (P4-031 §4). Backend-internal — never sent to clients. */
  readonly overallScore: number;
  /** Estimated CEFR level (P4-031 §5). Stored in placement_results.estimated_level. */
  readonly estimatedLevel: 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';
  /** Per-section mastery scores. Internal only. */
  readonly sectionScores: SectionScore[];
  /** Per-skill scores. Internal only. Raw fields stripped before Flutter response. */
  readonly skillScores: SkillScore[];
  /**
   * Ranked weakness map entries (P4-033).
   * Stored as JSONB in placement_results.weakness_map.
   * Only { skillCode, skillName, priority, signal } exposed to Flutter via result API.
   */
  readonly weaknessMap: WeaknessMapEntry[];
  /** skill_mastery_map JSONB for placement_results. Flutter sees only skillId/skillName/signal. */
  readonly skillMasteryMap: SkillMasteryMapEntry[];
}

/** One entry in the weakness map (P4-033). */
export interface WeaknessMapEntry {
  /** 1-based rank — lower = higher priority weakness. */
  readonly priority: number;
  readonly skillCode: string;
  readonly skillName: string;
  readonly signal: 'developing' | 'emerging';
  readonly masteryScore: number;
  readonly lowCoverage: boolean;
}

/**
 * One entry in skill_mastery_map stored on placement_results.
 * Flutter-safe fields: skillId, skillName, signal.
 * Internal fields: correctCount, totalAnswered, correctnessRatio, lowCoverage, skillKey.
 */
export interface SkillMasteryMapEntry {
  readonly skillId: string;
  readonly skillKey: string;
  readonly skillName: string;
  readonly signal: 'strong' | 'developing' | 'emerging';
  /** Internal — never sent to Flutter. */
  readonly correctCount: number;
  /** Internal — never sent to Flutter. */
  readonly totalAnswered: number;
  /** Internal — never sent to Flutter. */
  readonly correctnessRatio: number;
  /** Internal — never sent to Flutter. */
  readonly lowCoverage: boolean;
}
