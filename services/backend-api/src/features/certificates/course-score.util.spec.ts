import {
  computeCourse1000PointBreakdown,
  computeCourseScorePercent,
  toScorePercent,
} from './course-score.util';

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

describe('computeCourse1000PointBreakdown', () => {
  it('computes 1,000 points perfectly with 100% across all components', () => {
    const breakdown = computeCourse1000PointBreakdown(
      [
        { type: 'quiz', score: 10, maxScore: 10 },
        { type: 'exam', score: 20, maxScore: 20, isFinalExam: false },
        { type: 'exam', score: 50, maxScore: 50, isFinalExam: true },
      ],
      100,
    );

    expect(breakdown.practicePoints).toBe(200);
    expect(breakdown.quizPoints).toBe(200);
    expect(breakdown.chapterExamPoints).toBe(200);
    expect(breakdown.finalExamPoints).toBe(400);
    expect(breakdown.totalPoints).toBe(1000);
    expect(breakdown.overallPercent).toBe(100);
  });

  it('calculates weighted points correctly with varied scores', () => {
    const breakdown = computeCourse1000PointBreakdown(
      [
        { type: 'quiz', score: 8, maxScore: 10 }, // 80% -> 160 pts
        { type: 'exam', score: 70, maxScore: 100, isFinalExam: false }, // 70% -> 140 pts
        { type: 'exam', score: 90, maxScore: 100, isFinalExam: true }, // 90% -> 360 pts
      ],
      85, // 85% practice -> 170 pts
    );

    // 170 + 160 + 140 + 360 = 830 points -> 83%
    expect(breakdown.practicePoints).toBe(170);
    expect(breakdown.quizPoints).toBe(160);
    expect(breakdown.chapterExamPoints).toBe(140);
    expect(breakdown.finalExamPoints).toBe(360);
    expect(breakdown.totalPoints).toBe(830);
    expect(breakdown.overallPercent).toBe(83);
  });
});

describe('computeCourseScorePercent', () => {
  it('returns null when there are no results yet', () => {
    expect(computeCourseScorePercent([])).toBeNull();
  });

  it('returns the score percentage out of 100 from the 1000 point model', () => {
    const result = computeCourseScorePercent([
      { type: 'quiz', score: 10, maxScore: 10 },
      { type: 'exam', score: 10, maxScore: 10, isFinalExam: true },
    ]);
    expect(result).toBe(100);
  });
});
