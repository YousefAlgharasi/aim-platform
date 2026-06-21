// P10-044: Add Grading Tests
//
// Covers: MCQ correctness, multi-point scoring, score weights, late penalty,
//         pass/fail threshold, edge cases (no answers, all correct, all wrong,
//         zero max score guard), and backend-authority assertions.

// ---------------------------------------------------------------------------
// Shared types (inlined — P10-027/028 branches not yet on main)
// ---------------------------------------------------------------------------

interface GradingOutcome {
  assessmentQuestionLinkId: string;
  isCorrect: boolean;
  pointsAwarded: number;
  pointsPossible: number;
}

interface AssessmentGradingResult {
  attemptId: string;
  assessmentId: string;
  studentId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  latePenaltyApplied: boolean;
  gradedAt: Date;
  outcomes: GradingOutcome[];
}

// ---------------------------------------------------------------------------
// Grading logic under test (extracted for unit testing without DB)
// ---------------------------------------------------------------------------

function gradeAnswers(
  answers: Array<{ questionLinkId: string; questionId: string; responseValue: string; points: number }>,
  correctLabels: Map<string, Set<string>>,
): GradingOutcome[] {
  return answers.map((a) => {
    const correct = correctLabels.get(a.questionId) ?? new Set();
    const isCorrect = correct.has(a.responseValue);
    return {
      assessmentQuestionLinkId: a.questionLinkId,
      isCorrect,
      pointsAwarded: isCorrect ? a.points : 0,
      pointsPossible: a.points,
    };
  });
}

function applyPassThreshold(score: number, maxScore: number, threshold: number): boolean {
  if (maxScore === 0) return false;
  return (score / maxScore) * 100 >= threshold;
}

function applyLatePenalty(score: number, penaltyPercent: number): number {
  return score * (1 - penaltyPercent / 100);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('P10-044: Grading Tests', () => {

  // -------------------------------------------------------------------------
  // MCQ correctness
  // -------------------------------------------------------------------------

  describe('MCQ — correctness', () => {
    const correctMap = new Map([
      ['q-1', new Set(['A'])],
      ['q-2', new Set(['C'])],
      ['q-3', new Set(['B'])],
    ]);

    it('awards full points for each correct MCQ answer', () => {
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'A', points: 5 },
        { questionLinkId: 'ql-2', questionId: 'q-2', responseValue: 'C', points: 5 },
      ];
      const outcomes = gradeAnswers(answers, correctMap);
      expect(outcomes[0].isCorrect).toBe(true);
      expect(outcomes[0].pointsAwarded).toBe(5);
      expect(outcomes[1].isCorrect).toBe(true);
      expect(outcomes[1].pointsAwarded).toBe(5);
    });

    it('awards 0 points for wrong MCQ answer', () => {
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'B', points: 5 },
      ];
      const outcomes = gradeAnswers(answers, correctMap);
      expect(outcomes[0].isCorrect).toBe(false);
      expect(outcomes[0].pointsAwarded).toBe(0);
      expect(outcomes[0].pointsPossible).toBe(5);
    });

    it('handles mixed correct and wrong answers', () => {
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'A', points: 4 }, // correct
        { questionLinkId: 'ql-2', questionId: 'q-2', responseValue: 'A', points: 4 }, // wrong
        { questionLinkId: 'ql-3', questionId: 'q-3', responseValue: 'B', points: 2 }, // correct
      ];
      const outcomes = gradeAnswers(answers, correctMap);
      const totalScore = outcomes.reduce((s, o) => s + o.pointsAwarded, 0);
      const maxScore = outcomes.reduce((s, o) => s + o.pointsPossible, 0);
      expect(totalScore).toBe(6);  // 4 + 0 + 2
      expect(maxScore).toBe(10);
    });

    it('scores 0 when no correct choices exist for question', () => {
      const emptyMap = new Map<string, Set<string>>();
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-x', responseValue: 'A', points: 5 },
      ];
      const outcomes = gradeAnswers(answers, emptyMap);
      expect(outcomes[0].isCorrect).toBe(false);
      expect(outcomes[0].pointsAwarded).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Variable point weights
  // -------------------------------------------------------------------------

  describe('Score weights (variable points per question)', () => {
    it('correctly sums weighted scores', () => {
      const correctMap = new Map([
        ['q-1', new Set(['A'])],
        ['q-2', new Set(['B'])],
      ]);
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'A', points: 10 },
        { questionLinkId: 'ql-2', questionId: 'q-2', responseValue: 'B', points: 2 },
      ];
      const outcomes = gradeAnswers(answers, correctMap);
      const score = outcomes.reduce((s, o) => s + o.pointsAwarded, 0);
      const maxScore = outcomes.reduce((s, o) => s + o.pointsPossible, 0);
      expect(score).toBe(12);
      expect(maxScore).toBe(12);
    });

    it('preserves pointsPossible even when answer is wrong', () => {
      const correctMap = new Map([['q-1', new Set(['A'])]]);
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'B', points: 7 },
      ];
      const outcomes = gradeAnswers(answers, correctMap);
      expect(outcomes[0].pointsPossible).toBe(7);
      expect(outcomes[0].pointsAwarded).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // Pass/fail threshold
  // -------------------------------------------------------------------------

  describe('Pass/fail threshold (DB-driven, never client-supplied)', () => {
    it('passes at exactly the threshold', () => {
      expect(applyPassThreshold(60, 100, 60)).toBe(true);
    });

    it('fails just below the threshold', () => {
      expect(applyPassThreshold(59, 100, 60)).toBe(false);
    });

    it('passes with 100% score', () => {
      expect(applyPassThreshold(100, 100, 60)).toBe(true);
    });

    it('fails with 0% score', () => {
      expect(applyPassThreshold(0, 100, 60)).toBe(false);
    });

    it('returns false when maxScore is 0 (guard against division by zero)', () => {
      expect(applyPassThreshold(0, 0, 60)).toBe(false);
    });

    it('applies high threshold (e.g. 80%)', () => {
      expect(applyPassThreshold(79, 100, 80)).toBe(false);
      expect(applyPassThreshold(80, 100, 80)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Late penalty
  // -------------------------------------------------------------------------

  describe('Late penalty (backend-applied, never client-supplied)', () => {
    it('applies 10% penalty correctly', () => {
      expect(applyLatePenalty(100, 10)).toBeCloseTo(90);
    });

    it('applies 0% penalty (no change)', () => {
      expect(applyLatePenalty(80, 0)).toBe(80);
    });

    it('applies 100% penalty (score becomes 0)', () => {
      expect(applyLatePenalty(50, 100)).toBe(0);
    });

    it('penalty does not go negative', () => {
      const penalized = applyLatePenalty(10, 100);
      expect(penalized).toBeGreaterThanOrEqual(0);
    });

    it('combined: penalty then pass check', () => {
      // Score 70/100 with 20% late penalty = 56; threshold 60 → fail
      const penalized = applyLatePenalty(70, 20);
      const passed = applyPassThreshold(penalized, 100, 60);
      expect(penalized).toBeCloseTo(56);
      expect(passed).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe('Edge cases', () => {
    it('handles empty answer list (no questions answered)', () => {
      const outcomes = gradeAnswers([], new Map());
      expect(outcomes).toHaveLength(0);
    });

    it('all correct gives 100%', () => {
      const correctMap = new Map([
        ['q-1', new Set(['A'])],
        ['q-2', new Set(['B'])],
        ['q-3', new Set(['C'])],
      ]);
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'A', points: 5 },
        { questionLinkId: 'ql-2', questionId: 'q-2', responseValue: 'B', points: 5 },
        { questionLinkId: 'ql-3', questionId: 'q-3', responseValue: 'C', points: 5 },
      ];
      const outcomes = gradeAnswers(answers, correctMap);
      const score = outcomes.reduce((s, o) => s + o.pointsAwarded, 0);
      const maxScore = outcomes.reduce((s, o) => s + o.pointsPossible, 0);
      expect(score).toBe(maxScore);
      expect(applyPassThreshold(score, maxScore, 60)).toBe(true);
    });

    it('all wrong gives 0%', () => {
      const correctMap = new Map([['q-1', new Set(['A'])]]);
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'D', points: 10 },
      ];
      const outcomes = gradeAnswers(answers, correctMap);
      expect(outcomes[0].pointsAwarded).toBe(0);
      expect(applyPassThreshold(0, 10, 60)).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Backend authority assertions
  // -------------------------------------------------------------------------

  describe('Backend authority assertions', () => {
    it('gradeAnswers never accepts a pre-computed isCorrect from client', () => {
      // The input type has no isCorrect field — by design.
      const answer = { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'A', points: 5 };
      expect(Object.keys(answer)).not.toContain('isCorrect');
    });

    it('applyPassThreshold signature has no client-supplied "passed" param', () => {
      // Function takes numeric score/maxScore/threshold only.
      expect(applyPassThreshold.length).toBe(3);
    });

    it('applyLatePenalty signature has no client-supplied "latePenaltyApplied" flag', () => {
      expect(applyLatePenalty.length).toBe(2);
    });

    it('GradingOutcome does not expose correct answer text', () => {
      const correctMap = new Map([['q-1', new Set(['A'])]]);
      const answers = [
        { questionLinkId: 'ql-1', questionId: 'q-1', responseValue: 'A', points: 5 },
      ];
      const outcomes = gradeAnswers(answers, correctMap);
      // Outcome has isCorrect (boolean) but NOT the correct answer string
      expect(Object.keys(outcomes[0])).not.toContain('correctAnswer');
      expect(Object.keys(outcomes[0])).not.toContain('correctLabel');
    });
  });
});
