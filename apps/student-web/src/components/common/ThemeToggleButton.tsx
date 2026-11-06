import { useI18n } from '../../i18n/I18nContext';
import { useTheme } from '../../state/ThemeContext';

/** One-tap light/dark switch (sun in dark mode, moon in light mode). */
export function ThemeToggleButton({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const { isDarkMode, setDarkMode } = useTheme();
  const label = isDarkMode ? t('Switch to light mode') : t('Switch to dark mode');
  return (
    <button
      type="button"
      onClick={() => setDarkMode(!isDarkMode)}
      aria-label={label}
      title={label}
      className={`size-9 shrink-0 rounded-xl flex items-center justify-center border-none cursor-pointer transition-colors bg-control text-ink-soft hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${className}`}
    >
      {isDarkMode ? (
        <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
