import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { BackButton } from '../components/common/BackButton';
import { fetchUnreadCount } from '../features/notifications/notificationsApi';
import { fetchEngagementSummary } from '../features/dashboard/dashboardApi';
import { FlameIcon } from '../components/common/Icons';

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

/** Current day streak, refreshed on every navigation so it moves after a lesson is finished. */
function useStreakDays(pathname: string): number | null {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchEngagementSummary()
      .then((s) => !cancelled && setDays(s?.goal?.streakDays ?? null))
      // The streak is a convenience; never surface an error for it.
      .catch(() => !cancelled && setDays(null));
    return () => {
      cancelled = true;
    };
  }, [pathname]);
  return days;
}

export function TopBar() {
  const { pathname } = useLocation();
  const showBack = !ROOT_PATHS.has(pathname);

  const { t, formatNumber } = useI18n();
  const unread = useUnreadCount(pathname);
  const streakDays = useStreakDays(pathname);

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 h-16 shrink-0 border-b rounded-b-3xl shadow-sm bg-surface/80 border-line-subtle dark:bg-elevated/80">
      <div className="flex items-center gap-2.5 justify-self-start min-w-0">
        {showBack && <BackButton />}
        <div className={`size-8 rounded-xl bg-gradient-to-br from-brand to-secondary items-center justify-center text-white font-black text-xs shadow-md shadow-brand/20 md:hidden ${showBack ? 'hidden min-[420px]:flex' : 'flex'}`} aria-hidden="true">
          AIM
        </div>
        <span className="hidden sm:inline font-extrabold text-sm tracking-tight text-ink md:hidden">{t('AIM English')}</span>
      </div>

      <div className="justify-self-center">
        {streakDays != null && (
          <span
            role="img"
            aria-label={`${formatNumber(streakDays)} ${t('Day streak')}`}
            title={t('Day streak')}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-extrabold bg-warning-soft text-warning-ink dark:bg-warning/15"
          >
            <FlameIcon className="size-[18px] text-gold fill-gold" />
            <span aria-hidden="true">{formatNumber(streakDays)}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 justify-self-end">
        <Link
          to="/notifications"
          aria-label={unread > 0 ? t('Notifications, {n} unread', { n: unread }) : t('Notifications')}
          className="relative size-9 rounded-xl flex items-center justify-center no-underline transition-colors bg-control text-ink-soft hover:bg-brand-soft hover:text-brand-ink"
        >
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unread > 0 && (
            <span aria-hidden="true" className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold leading-[18px] text-center ring-2 ring-elevated">
              {unread > 9 ? '9+' : formatNumber(unread)}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
