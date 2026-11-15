import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locale.constants';

/**
 * Helpers for the additive `translations` JSONB columns on question_bank / question_choices.
 * Shape: { "<locale>": { stem?, hint?, text? } }. Output is sanitised: only known string fields,
 * only supported non-English locales, and omitted entirely when nothing usable is present.
 * Read paths never fail on malformed data.
 */

export interface QuestionTextTranslation {
  stem: string;
  hint?: string;
}

export interface ChoiceTextTranslation {
  text: string;
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function nonEnglishEntries(raw: unknown): Array<[string, Record<string, unknown>]> {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return [];
  const out: Array<[string, Record<string, unknown>]> = [];
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    const entry = (raw as Record<string, unknown>)[locale];
    if (entry !== null && typeof entry === 'object' && !Array.isArray(entry)) {
      out.push([locale, entry as Record<string, unknown>]);
    }
  }
  return out;
}

/** Student-facing question text translations (stem, optional hint). The explanation is not delivered pre-answer. */
export function questionTranslations(raw: unknown): Record<string, QuestionTextTranslation> | undefined {
  const result: Record<string, QuestionTextTranslation> = {};
  for (const [locale, entry] of nonEnglishEntries(raw)) {
    const stem = nonEmptyString(entry.stem);
    if (!stem) continue;
    const hint = nonEmptyString(entry.hint);
    result[locale] = hint ? { stem, hint } : { stem };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/** Choice text translations. Never applied to true/false questions: their labels stay English. */
export function choiceTranslations(
  raw: unknown,
  questionType?: string,
): Record<string, ChoiceTextTranslation> | undefined {
  if (questionType === 'true_false') return undefined;
  const result: Record<string, ChoiceTextTranslation> = {};
  for (const [locale, entry] of nonEnglishEntries(raw)) {
    const text = nonEmptyString(entry.text);
    if (text) result[locale] = { text };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/** Spread helper: `{ ...withTranslations(x) }` adds `translations` only when present (field omitted otherwise). */
export function withTranslations<T>(translations: T | undefined): { translations?: T } {
  return translations ? { translations } : {};
}

export interface ExplanationTranslation {
  explanation: string;
}

/**
 * Explanation translations. Only call this at the point the English explanation is delivered
 * (after an answer is submitted / checked) so the Arabic text is never a pre-answer leak.
 */
export function explanationTranslations(raw: unknown): Record<string, ExplanationTranslation> | undefined {
  const result: Record<string, ExplanationTranslation> = {};
  for (const [locale, entry] of nonEnglishEntries(raw)) {
    const explanation = nonEmptyString(entry.explanation);
    if (explanation) result[locale] = { explanation };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/** Maps a stored choices array (json rows with optional `translations`) to the `translations` field per option. */
export function optionsWithTranslations<T extends { translations?: unknown }>(
  options: readonly T[],
  questionType?: string,
): Array<Omit<T, 'translations'> & { translations?: Record<string, ChoiceTextTranslation> }> {
  return options.map((o) => {
    const { translations, ...rest } = o;
    return { ...rest, ...withTranslations(choiceTranslations(translations, questionType)) };
  });
}

export interface TitleDescriptionTranslation {
  title: string;
  description?: string;
}

/**
 * Lightweight lesson/summary translations for list endpoints: rows of { locale, title, description }
 * (non-English locales only). Malformed rows are skipped.
 */
export function titleTranslations(rows: unknown): Record<string, TitleDescriptionTranslation> | undefined {
  if (!Array.isArray(rows)) return undefined;
  const result: Record<string, TitleDescriptionTranslation> = {};
  for (const row of rows) {
    if (row === null || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const locale = r.locale;
    if (typeof locale !== 'string' || locale === DEFAULT_LOCALE || !(SUPPORTED_LOCALES as readonly string[]).includes(locale)) continue;
    const title = nonEmptyString(r.title);
    if (!title) continue;
    const description = nonEmptyString(r.description);
    result[locale] = description ? { title, description } : { title };
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
