import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../features/profile/profileApi';
import {
  LOCALE_STORAGE_KEY,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
  plural,
  setCurrentLocale,
  translate,
  type Locale,
  type TParams,
} from './index';

interface I18nState {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: (text: string, params?: TParams) => string;
  /** Switch language: remembered in this browser and saved on the profile when signed in. */
  setLocale: (locale: Locale) => void;
  formatNumber: typeof formatNumber;
  formatDate: typeof formatDate;
  formatTime: typeof formatTime;
  formatDateTime: typeof formatDateTime;
  plural: typeof plural;
}

const I18nContext = createContext<I18nState | null>(null);

function readStored(): Locale | null {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    return v === 'ar' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

function browserLocale(): Locale {
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function apply(locale: Locale) {
  setCurrentLocale(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

// Resolve before the first render so the page never flashes the wrong language/direction.
const initialLocale: Locale = readStored() ?? browserLocale();
apply(initialLocale);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Follow the saved profile language unless this browser has an explicit choice.
  useEffect(() => {
    if (readStored()) return;
    if (user?.locale === 'ar' || user?.locale === 'en') {
      apply(user.locale);
      setLocaleState(user.locale);
    }
  }, [user?.locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
        // Not persisted; applies for this session.
      }
      apply(next);
      setLocaleState(next);
      if (user) {
        // Best effort: keep the profile (and the mobile app) in the same language.
        updateProfile({ preferredLanguage: next })
          .then(() => refreshUser())
          .catch(() => undefined);
      }
    },
    [user, refreshUser],
  );

  const value = useMemo<I18nState>(
    () => ({
      locale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      t: (text, params) => translate(locale, text, params),
      setLocale,
      formatNumber,
      formatDate,
      formatTime,
      formatDateTime,
      plural,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider');
  return ctx;
}
