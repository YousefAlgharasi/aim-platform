// Text-answer matching for assessments (fill-in-the-blank and other typed answers).
//
// Questions without answer choices keep their accepted answers in question_answers.value, in several shapes
// (see the seeds and migrations):
//   - "twelve"                                              a plain string
//   - { blanks: [{ position, accepted_values: [...] }], case_sensitive }
//   - { accepted_values | acceptedValues | text | value | answer | answers | model_answer }
//   - an array of any of the above
// A typed answer is correct when it matches any accepted value, ignoring case (unless the row says
// case_sensitive), extra spaces, and quotes / brackets / end punctuation around it. Nothing is guessed:
// a question with no accepted values is never marked correct.

export interface AcceptedAnswers {
  readonly values: readonly string[];
  readonly caseSensitive: boolean;
}

const KEYS = ['accepted_values', 'acceptedValues', 'model_answer', 'modelAnswer', 'text', 'value', 'answer', 'answers'] as const;

/** Flatten one question_answers.value into its accepted strings (original case kept). */
export function collectAcceptedValues(value: unknown): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? [trimmed] : [];
  }
  if (Array.isArray(value)) return value.flatMap(collectAcceptedValues);
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: string[] = [];
    if (Array.isArray(obj.blanks)) out.push(...obj.blanks.flatMap(collectAcceptedValues));
    for (const key of KEYS) {
      if (obj[key] !== undefined) out.push(...collectAcceptedValues(obj[key]));
    }
    return out;
  }
  return [];
}

/** Whether a stored question_answers.value asks for an exact-case match. */
export function isCaseSensitive(value: unknown): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && (value as Record<string, unknown>).case_sensitive === true;
}

/** Lower-cases (unless case-sensitive), collapses spaces, and trims quotes / brackets / end punctuation. */
export function normalizeTextAnswer(text: string, caseSensitive = false): string {
  const spaced = text.replace(/\s+/g, ' ').trim();
  const cased = caseSensitive ? spaced : spaced.toLowerCase();
  return cased.replace(/^["'“‘(\s]+|["'”’)\s.,!?;:،؟]+$/gu, '').trim();
}

/** Whether a typed answer matches any of the question's stored answers. Empty answers never match. */
export function matchesTextAnswer(response: string | null | undefined, stored: readonly unknown[]): boolean {
  if (response == null) return false;
  return stored.some((row) => {
    const caseSensitive = isCaseSensitive(row);
    const given = normalizeTextAnswer(response, caseSensitive);
    if (given.length === 0) return false;
    return collectAcceptedValues(row).some((accepted) => normalizeTextAnswer(accepted, caseSensitive) === given);
  });
}
