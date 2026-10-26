import { ar } from './ar';

export type Locale = 'en' | 'ar';

export const LOCALE_STORAGE_KEY = 'aim-locale';

let currentLocale: Locale = 'en';

/** Used by the provider; helpers outside React read the active locale through `getLocale()`. */
export function setCurrentLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export type TParams = Record<string, string | number>;

/**
 * Translate an English source string. English text is the key: when the active language is Arabic and a
 * translation exists in `src/i18n/ar/*`, it is returned; otherwise the English text is used unchanged.
 * `{name}` placeholders are filled from `params`.
 */
export function translate(locale: Locale, text: string, params?: TParams): string {
  const base = locale === 'ar' ? ar[text] ?? text : text;
  if (!params) return base;
  return base.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/** Translate with the active locale (for helpers that run outside a component). */
export function t(text: string, params?: TParams): string {
  return translate(currentLocale, text, params);
}

function bcp47(locale: Locale): string {
  // Latin digits keep numbers, scores and dates easy to compare across both languages.
  return locale === 'ar' ? 'ar-u-nu-latn' : 'en-US';
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return value.toLocaleString(bcp47(currentLocale), options);
}

export function formatDate(value: string | number | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(bcp47(currentLocale), options ?? { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTime(value: string | number | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(bcp47(currentLocale), options ?? { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(value: string | number | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(
    bcp47(currentLocale),
    options ?? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
  );
}

/** Arabic has no "1 lessons": pick the right plural form. Provide `one`/`other` (and optionally `two`/`few`). */
export function plural(
  count: number,
  forms: { one: string; other: string; two?: string; few?: string },
): string {
  if (currentLocale === 'ar') {
    if (count === 1) return forms.one;
    if (count === 2 && forms.two) return forms.two;
    const mod100 = count % 100;
    if (forms.few && mod100 >= 3 && mod100 <= 10) return forms.few;
    return forms.other;
  }
  return count === 1 ? forms.one : forms.other;
}
