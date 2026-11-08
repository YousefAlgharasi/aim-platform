import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

interface BackButtonProps {
  /** Where to go when the tab has no earlier page in history (e.g. the page was opened from a link). */
  fallback?: string;
  /** Extra classes, e.g. for alignment. */
  className?: string;
}

/**
 * The app's one back-arrow button. Goes to the previous page; when this tab started on the
 * current page there is nothing to go back to, so it goes to `fallback` instead.
 * The arrow flips automatically in right-to-left layouts.
 */
export function BackButton({ fallback = '/', className = '' }: BackButtonProps) {
  const { t } = useI18n();
  const navigate = useNavigate();

  function goBack() {
    // BrowserRouter keeps an index in history.state; 0 means this tab started on this page.
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t('Go back')}
      title={t('Go back')}
      className={`size-11 shrink-0 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors bg-transparent ring-1 ring-line-strong text-ink-soft hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${className}`}
    >
      <svg aria-hidden="true" className="size-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
