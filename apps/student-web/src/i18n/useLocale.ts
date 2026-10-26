import { useI18n } from './I18nContext';

export type { Locale } from './index';

/** Kept for existing callers; prefer `useI18n()`. */
export function useLocale() {
  const { locale, dir, formatDate, formatNumber } = useI18n();
  return { locale, dir, formatDate, formatNumber };
}
