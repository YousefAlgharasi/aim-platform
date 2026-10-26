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
      className={`h-9 min-w-9 px-2.5 rounded-xl flex items-center justify-center border-none cursor-pointer text-[13px] font-bold transition-colors bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-indigo-400 ${className}`}
    >
      {next === 'ar' ? 'عربي' : 'EN'}
    </button>
  );
}
