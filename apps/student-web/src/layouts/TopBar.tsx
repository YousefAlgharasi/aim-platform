import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchUnreadCount } from '../features/notifications/notificationsApi';
import { NotificationBell } from './NotificationBell';
import { TourHelpButton } from '../features/tour/TourHelpButton';
import { StreakBadge, refreshEngagement, useEngagement } from '../interaction';

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

/** Lesson pages and the live AI lesson are full-screen on a phone: no app bar, they have their own back arrow. */
const HIDDEN_ON_MOBILE = /^\/(lessons|voice-teacher)\//;

export function TopBar() {
  const { pathname } = useLocation();

  const unread = useUnreadCount(pathname);
  // Streak from the shared engagement store, refreshed on every navigation so it moves after a lesson is finished.
  const { summary } = useEngagement();
  useEffect(() => { void refreshEngagement(); }, [pathname]);

  return (
    <header className={`${HIDDEN_ON_MOBILE.test(pathname) ? 'max-md:hidden ' : ''}sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-14 shrink-0 border-b rounded-b-3xl md:rounded-none shadow-[0_2px_9px_rgba(0,0,0,0.15)] md:shadow-[0_1px_4px_rgba(0,0,0,0.06)] backdrop-blur-md bg-page/90 border-line`}>
      <div className="flex items-center gap-2.5 justify-self-start min-w-0">
        <span className="text-xl font-bold leading-none tracking-tight text-ink rtl:tracking-normal md:hidden">AIM</span>
      </div>

      <div className="flex items-center gap-2 justify-self-end ms-auto">
        <StreakBadge summary={summary} />
        <TourHelpButton />
        <NotificationBell unread={unread} />
      </div>
    </header>
  );
}
