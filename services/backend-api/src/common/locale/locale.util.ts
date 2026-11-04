import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale } from './locale.constants';

export function normalizeLocale(raw: unknown): SupportedLocale | null {
  if (typeof raw !== 'string') {
    return null;
  }

  const base = raw.trim().toLowerCase().split(/[-_]/)[0];

  return (SUPPORTED_LOCALES as readonly string[]).includes(base)
    ? (base as SupportedLocale)
    : null;
}

export function parseAcceptLanguage(header: unknown): SupportedLocale | null {
  const value = Array.isArray(header) ? header.join(',') : header;

  if (typeof value !== 'string' || value.length === 0 || value.length > 256) {
    return null;
  }

  const candidates = value
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const q = qParam === undefined ? 1 : Number(qParam.slice(2));
      return { tag, q: Number.isFinite(q) ? q : 0, index };
    })
    .filter((candidate) => candidate.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate.tag);
    if (locale !== null) {
      return locale;
    }
  }

  return null;
}

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveRequestedLocale(
  queryValue: unknown,
  acceptLanguage: unknown,
): SupportedLocale | null {
  return normalizeLocale(queryValue) ?? parseAcceptLanguage(acceptLanguage);
}

export function localeOrDefault(locale: SupportedLocale | null | undefined): SupportedLocale {
  return locale ?? DEFAULT_LOCALE;
}
