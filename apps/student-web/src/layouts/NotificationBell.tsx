import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Popover } from '../components/common/Popover';
import { useI18n } from '../i18n/I18nContext';
import {
  categoryLabel,
  fetchInbox,
  isUnread,
  type NotificationEvent,
} from '../features/notifications/notificationsApi';

const PREVIEW_COUNT = 4;

function textOf(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** The latest few notifications, loaded each time the popover opens. */
function NotificationPreview({ onNavigate }: { onNavigate: () => void }) {
  const { t, formatDate, formatTime } = useI18n();
  const [items, setItems] = useState<NotificationEvent[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchInbox(PREVIEW_COUNT + 4, 0)
      .then((rows) => {
        if (cancelled) return;
        setItems(rows.filter((n) => !n.dismissed_at && n.state !== 'dismissed').slice(0, PREVIEW_COUNT));
      })
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, []);

  const when = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const sameDay = d.toDateString() === new Date().toDateString();
    return sameDay ? formatTime(d, { hour: '2-digit', minute: '2-digit' }) : formatDate(d, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-3">
      {!items && !failed && (
        <div className="flex flex-col gap-2" role="status" aria-label={t('Loading…')}>
          {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-strong motion-reduce:animate-none" />)}
        </div>
      )}
      {failed && <p className="m-0 text-sm text-ink-muted">{t('Could not load notifications right now.')}</p>}
      {items && items.length === 0 && <p className="m-0 text-sm text-ink-muted">{t("You're all caught up.")}</p>}
      {items && items.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {items.map((n) => {
            const title = textOf(n.payload?.title) || categoryLabel(n.category);
            const body = textOf(n.payload?.body);
            const unread = isUnread(n);
            return (
              <li key={n.id}>
                <Link
                  to="/notifications"
                  onClick={onNavigate}
                  className="flex items-start gap-2.5 rounded-xl p-2 no-underline transition-colors hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${unread ? 'bg-brand' : 'bg-transparent'}`} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-ink">{title}</span>
                    {body && <span className="line-clamp-2 text-xs text-ink-muted">{body}</span>}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-muted">{when(n.created_at)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Link to="/notifications" onClick={onNavigate} className="text-sm font-semibold text-brand-ink underline underline-offset-4">
        {t('View all notifications')}
      </Link>
    </div>
  );
}

/** Top-bar bell: shows the unread badge and opens a popover with the latest notifications (like the streak popover). */
export function NotificationBell({ unread }: { unread: number }) {
  const { t, formatNumber } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <Popover
      title={t('Notifications')}
      open={open}
      onClose={() => setOpen(false)}
      renderTrigger={(props) => (
        <button
          {...props}
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
          type="button"
          aria-label={unread > 0 ? t('Notifications, {n} unread', { n: unread }) : t('Notifications')}
          className="relative flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-ink-soft transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unread > 0 && (
            <span aria-hidden="true" className="absolute -top-1 -end-1 h-[18px] min-w-[18px] rounded-full bg-danger px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-elevated">
              {unread > 9 ? '9+' : formatNumber(unread)}
            </span>
          )}
        </button>
      )}
    >
      <NotificationPreview onNavigate={() => setOpen(false)} />
    </Popover>
  );
}
