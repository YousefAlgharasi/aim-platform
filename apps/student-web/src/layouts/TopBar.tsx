import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n/I18nContext';
import { fetchUnreadCount } from '../features/notifications/notificationsApi';

interface TopBarProps {
  /** Opens the navigation drawer (phones); the button sits beside the AIM logo. */
  onOpenMenu: () => void;
}

const ROOT_PATHS = new Set(['/', '/dashboard']);

/** Unread in-app notifications, refreshed on every navigation so the badge clears after the inbox is read. */
function useUnreadCount(pathname: string): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetchUnreadCount()
      .then((n) => !cancelled && setCount(n))
      // A badge is a convenience; never surface an error for it.
      .catch(() => !cancelled && setCount(0));
    return () => {
      cancelled = true;
    };
  }, [pathname]);
  return count;
}

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

  const { t, formatNumber } = useI18n();
  const unread = useUnreadCount(pathname);

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
            <svg aria-hidden="true" className="size-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className={`size-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20 md:hidden ${showBack ? 'hidden min-[420px]:flex' : 'flex'}`} aria-hidden="true">
          AIM
        </div>
        <span className="hidden sm:inline font-extrabold text-sm tracking-tight text-slate-900 dark:text-white md:hidden">{t('AIM English')}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/notifications"
          aria-label={unread > 0 ? t('Notifications, {n} unread', { n: unread }) : t('Notifications')}
          className="relative size-9 rounded-xl flex items-center justify-center no-underline transition-colors bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
        >
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unread > 0 && (
            <span aria-hidden="true" className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold leading-[18px] text-center ring-2 ring-white dark:ring-slate-900">
              {unread > 9 ? '9+' : formatNumber(unread)}
            </span>
          )}
        </Link>
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
