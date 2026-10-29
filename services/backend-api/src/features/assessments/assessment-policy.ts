// Assessment policy defaults.
//
// Most published quizzes and final exams have no assessment_settings row, so
// every service that reads settings needs the same fallback. Keeping the
// defaults here means attempt limits and pass marks can't drift between the
// detail endpoint, attempt start, and grading.
//
// Quizzes default to several attempts: a final exam only unlocks once every
// chapter quiz is passed, so a quiz limited to one attempt would lock the
// final exam for good after a single failed try.

export const DEFAULT_PASS_THRESHOLD = 60;

const DEFAULT_MAX_ATTEMPTS: Record<string, number> = {
  quiz: 5,
  exam: 3,
};

const FALLBACK_MAX_ATTEMPTS = 3;

/** The attempt limit for an assessment: its configured value, else the default for its type. */
export function resolveMaxAttempts(type: string, configured: number | null | undefined): number {
  if (typeof configured === 'number' && configured >= 1) return configured;
  return DEFAULT_MAX_ATTEMPTS[type] ?? FALLBACK_MAX_ATTEMPTS;
}
