import { computeCourseScorePercent, toScorePercent } from './course-score.util';

describe('toScorePercent', () => {
  it('normalizes a score to a 0-100 percent', () => {
    expect(toScorePercent(8, 10)).toBe(80);
    expect(toScorePercent(75, 100)).toBe(75);
    expect(toScorePercent(18, 20)).toBe(90);
  });

  it('returns 0 for a non-positive maxScore instead of dividing by zero', () => {
    expect(toScorePercent(0, 0)).toBe(0);
  });
});

describe('computeCourseScorePercent', () => {
  it('returns null when there are no results yet', () => {
    expect(computeCourseScorePercent([])).toBeNull();
  });

  it('uses the exam alone when there are no quizzes', () => {
    expect(computeCourseScorePercent([{ type: 'exam', score: 9, maxScore: 10 }])).toBe(90);
  });

  it('uses the quiz average alone when there is no exam', () => {
    expect(
      computeCourseScorePercent([
        { type: 'quiz', score: 7, maxScore: 10 },
        { type: 'quiz', score: 9, maxScore: 10 },
      ]),
    ).toBe(80);
  });

  it('weights quizzes 40/90 and the exam 50/90 (practice is unscored, so its weight is reallocated proportionally)', () => {
    // quiz avg = 80%, exam = 90% -> 80 * 40/90 + 90 * 50/90 = 35.555... + 50 = 85.55... -> 86
    const result = computeCourseScorePercent([
      { type: 'quiz', score: 8, maxScore: 10 },
      { type: 'exam', score: 9, maxScore: 10 },
    ]);
    expect(result).toBe(86);
  });

  it('averages multiple quizzes before weighting', () => {
    const result = computeCourseScorePercent([
      { type: 'quiz', score: 75, maxScore: 100 },
      { type: 'quiz', score: 89, maxScore: 100 },
      { type: 'exam', score: 100, maxScore: 100 },
    ]);
    // quiz avg = 82, exam = 100 -> 82 * 40/90 + 100 * 50/90 = 36.44 + 55.56 = 92
    expect(result).toBe(92);
  });
});
