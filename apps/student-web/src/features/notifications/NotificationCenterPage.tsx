import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  fetchInbox,
  markNotificationRead,
  dismissNotification,
  isUnread,
  categoryLabel,
  INBOX_PAGE_SIZE,
  type NotificationEvent,
} from './notificationsApi';
import { PageHeader, textLinkCls } from '../profile/ui';

function textOf(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function NotificationCenterPage() {
  const { t, formatDateTime } = useI18n();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadFirstPage = useCallback(() => {
    setLoading(true);
    setError('');
    setActionError('');
    fetchInbox(INBOX_PAGE_SIZE, 0)
      .then(page => {
        setNotifications(page);
        setFetchedCount(page.length);
        setHasMore(page.length === INBOX_PAGE_SIZE);
      })
      .catch(err => setError(getErrorMessage(err, t('Failed to load notifications'))))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadFirstPage(); }, [loadFirstPage]);

  function loadMore() {
    setLoadingMore(true);
    setActionError('');
    fetchInbox(INBOX_PAGE_SIZE, fetchedCount)
      .then(page => {
        setNotifications(prev => {
          const seen = new Set(prev.map(n => n.id));
          return [...prev, ...page.filter(n => !seen.has(n.id))];
        });
        setFetchedCount(c => c + page.length);
        setHasMore(page.length === INBOX_PAGE_SIZE);
      })
      .catch(err => setActionError(getErrorMessage(err, t('Failed to load more notifications'))))
      .finally(() => setLoadingMore(false));
  }

  function setBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev);
      if (busy) next.add(id); else next.delete(id);
      return next;
    });
  }

  function replace(updated: NotificationEvent) {
    setNotifications(prev => prev.map(n => (n.id === updated.id ? { ...n, ...updated } : n)));
  }

  function markRead(eventId: string) {
    if (busyIds.has(eventId)) return;
    setBusy(eventId, true);
    setActionError('');
    markNotificationRead(eventId)
      .then(replace)
      .catch(err => setActionError(getErrorMessage(err, t('Could not mark notification as read'))))
      .finally(() => setBusy(eventId, false));
  }

  function dismiss(eventId: string) {
    if (busyIds.has(eventId)) return;
    setBusy(eventId, true);
    setActionError('');
    dismissNotification(eventId)
      .then(replace)
      .catch(err => setActionError(getErrorMessage(err, t('Could not dismiss notification'))))
      .finally(() => setBusy(eventId, false));
  }

  async function markAllRead() {
    // No bulk endpoint exists; mark each loaded unread notification individually.
    const unread = notifications.filter(n => isUnread(n) && !n.dismissed_at);
    setMarkingAll(true);
    setActionError('');
    const results = await Promise.allSettled(unread.map(n => markNotificationRead(n.id)));
    results.forEach(r => { if (r.status === 'fulfilled') replace(r.value); });
    if (results.some(r => r.status === 'rejected')) {
      setActionError(t('Some notifications could not be marked as read. Please try again.'));
    }
    setMarkingAll(false);
  }

  function open(notif: NotificationEvent) {
    setExpandedId(prev => (prev === notif.id ? null : notif.id));
    if (isUnread(notif)) markRead(notif.id);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={loadFirstPage} />;

  const visible = notifications.filter(n => !n.dismissed_at && n.state !== 'dismissed');
  const unreadCount = visible.filter(isUnread).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow={t('Inbox')}
        title={t('Notifications')}
        action={<Link to="/notifications/preferences" className={textLinkCls}>{t('Preferences')}</Link>}
      />

      {unreadCount > 0 && (
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-[#4F46E5] text-white text-xs font-extrabold"
            aria-label={t('{count} unread', { count: unreadCount })}
          >
            {unreadCount}
          </span>
          <Button variant="secondary" size="sm" onClick={markAllRead} disabled={markingAll}>
            {markingAll ? t('Marking…') : t('Mark all read')}
          </Button>
        </div>
      )}

      {actionError && <Banner variant="error">{actionError}</Banner>}

      {visible.length === 0 ? (
        <EmptyState
          title={t('No notifications')}
          message={t("You're all caught up!")}
          actionLabel={hasMore ? t('Load older notifications') : undefined}
          onAction={hasMore ? loadMore : undefined}
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {visible.map(notif => {
            const unread = isUnread(notif);
            const busy = busyIds.has(notif.id);
            const title = textOf(notif.payload?.title) || categoryLabel(notif.category);
            const body = textOf(notif.payload?.body);
            const expanded = expandedId === notif.id;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-4 rounded-2xl ring-1 shadow-sm cursor-pointer transition-colors ${
                  unread
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 ring-indigo-100 dark:ring-indigo-900/60'
                    : 'bg-white dark:bg-slate-800 ring-[#E2E8F0] dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
                onClick={() => open(notif)}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                aria-label={unread ? t('Unread notification: {title}', { title }) : title}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(notif); } }}
              >
                <span
                  className={`mt-1.5 size-2.5 rounded-full shrink-0 ${unread ? 'bg-[#4F46E5]' : 'bg-slate-300 dark:bg-slate-600'}`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className={`text-sm text-slate-900 dark:text-white ${unread ? 'font-extrabold' : 'font-semibold'}`}>{title}</span>
                  {body && (
                    <span className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{body}</span>
                  )}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {categoryLabel(notif.category)} · {formatDateTime(notif.created_at)}
                  </span>
                </div>
                <button
                  type="button"
                  className="size-10 -m-2 shrink-0 rounded-xl flex items-center justify-center border-none bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-xl disabled:opacity-50"
                  onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                  disabled={busy}
                  aria-label={t('Dismiss {title}', { title })}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && visible.length > 0 && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? t('Loading…') : t('Load more')}
          </Button>
        </div>
      )}
    </div>
  );
}
