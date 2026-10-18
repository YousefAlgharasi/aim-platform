// Course scoring util.
//
// 1,000-Point Model:
//   - Lesson Practices: 200 points max (20%)
//   - Chapter Quizzes: 200 points max (20%)
//   - Chapter Exams: 200 points max (20%)
//   - Course Final Exam: 400 points max (40%)
//   - Total: 1,000 points max
//   - Overall Grade: Total Points / 10 = 0 - 100%

import { CertificateScoreBreakdown } from './certificate.types';

export interface ScoredAssessment {
  readonly type: 'quiz' | 'exam';
  readonly isFinalExam?: boolean;
  readonly score: number;
  readonly maxScore: number;
}

export function toScorePercent(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}

function averagePercent(items: readonly ScoredAssessment[]): number | null {
  if (items.length === 0) return null;
  const total = items.reduce((sum, a) => sum + toScorePercent(a.score, a.maxScore), 0);
  return total / items.length;
}

/**
 * Computes the 1,000-point breakdown and final 100% grade.
 */
export function computeCourse1000PointBreakdown(
  assessments: readonly ScoredAssessment[],
  practiceAccuracyPercent: number = 100,
): CertificateScoreBreakdown {
  // 1. Practice (200 points)
  const clampedPracticeAccuracy = Math.min(100, Math.max(0, practiceAccuracyPercent));
  const practicePoints = Math.round((clampedPracticeAccuracy / 100) * 200);

  // 2. Quizzes (200 points)
  const quizzes = assessments.filter((a) => a.type === 'quiz');
  const quizAvg = averagePercent(quizzes);
  const quizPoints = quizAvg !== null ? Math.round((quizAvg / 100) * 200) : 200;

  // 3. Chapter Exams (200 points) vs Final Exam (400 points)
  const exams = assessments.filter((a) => a.type === 'exam');
  const finalExams = exams.filter((a) => a.isFinalExam === true);
  const chapterExams = exams.filter((a) => a.isFinalExam !== true);

  let finalExamPoints = 0;
  let chapterExamPoints = 0;

  if (finalExams.length > 0) {
    const finalAvg = averagePercent(finalExams) ?? 100;
    finalExamPoints = Math.round((finalAvg / 100) * 400);

    if (chapterExams.length > 0) {
      const chapterAvg = averagePercent(chapterExams) ?? 100;
      chapterExamPoints = Math.round((chapterAvg / 100) * 200);
    } else {
      chapterExamPoints = Math.round((finalAvg / 100) * 200);
    }
  } else if (exams.length > 0) {
    const finalAvg = toScorePercent(exams[exams.length - 1].score, exams[exams.length - 1].maxScore);
    finalExamPoints = Math.round((finalAvg / 100) * 400);

    if (exams.length > 1) {
      const chapterAvg = averagePercent(exams.slice(0, -1)) ?? finalAvg;
      chapterExamPoints = Math.round((chapterAvg / 100) * 200);
    } else {
      chapterExamPoints = Math.round((finalAvg / 100) * 200);
    }
  } else {
    finalExamPoints = 400;
    chapterExamPoints = 200;
  }

  const totalPoints = Math.min(
    1000,
    Math.max(0, practicePoints + quizPoints + chapterExamPoints + finalExamPoints),
  );
  const overallPercent = Math.min(100, Math.max(0, Math.round(totalPoints / 10)));

  return {
    practicePoints,
    practiceMaxPoints: 200,
    quizPoints,
    quizMaxPoints: 200,
    chapterExamPoints,
    chapterExamMaxPoints: 200,
    finalExamPoints,
    finalExamMaxPoints: 400,
    totalPoints,
    maxPoints: 1000,
    overallPercent,
  };
}

/**
 * Overall course score as a 0-100 percent. Returns null when there are no
 * quiz or exam results to derive a score from yet.
 */
export function computeCourseScorePercent(
  assessments: readonly ScoredAssessment[],
  practiceAccuracyPercent?: number,
): number | null {
  if (assessments.length === 0) return null;
  const breakdown = computeCourse1000PointBreakdown(assessments, practiceAccuracyPercent ?? 100);
  return breakdown.overallPercent;
}
