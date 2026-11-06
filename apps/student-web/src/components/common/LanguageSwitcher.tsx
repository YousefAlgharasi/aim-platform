import { useI18n } from '../../i18n/I18nContext';
import { PILL } from './ThemeToggleButton';

/** EN ⇄ عربي toggle. Shows the language you would switch TO. */
export function LanguageSwitcher({ className = '', variant = 'compact', showLabel = true }: { className?: string; variant?: 'compact' | 'pill'; showLabel?: boolean }) {
  const { locale, setLocale } = useI18n();
  const next = locale === 'ar' ? 'en' : 'ar';
  if (variant === 'pill') {
    return (
      <button type="button" onClick={() => setLocale(next)} lang={next} aria-label={next === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'} title={next === 'ar' ? 'العربية' : 'English'} className={`${PILL} ${className}`}>
        <svg className="size-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        {showLabel && <span className="truncate">{next === 'ar' ? 'العربية' : 'English'}</span>}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      lang={next}
      aria-label={next === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'}
      title={next === 'ar' ? 'العربية' : 'English'}
      className={`h-9 min-w-9 px-2.5 rounded-xl flex items-center justify-center border-none cursor-pointer text-[13px] font-bold transition-colors bg-control text-ink-soft hover:bg-brand-soft hover:text-brand-ink ${className}`}
    >
      {next === 'ar' ? 'عربي' : 'EN'}
    </button>
  );
}
