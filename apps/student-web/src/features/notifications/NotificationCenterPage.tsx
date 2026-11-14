import { useState, useEffect, useCallback } from 'react';
import { FilterPills } from '../../components/common/FilterPills';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { ListSkeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  fetchInbox,
  markNotificationRead,
  dismissNotification,
  isUnread,
  categoryLabel,
  safeInternalLink,
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
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
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

  if (loading) return <ListSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadFirstPage} />;

  const live = notifications.filter(n => !n.dismissed_at && n.state !== 'dismissed');
  const unreadCount = live.filter(isUnread).length;
  const visible = filter === 'unread' ? live.filter(isUnread) : live;
  // Group by calendar day: Today / Yesterday / Earlier.
  const dayKey = (iso: string) => {
    const d = new Date(iso); const n = new Date();
    const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diff = Math.round((start(n) - start(d)) / 86_400_000);
    return diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday' : 'Earlier';
  };
  const groups = (['Today', 'Yesterday', 'Earlier'] as const)
    .map((g) => ({ title: g, items: visible.filter((n) => dayKey(n.created_at) === g) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('Notifications')}
        action={<Link to="/notifications/preferences" className={textLinkCls}>{t('Preferences')}</Link>}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills label={t('Filter notifications')} value={filter} onChange={setFilter}
          options={[{ key: 'all', label: t('All') }, { key: 'unread', label: t('Unread ({n})', { n: unreadCount }) }] as const} />
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead} disabled={markingAll}>
            {markingAll ? t('Marking…') : t('Mark all read')}
          </Button>
        )}
      </div>

      {actionError && <Banner variant="error">{actionError}</Banner>}

      {visible.length === 0 ? (
        <EmptyState
          title={t('No notifications')}
          message={t("You're all caught up!")}
          actionLabel={hasMore ? t('Load older notifications') : undefined}
          onAction={hasMore ? loadMore : undefined}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
          <section key={group.title} className="flex flex-col gap-2.5" aria-label={t(group.title)}>
            <h2 className="m-0 px-1 text-xs font-semibold text-ink-muted">{t(group.title)}</h2>
          {group.items.map(notif => {
            const unread = isUnread(notif);
            const busy = busyIds.has(notif.id);
            const title = textOf(notif.payload?.title) || categoryLabel(notif.category);
            const body = textOf(notif.payload?.body);
            const expanded = expandedId === notif.id;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-4 rounded-2xl ring-1 cursor-pointer transition-colors ${
                  unread
                    ? 'bg-brand-soft/70 ring-brand-line'
                    : 'bg-surface ring-line hover:bg-surface-sunken dark:hover:bg-surface-muted/60'
                }`}
                onClick={() => open(notif)}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                aria-label={unread ? t('Unread notification: {title}', { title }) : title}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(notif); } }}
              >
                <span
                  className={`mt-1.5 size-2.5 rounded-full shrink-0 ${unread ? 'bg-brand' : 'bg-surface-strong'}`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className={`text-sm text-ink ${unread ? 'font-semibold' : 'font-semibold'}`}>{title}</span>
                  {body && (
                    <span className={`text-sm text-ink-muted leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{body}</span>
                  )}
                  <span className="text-xs font-semibold text-ink-muted">
                    {categoryLabel(notif.category)} · {formatDateTime(notif.created_at)}
                  </span>
                  {safeInternalLink(notif.payload?.link) && (
                    <Link
                      to={safeInternalLink(notif.payload?.link) as string}
                      onClick={e => e.stopPropagation()}
                      className="mt-1 inline-flex w-fit items-center rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white no-underline hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {t('Go to Improve')}
                    </Link>
                  )}
                </div>
                <button
                  type="button"
                  className="size-10 -m-2 shrink-0 rounded-full flex items-center justify-center border-none bg-transparent text-ink-muted hover:text-ink-soft hover:bg-surface-muted cursor-pointer text-xl disabled:opacity-50"
                  onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                  disabled={busy}
                  aria-label={t('Dismiss {title}', { title })}
                >
                  ×
                </button>
              </div>
            );
          })}
          </section>
          ))}
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
