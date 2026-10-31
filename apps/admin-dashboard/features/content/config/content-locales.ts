export type ContentLocaleDirection = 'ltr' | 'rtl';

export type ContentLocaleMeta = {
  readonly code: string;
  readonly label: string;
  readonly nativeLabel: string;
  readonly dir: ContentLocaleDirection;
};

export type TranslatableFieldLabels = {
  readonly title: string;
  readonly description: string;
  readonly titlePlaceholder?: string;
  readonly descriptionPlaceholder?: string;
};

export const DEFAULT_CONTENT_LOCALE = 'en';

export const CONTENT_LOCALES: readonly ContentLocaleMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
];

export const CONTENT_LOCALE_CODES: readonly string[] = CONTENT_LOCALES.map((l) => l.code);

export const COURSE_FIELD_LABELS: Readonly<Record<string, TranslatableFieldLabels>> = {
  en: {
    title: 'Course Title',
    description: 'Course Description',
    titlePlaceholder: 'e.g. English for Beginners',
    descriptionPlaceholder: 'Brief summary of this course.',
  },
  ar: {
    title: 'عنوان الدورة',
    description: 'وصف الدورة',
    titlePlaceholder: 'مثال: الإنجليزية للمبتدئين',
    descriptionPlaceholder: 'ملخص موجز لهذه الدورة.',
  },
};

const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);

export function getLocaleMeta(code: string): ContentLocaleMeta {
  const known = CONTENT_LOCALES.find((l) => l.code === code);
  if (known) return known;
  const base = code.split('-')[0].toLowerCase();
  return {
    code,
    label: code.toUpperCase(),
    nativeLabel: code.toUpperCase(),
    dir: RTL_LANGUAGES.has(base) ? 'rtl' : 'ltr',
  };
}

export function missingContentLocales(
  available: readonly string[] | undefined,
  supported: readonly string[] = CONTENT_LOCALE_CODES,
): string[] {
  if (!available || available.length === 0) return [];
  return supported.filter((code) => !available.includes(code));
}

export const LESSON_FIELD_LABELS: Readonly<Record<string, TranslatableFieldLabels>> = {
  en: {
    title: 'Lesson Title',
    description: 'Lesson Description',
    titlePlaceholder: 'e.g. Past Simple Basics',
    descriptionPlaceholder: 'What this lesson covers.',
  },
  ar: {
    title: 'عنوان الدرس',
    description: 'وصف الدرس',
    titlePlaceholder: 'مثال: أساسيات الماضي البسيط',
    descriptionPlaceholder: 'ما يغطيه هذا الدرس.',
  },
};

export const CHAPTER_FIELD_LABELS: Readonly<Record<string, TranslatableFieldLabels>> = {
  en: {
    title: 'Chapter Title',
    description: 'Chapter Description',
    titlePlaceholder: 'e.g. Talking About the Past',
    descriptionPlaceholder: 'Brief summary of this chapter.',
  },
  ar: {
    title: 'عنوان الفصل',
    description: 'وصف الفصل',
    titlePlaceholder: 'مثال: الحديث عن الماضي',
    descriptionPlaceholder: 'ملخص موجز لهذا الفصل.',
  },
};
