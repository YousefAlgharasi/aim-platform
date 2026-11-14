import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { tourForPath } from './tours';
import { TOUR_STATE_EVENT, hasSeenTour, requestTour } from './tourStore';

/** Top-bar "?" that replays the tour for the current page. Only shown on pages that have one; a dot marks a tour not yet taken. */
export function TourHelpButton() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [, refresh] = useState(0);
  useEffect(() => {
    const bump = () => refresh((n) => n + 1);
    window.addEventListener(TOUR_STATE_EVENT, bump);
    return () => window.removeEventListener(TOUR_STATE_EVENT, bump);
  }, []);

  const tour = tourForPath(pathname);
  if (!tour || !user) return null;
  const unseen = !hasSeenTour(user.id, tour.id);
  return (
    <button
      type="button"
      onClick={() => requestTour(tour.id)}
      aria-label={t('Take a tour of this page')}
      title={t('Take a tour of this page')}
      className="relative flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ink-soft transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" />
        <path d="M12 17h.01" />
      </svg>
      {unseen && <span aria-hidden="true" className="absolute end-1.5 top-1.5 size-2.5 rounded-full bg-brand ring-2 ring-page" />}
    </button>
  );
}
