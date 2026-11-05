import { useI18n } from '../../i18n/I18nContext';
import { useTheme } from '../../state/ThemeContext';

/** Light/dark switch. The choice is remembered on this device (see ThemeContext). */
export function ThemeSwitch() {
  const { t } = useI18n();
  const { isDarkMode, setDarkMode } = useTheme();
  const label = t('Dark mode');

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-bold text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={isDarkMode}
        aria-label={label}
        onClick={() => setDarkMode(!isDarkMode)}
        className={`relative h-7 w-12 shrink-0 rounded-full border-none cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
          isDarkMode ? 'bg-brand dark:ring-1 dark:ring-inset dark:ring-brand-ink' : 'bg-line-strong'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 start-0.5 size-6 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
            isDarkMode ? 'ltr:translate-x-5 rtl:-translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}
