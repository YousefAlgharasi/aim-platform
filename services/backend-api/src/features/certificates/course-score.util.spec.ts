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
        { type: 'exam', score: 50, maxScore: 50, isFinalExam: true },
      ],
      100,
    );

    expect(breakdown.practicePoints).toBe(250);
    expect(breakdown.quizPoints).toBe(250);
    expect(breakdown.finalExamPoints).toBe(500);
    expect(breakdown.totalPoints).toBe(1000);
    expect(breakdown.overallPercent).toBe(100);
  });

  it('calculates weighted points correctly with varied scores', () => {
    const breakdown = computeCourse1000PointBreakdown(
      [
        { type: 'quiz', score: 8, maxScore: 10 }, // 80% of 250 -> 200 pts
        { type: 'exam', score: 90, maxScore: 100, isFinalExam: true }, // 90% of 500 -> 450 pts
      ],
      80, // 80% practice of 250 -> 200 pts
    );

    // 200 + 200 + 450 = 850 points -> 85%
    expect(breakdown.practicePoints).toBe(200);
    expect(breakdown.quizPoints).toBe(200);
    expect(breakdown.finalExamPoints).toBe(450);
    expect(breakdown.totalPoints).toBe(850);
    expect(breakdown.overallPercent).toBe(85);
  });
});

describe('computeCourse1000PointBreakdown — chapter exams are left out', () => {
  const base = [
    { assessmentId: 'q1', type: 'quiz' as const, score: 8, maxScore: 10 },
    { assessmentId: 'final', type: 'exam' as const, score: 90, maxScore: 100, isFinalExam: true },
  ];

  it('gives the same mark with or without a chapter exam, even a terrible one', () => {
    const without = computeCourse1000PointBreakdown(base, 80);
    const withChapterExam = computeCourse1000PointBreakdown(
      [...base, { assessmentId: 'ch-exam', type: 'exam', score: 0, maxScore: 20, isFinalExam: false }],
      80,
    );
    expect(withChapterExam.totalPoints).toBe(without.totalPoints);
    expect(withChapterExam.overallPercent).toBe(without.overallPercent);
    expect(withChapterExam.quizPoints).toBe(without.quizPoints);
    expect(withChapterExam.finalExamPoints).toBe(without.finalExamPoints);
  });

  it('no longer reports any chapter-exam points (the fields stay, at 0, for older apps)', () => {
    const b = computeCourse1000PointBreakdown(
      [...base, { assessmentId: 'ch-exam', type: 'exam', score: 20, maxScore: 20, isFinalExam: false }],
      80,
    );
    expect(b.chapterExamPoints).toBe(0);
    expect(b.chapterExamMaxPoints).toBe(0);
    expect(b.chapterExamAveragePercent).toBe(0);
  });

  it('adds up to a mark out of 100: the parts total the same as the overall number', () => {
    const b = computeCourse1000PointBreakdown(base, 80);
    expect(b.practicePoints + b.quizPoints + b.finalExamPoints).toBe(b.totalPoints);
    expect(b.practiceMaxPoints + b.quizMaxPoints + b.finalExamMaxPoints).toBe(1000);
    expect(b.overallPercent).toBe(Math.round(b.totalPoints / 10));
  });

  it('still treats the last exam as the final exam in old snapshots that do not flag it', () => {
    const b = computeCourse1000PointBreakdown(
      [
        { assessmentId: 'q1', type: 'quiz', score: 10, maxScore: 10 },
        { assessmentId: 'e1', type: 'exam', score: 0, maxScore: 10 },
        { assessmentId: 'e2', type: 'exam', score: 10, maxScore: 10 },
      ],
      100,
    );
    expect(b.finalExamPercent).toBe(100);
    expect(b.overallPercent).toBe(100);
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
