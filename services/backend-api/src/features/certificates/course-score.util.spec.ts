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

describe('computeCourse1000PointBreakdown — real marks', () => {
  it('scales the remaining weights to 1,000 when the course has no chapter exams', () => {
    const breakdown = computeCourse1000PointBreakdown(
      [
        { assessmentId: 'q1', type: 'quiz', score: 10, maxScore: 10 },
        { assessmentId: 'final', type: 'exam', score: 33, maxScore: 33, isFinalExam: true },
      ],
      100,
    );

    expect(breakdown.practiceMaxPoints).toBe(250);
    expect(breakdown.quizMaxPoints).toBe(250);
    expect(breakdown.chapterExamMaxPoints).toBe(0);
    expect(breakdown.finalExamMaxPoints).toBe(500);
    expect(breakdown.totalPoints).toBe(1000);
    expect(breakdown.overallPercent).toBe(100);
  });

  it('counts each assessment once, at its best attempt', () => {
    const breakdown = computeCourse1000PointBreakdown(
      [
        { assessmentId: 'q1', type: 'quiz', score: 0, maxScore: 10 },
        { assessmentId: 'q1', type: 'quiz', score: 9, maxScore: 10 },
        { assessmentId: 'q2', type: 'quiz', score: 7, maxScore: 10 },
      ],
      null,
    );

    expect(breakdown.quizAveragePercent).toBe(80);
    expect(breakdown.quizMaxPoints).toBe(1000);
    expect(breakdown.overallPercent).toBe(80);
  });

  it('leaves practice out instead of awarding it when there were no practice attempts', () => {
    const breakdown = computeCourse1000PointBreakdown(
      [{ assessmentId: 'final', type: 'exam', score: 6, maxScore: 10, isFinalExam: true }],
      null,
    );

    expect(breakdown.practicePoints).toBe(0);
    expect(breakdown.practiceMaxPoints).toBe(0);
    expect(breakdown.finalExamMaxPoints).toBe(1000);
    expect(breakdown.overallPercent).toBe(60);
  });

  it('returns an all-zero breakdown with no results', () => {
    const breakdown = computeCourse1000PointBreakdown([], null);
    expect(breakdown.totalPoints).toBe(0);
    expect(breakdown.overallPercent).toBe(0);
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

  it('weights quizzes 40/90 and the exam 50/90', () => {
    const result = computeCourseScorePercent([
      { type: 'quiz', score: 8, maxScore: 10 },
      { type: 'exam', score: 9, maxScore: 10 },
    ]);
    expect(result).toBe(86);
  });
});
