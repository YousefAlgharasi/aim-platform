import { useI18n } from '../../i18n/I18nContext';

/** EN ⇄ عربي toggle. Shows the language you would switch TO. */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const next = locale === 'ar' ? 'en' : 'ar';
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
