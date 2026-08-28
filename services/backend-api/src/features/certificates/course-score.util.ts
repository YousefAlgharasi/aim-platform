// Course scoring util.
//
// Scope: Pure, backend-only rollup of a course's quiz/exam results into one
// weighted 0-100 percent. Never invents a score — only normalizes and
// averages numbers the grading/score-policy service already persisted.
//
// Weighting: the intended split is practice 10% / quizzes 40% / exam 50%
// (or, when practice itself carries a real score, practice 20% / quizzes
// 40% / exam 40%). There is currently no numeric practice score anywhere in
// the schema — practice attempts only record right/wrong — so the practice
// slice is dropped and its weight reallocated proportionally between
// quizzes and the exam, preserving their 40:50 ratio (40/90 and 50/90).

export interface ScoredAssessment {
  readonly type: 'quiz' | 'exam';
  readonly score: number;
  readonly maxScore: number;
}

const QUIZ_WEIGHT = 40 / 90;
const EXAM_WEIGHT = 50 / 90;

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
 * Overall course score as a 0-100 percent. Returns null when there are no
 * quiz or exam results to derive a score from yet.
 */
export function computeCourseScorePercent(assessments: readonly ScoredAssessment[]): number | null {
  const quizPercent = averagePercent(assessments.filter((a) => a.type === 'quiz'));
  const examPercent = averagePercent(assessments.filter((a) => a.type === 'exam'));

  if (quizPercent === null && examPercent === null) return null;
  if (quizPercent === null) return Math.round(examPercent as number);
  if (examPercent === null) return Math.round(quizPercent);

  return Math.round(quizPercent * QUIZ_WEIGHT + examPercent * EXAM_WEIGHT);
}
