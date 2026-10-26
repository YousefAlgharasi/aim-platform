import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../state/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';

interface TopBarProps {
  /** Opens the navigation drawer (phones); the button sits beside the AIM logo. */
  onOpenMenu: () => void;
}

const ROOT_PATHS = new Set(['/', '/dashboard']);

export function TopBar({ onOpenMenu }: TopBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showBack = !ROOT_PATHS.has(pathname);

  function goBack() {
    // BrowserRouter keeps an index in history.state; 0 means this tab started on this page.
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/', { replace: true });
  }

  const { isDarkMode, toggle } = useTheme();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md flex items-center justify-between gap-3 px-4 sm:px-6 h-16 shrink-0 border-b bg-white/80 border-slate-100 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="flex items-center gap-2.5">
        {showBack && (
          <button
            type="button"
            onClick={goBack}
            aria-label={t('Go back')}
            title={t('Go back')}
            className="size-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-colors bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
          >
            <svg className="size-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <button
            type="button"
            onClick={onOpenMenu}
            aria-label={t('Open navigation menu')}
            title={t('Open navigation menu')}
            className="md:hidden size-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-colors bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
        </button>
        <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20 md:hidden">
          AIM
        </div>
        <span className={`font-extrabold text-sm tracking-tight text-slate-900 dark:text-white md:hidden ${showBack ? 'hidden sm:inline' : ''}`}>{t('AIM English')}</span>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button
          type="button"
          onClick={toggle}
          title={isDarkMode ? t('Switch to light mode') : t('Switch to dark mode')}
          aria-label={isDarkMode ? t('Switch to light mode') : t('Switch to dark mode')}
          className={`size-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-colors ${
            isDarkMode ? 'bg-slate-800 text-indigo-300 hover:bg-slate-700' : 'bg-slate-100 text-amber-500 hover:bg-slate-200'
          }`}
        >
          {isDarkMode ? (
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          )}
        </button>
        <Link
          to="/profile"
          aria-label={t('Profile')}
          className="size-9 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-black text-xs no-underline hover:opacity-90 transition-opacity"
        >
          {user?.name?.charAt(0).toUpperCase() || '?'}
        </Link>
      </div>
    </header>
  );
}
