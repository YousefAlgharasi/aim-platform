// Course scoring util.
//
// 1,000-Point Model for Certificates. Base weights:
//   - Lesson Practices: 200 points (20%)
//   - Chapter Quizzes: 200 points (20%)
//   - Chapter Exams: 200 points (20%)
//   - Course Final Exam: 400 points (40%)
//
// Only components the course actually has (and the student actually did)
// are scored; their weights are scaled up so they still add to 1,000. A
// course with no chapter exams, for example, scores practice 250 / quizzes
// 250 / final exam 500. Without this, a perfect student in a course with no
// chapter exams could never score above 800 (80%).
//
// Each assessment counts once, at the student's best attempt — retakes
// replace a failed try instead of being averaged with it.

import { CertificateScoreBreakdown } from './certificate.types';

export interface ScoredAssessment {
  readonly assessmentId?: string;
  readonly type: 'quiz' | 'exam';
  readonly isFinalExam?: boolean;
  readonly score: number;
  readonly maxScore: number;
}

const QUIZ_WEIGHT = 40 / 90;
const EXAM_WEIGHT = 50 / 90;

const TOTAL_POINTS = 1000;
const BASE_WEIGHTS = {
  practice: 200,
  quiz: 200,
  chapterExam: 200,
  finalExam: 400,
} as const;

type Component = keyof typeof BASE_WEIGHTS;

export function toScorePercent(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}

function exactPercent(a: ScoredAssessment): number {
  return a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
}

function averagePercent(items: readonly ScoredAssessment[]): number | null {
  if (items.length === 0) return null;
  const total = items.reduce((sum, a) => sum + toScorePercent(a.score, a.maxScore), 0);
  return total / items.length;
}

/** Keeps each assessment's best attempt, in first-seen order. Entries without an id are kept as-is. */
export function bestResultPerAssessment<T extends ScoredAssessment>(assessments: readonly T[]): T[] {
  const best = new Map<string, T>();
  const ordered: (T | string)[] = [];
  for (const a of assessments) {
    if (!a.assessmentId) {
      ordered.push(a);
      continue;
    }
    const current = best.get(a.assessmentId);
    if (!current) {
      best.set(a.assessmentId, a);
      ordered.push(a.assessmentId);
    } else if (exactPercent(a) > exactPercent(current)) {
      best.set(a.assessmentId, a);
    }
  }
  return ordered.map((entry) => (typeof entry === 'string' ? (best.get(entry) as T) : entry));
}

/**
 * Computes the 1,000-point breakdown and final 100% grade for course certificates.
 * practiceAccuracyPercent is null when the student has no practice attempts in the course.
 */
export function computeCourse1000PointBreakdown(
  assessments: readonly ScoredAssessment[],
  practiceAccuracyPercent: number | null = null,
): CertificateScoreBreakdown {
  const results = bestResultPerAssessment(assessments);

  const quizzes = results.filter((a) => a.type === 'quiz');
  const exams = results.filter((a) => a.type === 'exam');
  let finalExams = exams.filter((a) => a.isFinalExam === true);
  let chapterExams = exams.filter((a) => a.isFinalExam !== true);
  if (finalExams.length === 0 && exams.length > 0) {
    // Legacy snapshots don't flag the final exam: treat the last exam as final.
    finalExams = exams.slice(-1);
    chapterExams = exams.slice(0, -1);
  }

  const percents: Record<Component, number | null> = {
    practice:
      practiceAccuracyPercent === null ? null : Math.min(100, Math.max(0, practiceAccuracyPercent)),
    quiz: averagePercent(quizzes),
    chapterExam: averagePercent(chapterExams),
    finalExam: averagePercent(finalExams),
  };

  const present = (Object.keys(BASE_WEIGHTS) as Component[]).filter((c) => percents[c] !== null);
  const presentWeight = present.reduce((sum, c) => sum + BASE_WEIGHTS[c], 0);

  const maxPoints: Record<Component, number> = { practice: 0, quiz: 0, chapterExam: 0, finalExam: 0 };
  let allocated = 0;
  present.forEach((c, i) => {
    const isLast = i === present.length - 1;
    maxPoints[c] = isLast
      ? TOTAL_POINTS - allocated
      : Math.round((BASE_WEIGHTS[c] / presentWeight) * TOTAL_POINTS);
    allocated += maxPoints[c];
  });

  const points = (c: Component): number => {
    const percent = percents[c];
    return percent === null ? 0 : Math.round((percent / 100) * maxPoints[c]);
  };

  const practicePoints = points('practice');
  const quizPoints = points('quiz');
  const chapterExamPoints = points('chapterExam');
  const finalExamPoints = points('finalExam');

  const totalPoints = Math.min(
    TOTAL_POINTS,
    Math.max(0, practicePoints + quizPoints + chapterExamPoints + finalExamPoints),
  );
  const overallPercent = present.length === 0 ? 0 : Math.min(100, Math.max(0, Math.round(totalPoints / 10)));

  return {
    practicePoints,
    practiceMaxPoints: maxPoints.practice,
    practiceAccuracyPercent: Math.round(percents.practice ?? 0),
    quizPoints,
    quizMaxPoints: maxPoints.quiz,
    quizAveragePercent: Math.round(percents.quiz ?? 0),
    chapterExamPoints,
    chapterExamMaxPoints: maxPoints.chapterExam,
    chapterExamAveragePercent: Math.round(percents.chapterExam ?? 0),
    finalExamPoints,
    finalExamMaxPoints: maxPoints.finalExam,
    finalExamPercent: Math.round(percents.finalExam ?? 0),
    totalPoints,
    maxPoints: TOTAL_POINTS,
    overallPercent,
  };
}

/**
 * Overall course score as a 0-100 percent. Returns null when there are no
 * quiz or exam results to derive a score from yet.
 */
export function computeCourseScorePercent(allAssessments: readonly ScoredAssessment[]): number | null {
  const assessments = bestResultPerAssessment(allAssessments);
  const quizPercent = averagePercent(assessments.filter((a) => a.type === 'quiz'));
  const examPercent = averagePercent(assessments.filter((a) => a.type === 'exam'));

  if (quizPercent === null && examPercent === null) return null;
  if (quizPercent === null) return Math.round(examPercent as number);
  if (examPercent === null) return Math.round(quizPercent);

  return Math.round(quizPercent * QUIZ_WEIGHT + examPercent * EXAM_WEIGHT);
}
