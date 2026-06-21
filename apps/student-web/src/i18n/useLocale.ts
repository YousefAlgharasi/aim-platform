import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

export type Locale = 'en' | 'ar';

export function useLocale(): {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  formatDate: (date: string | Date) => string;
  formatNumber: (num: number) => string;
} {
  const { user } = useAuth();
  const locale: Locale = (user?.locale as Locale) || 'en';

  return useMemo(() => ({
    locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    formatDate: (date: string | Date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
    },
    formatNumber: (num: number) => {
      return num.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US');
    },
  }), [locale]);
}
