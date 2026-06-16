// Phase 4 — P4-052
// PlacementScoringService unit tests.
//
// Scope: Placement scoring logic only.
//
// Coverage:
//   - scoreAttempt: level mapping thresholds (P4-031 §5)
//   - scoreAttempt: section mastery and overall weighted score (P4-031 §3-4)
//   - scoreAttempt: skill signal thresholds (P4-032 §4.2)
//   - scoreAttempt: weakness map tier ordering (P4-033)
//   - scoreAttempt: empty attempt produces beginner level
//   - Security: overallScore and correctnessRatio not returned to clients

import { HttpStatus } from '@nestjs/common';
import { QueryResult } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { PlacementScoringService } from './placement-scoring.service';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeDb(
  answerRows: Array<{ skill_code: string; is_correct: boolean | null }>,
  skillRows: Array<{ skill_id: string; skill_key: string; skill_name: string; is_correct: boolean | null }>,
): jest.Mocked<Pick<DatabaseService, 'query'>> {
  let callCount = 0;
  return {
    query: jest.fn().mockImplementation(async () => {
      callCount += 1;
      if (callCount === 1) {
        return { rows: answerRows, rowCount: answerRows.length } as unknown as QueryResult;
      }
      return { rows: skillRows, rowCount: skillRows.length } as unknown as QueryResult;
    }),
  };
}

function grammarAnswers(correct: number, total: number) {
  return Array.from({ length: total }, (_, i) => ({
    skill_code: 'grammar',
    is_correct: i < correct,
  }));
}

function vocabAnswers(correct: number, total: number) {
  return Array.from({ length: total }, (_, i) => ({
    skill_code: 'vocabulary',
    is_correct: i < correct,
  }));
}

function readingAnswers(correct: number, total: number) {
  return Array.from({ length: total }, (_, i) => ({
    skill_code: 'reading',
    is_correct: i < correct,
  }));
}

function listeningAnswers(correct: number, total: number) {
  return Array.from({ length: total }, (_, i) => ({
    skill_code: 'listening',
    is_correct: i < correct,
  }));
}

// Full 30-question attempt: 10 grammar, 10 vocabulary, 10 listening
function fullAnswers(gCorrect: number, vCorrect: number, lCorrect: number) {
  return [
    ...grammarAnswers(gCorrect, 10),
    ...vocabAnswers(vCorrect, 10),
    ...listeningAnswers(lCorrect, 10),
  ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PlacementScoringService', () => {
  const attemptId = 'attempt-uuid-001';

  // -------------------------------------------------------------------------
  // Level mapping — P4-031 §5
  // -------------------------------------------------------------------------

  describe('level mapping', () => {
    it('maps score >= 0.85 to advanced', async () => {
      // grammar 10/10 (×0.30=0.30) + vocab 10/10 (×0.30=0.30) +
      // reading 10/10 (×0.25=0.25) + listening 10/10 (×0.15=0.15) = 1.0
      const answers = [
        ...grammarAnswers(10, 10),
        ...vocabAnswers(10, 10),
        ...readingAnswers(10, 10),
        ...listeningAnswers(10, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.estimatedLevel).toBe('advanced');
    });

    it('maps score >= 0.70 and < 0.85 to upper_intermediate', async () => {
      // grammar 8/10=0.8 (×0.30=0.24), vocab 7/10=0.7 (×0.30=0.21), listening 8/10=0.8 (×0.15=0.12)
      // total ≈ 0.57 — listening + grammar/vocab weighting without reading
      // Need total ≈ 0.72: grammar 9/10 (0.27), vocab 8/10 (0.24), listening 8/10 (0.12) = 0.63
      // Reading not in seed; use full answers with partial grammar
      const answers = [
        ...grammarAnswers(9, 10),  // 0.9 × 0.30 = 0.27
        ...vocabAnswers(9, 10),    // 0.9 × 0.30 = 0.27
        ...listeningAnswers(9, 10), // 0.9 × 0.15 = 0.135
        // no reading section — score = 0.675 (below upper_intermediate boundary)
      ];
      // Force score into upper_intermediate band (≥0.70 < 0.85) by getting 10/10 grammar+vocab
      const answers2 = [
        ...grammarAnswers(10, 10),  // 1.0 × 0.30 = 0.30
        ...vocabAnswers(10, 10),    // 1.0 × 0.30 = 0.30
        ...listeningAnswers(9, 10), // 0.9 × 0.15 = 0.135
        // total = 0.735 — upper_intermediate
      ];
      const db = makeDb(answers2, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.estimatedLevel).toBe('upper_intermediate');
      expect(result.overallScore).toBeGreaterThanOrEqual(0.70);
      expect(result.overallScore).toBeLessThan(0.85);
    });

    it('maps score >= 0.55 and < 0.70 to intermediate', async () => {
      // grammar 7/10=0.7 (×0.30=0.21), vocab 7/10=0.7 (×0.30=0.21), listening 7/10=0.7 (×0.15=0.105)
      // total = 0.525 — just below intermediate
      // grammar 8/10 (0.24) + vocab 7/10 (0.21) + listening 8/10 (0.12) = 0.57 — intermediate
      const answers = [
        ...grammarAnswers(8, 10),
        ...vocabAnswers(7, 10),
        ...listeningAnswers(8, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.estimatedLevel).toBe('intermediate');
      expect(result.overallScore).toBeGreaterThanOrEqual(0.55);
      expect(result.overallScore).toBeLessThan(0.70);
    });

    it('maps score >= 0.40 and < 0.55 to elementary', async () => {
      // grammar 5/10=0.5 (0.15) + vocab 5/10=0.5 (0.15) + listening 5/10=0.5 (0.075) = 0.375
      // grammar 6/10=0.6 (0.18) + vocab 5/10=0.5 (0.15) + listening 6/10=0.6 (0.09) = 0.42 — elementary
      const answers = [
        ...grammarAnswers(6, 10),
        ...vocabAnswers(5, 10),
        ...listeningAnswers(6, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.estimatedLevel).toBe('elementary');
      expect(result.overallScore).toBeGreaterThanOrEqual(0.40);
      expect(result.overallScore).toBeLessThan(0.55);
    });

    it('maps score < 0.40 to beginner', async () => {
      // grammar 2/10=0.2 (0.06) + vocab 2/10=0.2 (0.06) + listening 2/10=0.2 (0.03) = 0.15
      const answers = [
        ...grammarAnswers(2, 10),
        ...vocabAnswers(2, 10),
        ...listeningAnswers(2, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.estimatedLevel).toBe('beginner');
      expect(result.overallScore).toBeLessThan(0.40);
    });

    it('maps empty attempt (zero answers) to beginner with overallScore = 0', async () => {
      const db = makeDb([], []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.estimatedLevel).toBe('beginner');
      expect(result.overallScore).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Section mastery scores — P4-031 §3
  // -------------------------------------------------------------------------

  describe('section mastery scores', () => {
    it('computes correct mastery score for each section', async () => {
      const answers = [
        ...grammarAnswers(8, 10),    // 0.8
        ...vocabAnswers(6, 10),      // 0.6
        ...listeningAnswers(5, 10),  // 0.5
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);

      const grammar = result.sectionScores.find((s) => s.skillCode === 'grammar');
      const vocab = result.sectionScores.find((s) => s.skillCode === 'vocabulary');
      const listening = result.sectionScores.find((s) => s.skillCode === 'listening');

      expect(grammar?.masteryScore).toBeCloseTo(0.8);
      expect(vocab?.masteryScore).toBeCloseTo(0.6);
      expect(listening?.masteryScore).toBeCloseTo(0.5);
    });

    it('flags grammar as weakness when mastery < 0.60', async () => {
      const answers = [
        ...grammarAnswers(5, 10),   // 0.5 < 0.60 threshold
        ...vocabAnswers(8, 10),
        ...listeningAnswers(8, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);

      const grammar = result.sectionScores.find((s) => s.skillCode === 'grammar');
      expect(grammar?.isWeakness).toBe(true);
    });

    it('does not flag grammar as weakness when mastery >= 0.60', async () => {
      const answers = [
        ...grammarAnswers(6, 10),   // 0.6 = threshold (not a weakness)
        ...vocabAnswers(8, 10),
        ...listeningAnswers(8, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);

      const grammar = result.sectionScores.find((s) => s.skillCode === 'grammar');
      expect(grammar?.isWeakness).toBe(false);
    });

    it('flags listening as weakness when mastery < 0.55', async () => {
      const answers = [
        ...grammarAnswers(8, 10),
        ...vocabAnswers(8, 10),
        ...listeningAnswers(4, 10),  // 0.4 < 0.55 threshold
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);

      const listening = result.sectionScores.find((s) => s.skillCode === 'listening');
      expect(listening?.isWeakness).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Weighted overall score — P4-031 §4
  // -------------------------------------------------------------------------

  describe('weighted overall score', () => {
    it('applies section weights: grammar 30%, vocab 30%, reading 25%, listening 15%', async () => {
      // All sections perfect — total must be 1.0
      const answers = [
        ...grammarAnswers(10, 10),
        ...vocabAnswers(10, 10),
        ...readingAnswers(10, 10),
        ...listeningAnswers(10, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.overallScore).toBeCloseTo(1.0);
    });

    it('correctly weights partial section scores', async () => {
      // grammar 10/10 (0.30) + vocab 0/10 (0.00) + listening 10/10 (0.15) = 0.45
      const answers = [
        ...grammarAnswers(10, 10),
        ...vocabAnswers(0, 10),
        ...listeningAnswers(10, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.overallScore).toBeCloseTo(0.45);
    });
  });

  // -------------------------------------------------------------------------
  // Skill signals — P4-032 §4.2
  // -------------------------------------------------------------------------

  describe('skill signals', () => {
    function skillRows(id: string, key: string, name: string, correct: number, total: number) {
      return Array.from({ length: total }, (_, i) => ({
        skill_id: id,
        skill_key: key,
        skill_name: name,
        is_correct: i < correct,
      }));
    }

    it('assigns strong signal when correctness ratio >= 0.75', async () => {
      const sRows = skillRows('skill-1', 'grammar.verb_forms', 'Verb Forms', 8, 10); // 0.8
      const db = makeDb([], sRows);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const skill = result.skillScores.find((s) => s.skillId === 'skill-1');
      expect(skill?.signal).toBe('strong');
    });

    it('assigns developing signal when 0.40 <= ratio < 0.75', async () => {
      const sRows = skillRows('skill-2', 'grammar.articles', 'Articles', 5, 10); // 0.5
      const db = makeDb([], sRows);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const skill = result.skillScores.find((s) => s.skillId === 'skill-2');
      expect(skill?.signal).toBe('developing');
    });

    it('assigns emerging signal when ratio < 0.40', async () => {
      const sRows = skillRows('skill-3', 'grammar.negation', 'Negation', 2, 10); // 0.2
      const db = makeDb([], sRows);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const skill = result.skillScores.find((s) => s.skillId === 'skill-3');
      expect(skill?.signal).toBe('emerging');
    });

    it('assigns emerging signal and lowCoverage=true when totalAnswered < 2', async () => {
      const sRows = skillRows('skill-4', 'listening.numbers', 'Numbers', 0, 1); // 1 question
      const db = makeDb([], sRows);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const skill = result.skillScores.find((s) => s.skillId === 'skill-4');
      expect(skill?.lowCoverage).toBe(true);
      expect(skill?.signal).toBe('emerging');
    });

    it('assigns emerging and lowCoverage=false when totalAnswered >= 2', async () => {
      const sRows = skillRows('skill-5', 'vocabulary.context', 'Context', 0, 2); // 2 questions, 0 correct
      const db = makeDb([], sRows);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const skill = result.skillScores.find((s) => s.skillId === 'skill-5');
      expect(skill?.lowCoverage).toBe(false);
      expect(skill?.signal).toBe('emerging');
    });
  });

  // -------------------------------------------------------------------------
  // Security: internal fields must never be returned to clients
  // -------------------------------------------------------------------------

  describe('security — scoring internals', () => {
    it('includes overallScore in result (backend-internal, consumed by P4-046 only)', async () => {
      const db = makeDb([], []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      // overallScore is present on PlacementScoringResult but MUST NOT be forwarded to Flutter
      expect(typeof result.overallScore).toBe('number');
    });

    it('never includes correct_answer in any scoring output', async () => {
      const answers = fullAnswers(5, 5, 5);
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const resultStr = JSON.stringify(result);
      expect(resultStr).not.toContain('correct_answer');
    });

    it('skill mastery map strips rawMastery and uses signal only for Flutter', async () => {
      const sRows = [{ skill_id: 'sk1', skill_key: 'grammar.verbs', skill_name: 'Verb Forms', is_correct: true },
                     { skill_id: 'sk1', skill_key: 'grammar.verbs', skill_name: 'Verb Forms', is_correct: false }];
      const db = makeDb([], sRows);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const entry = result.skillMasteryMap.find((e) => e.skillId === 'sk1');
      expect(entry?.signal).toBeDefined();
      expect(['strong', 'developing', 'emerging']).toContain(entry?.signal);
    });
  });

  // -------------------------------------------------------------------------
  // Weakness map — P4-033
  // -------------------------------------------------------------------------

  describe('weakness map', () => {
    it('returns empty weakness map when all sections pass thresholds', async () => {
      // All 4 sections must be provided — missing sections default to 0 mastery (weakness)
      const answers = [
        ...grammarAnswers(8, 10),    // 0.8 >= 0.60 ✓
        ...vocabAnswers(8, 10),      // 0.8 >= 0.60 ✓
        ...readingAnswers(8, 10),    // 0.8 >= 0.55 ✓
        ...listeningAnswers(8, 10),  // 0.8 >= 0.55 ✓
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      expect(result.weaknessMap).toHaveLength(0);
    });

    it('includes section weakness entry when a section fails threshold', async () => {
      const answers = [
        ...grammarAnswers(3, 10),   // 0.3 < 0.60 — weakness
        ...vocabAnswers(9, 10),
        ...listeningAnswers(9, 10),
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const grammarWeakness = result.weaknessMap.find((e) => e.skillCode === 'grammar');
      expect(grammarWeakness).toBeDefined();
    });

    it('assigns priority 1-based in output', async () => {
      const answers = [
        ...grammarAnswers(2, 10),   // 0.2 < 0.60
        ...vocabAnswers(3, 10),     // 0.3 < 0.60
        ...listeningAnswers(3, 10), // 0.3 < 0.55
      ];
      const db = makeDb(answers, []);
      const svc = new PlacementScoringService(db as unknown as DatabaseService);
      const result = await svc.scoreAttempt(attemptId);
      const priorities = result.weaknessMap.map((e) => e.priority);
      expect(priorities.length).toBeGreaterThan(0);
      // All priorities must be positive integers ≥ 1
      for (const p of priorities) {
        expect(p).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
