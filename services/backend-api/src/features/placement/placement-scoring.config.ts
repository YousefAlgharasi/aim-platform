// Placement scoring constants extracted from PlacementScoringService (P19-002).
//
// These remain backend-only config — NOT stored in DB, NOT exposed via any API.
// See placement-scoring.service.ts security rules.

export const PlacementScoringConfig = {
  /** Section weights per P4-031 §2. Must sum to 1.0. */
  sectionWeights: {
    grammar: 0.30,
    vocabulary: 0.30,
    reading: 0.25,
    listening: 0.15,
  } as Record<string, number>,

  /** Section weakness thresholds per P4-031 §3. */
  sectionWeaknessThresholds: {
    grammar: 0.60,
    vocabulary: 0.60,
    reading: 0.55,
    listening: 0.55,
  } as Record<string, number>,

  /** Skill signal thresholds per P4-032 §4.2. */
  signalThresholds: {
    strong: 0.75,
    developing: 0.40,
  },

  /** Level thresholds per P4-031 §5. Evaluated highest-first. */
  levelThresholds: [
    { min: 0.85, level: 'advanced' },
    { min: 0.70, level: 'upper_intermediate' },
    { min: 0.55, level: 'intermediate' },
    { min: 0.40, level: 'elementary' },
    { min: 0.00, level: 'beginner' },
  ] as const,
} as const;
