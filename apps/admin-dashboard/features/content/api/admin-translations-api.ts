import { adminApiClient } from '../../../core/api';

export type TranslatableEntity = 'courses' | 'lessons' | 'chapters';

export type TranslationEntry = {
  readonly locale: string;
  readonly title: string;
  readonly description: string | null;
};

export type TranslationInput = {
  readonly title: string;
  readonly description: string | null;
};

export type TranslationsData = {
  readonly entityId: string;
  readonly supportedLocales: readonly string[];
  readonly missingLocales: readonly string[];
  readonly translations: readonly TranslationEntry[];
};

export type SaveTranslationsResult = {
  readonly failures: readonly { readonly locale: string; readonly message: string }[];
};

const ID_KEY: Record<TranslatableEntity, string> = {
  courses: 'courseId',
  lessons: 'lessonId',
  chapters: 'chapterId',
};

const SINGULAR: Record<TranslatableEntity, string> = {
  courses: 'course',
  lessons: 'lesson',
  chapters: 'chapter',
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function decodeEntry(value: unknown): TranslationEntry {
  if (!isObject(value) || typeof value.locale !== 'string' || typeof value.title !== 'string') {
    throw new Error('Invalid translation response shape.');
  }
  return {
    locale: value.locale,
    title: value.title,
    description: typeof value.description === 'string' ? value.description : null,
  };
}

function decodeStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function decodeTranslations(entity: TranslatableEntity) {
  return (value: unknown): TranslationsData => {
    const idKey = ID_KEY[entity];
    if (!isObject(value) || typeof value[idKey] !== 'string' || !Array.isArray(value.translations)) {
      throw new Error(`Invalid ${SINGULAR[entity]} translations response shape.`);
    }
    return {
      entityId: value[idKey] as string,
      supportedLocales: decodeStrings(value.supportedLocales),
      missingLocales: decodeStrings(value.missingLocales),
      translations: value.translations.map(decodeEntry),
    };
  };
}

function decodeDeleted(value: unknown): { readonly locale: string } {
  if (!isObject(value) || typeof value.locale !== 'string') {
    throw new Error('Invalid translation delete response shape.');
  }
  return { locale: value.locale };
}

export function translationsPath(entity: TranslatableEntity, id: string, locale?: string): string {
  const base = `/curriculum/${entity}/${encodeURIComponent(id)}/translations`;
  return locale ? `${base}/${encodeURIComponent(locale)}` : base;
}

export async function fetchTranslations(
  entity: TranslatableEntity,
  token: string,
  id: string,
): Promise<TranslationsData> {
  const envelope = await adminApiClient.get<TranslationsData>(
    translationsPath(entity, id),
    decodeTranslations(entity),
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export async function saveTranslation(
  entity: TranslatableEntity,
  token: string,
  id: string,
  locale: string,
  payload: TranslationInput,
): Promise<TranslationEntry> {
  const envelope = await adminApiClient.put<TranslationEntry>(
    translationsPath(entity, id, locale),
    decodeEntry,
    { headers: { authorization: `Bearer ${token}` }, body: payload },
  );
  return envelope.data;
}

export async function deleteTranslation(
  entity: TranslatableEntity,
  token: string,
  id: string,
  locale: string,
): Promise<void> {
  await adminApiClient.delete<{ readonly locale: string }>(
    translationsPath(entity, id, locale),
    decodeDeleted,
    { headers: { authorization: `Bearer ${token}` } },
  );
}

export async function saveTranslations(
  entity: TranslatableEntity,
  token: string,
  id: string,
  translations: Readonly<Record<string, TranslationInput>>,
): Promise<SaveTranslationsResult> {
  const failures: { locale: string; message: string }[] = [];
  for (const [locale, payload] of Object.entries(translations)) {
    try {
      await saveTranslation(entity, token, id, locale, payload);
    } catch (err) {
      failures.push({ locale, message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
  return { failures };
}
