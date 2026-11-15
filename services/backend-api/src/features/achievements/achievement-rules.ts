// Unlock rules an achievement can use. Each rule type maps to one counter the
// backend measures for a student; an achievement unlocks once the counter
// reaches its threshold. Admins pick a type + threshold, so new achievements
// need no code change.

export const ACHIEVEMENT_RULE_TYPES = [
  'lessons_completed',
  'assessments_passed',
  'perfect_scores',
  'streak_days',
  'correct_answers',
  'speaking_practices',
  'writing_practices',
  'mistakes_fixed',
  'skills_mastered',
  'courses_completed',
  'xp_total',
] as const;

export type AchievementRuleType = (typeof ACHIEVEMENT_RULE_TYPES)[number];

export type AchievementCounters = Readonly<Record<AchievementRuleType, number>>;

/** Human labels shown in the admin dashboard. */
export const ACHIEVEMENT_RULE_LABELS: Readonly<Record<AchievementRuleType, string>> = {
  lessons_completed: 'Lessons completed',
  assessments_passed: 'Quizzes/exams passed',
  perfect_scores: 'Perfect (100%) quiz/exam scores',
  streak_days: 'Longest learning streak (days)',
  correct_answers: 'Correct practice answers',
  speaking_practices: 'Speaking practices finished',
  writing_practices: 'Writing practices finished',
  mistakes_fixed: 'Mistakes fixed',
  skills_mastered: 'Skills mastered (80%+)',
  courses_completed: 'Courses completed (certificates)',
  xp_total: 'Total XP',
};

export const isRuleType = (v: unknown): v is AchievementRuleType =>
  typeof v === 'string' && (ACHIEVEMENT_RULE_TYPES as readonly string[]).includes(v);
