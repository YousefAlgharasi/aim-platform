import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
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
  CATEGORY_LABELS,
  INBOX_PAGE_SIZE,
  type NotificationEvent,
} from './notificationsApi';
import styles from './Notification.module.css';

function textOf(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function NotificationCenterPage() {
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
      .catch(err => setError(getErrorMessage(err, 'Failed to load notifications')))
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
      .catch(err => setActionError(getErrorMessage(err, 'Failed to load more notifications')))
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
      .catch(err => setActionError(getErrorMessage(err, 'Could not mark notification as read')))
      .finally(() => setBusy(eventId, false));
  }

  function dismiss(eventId: string) {
    if (busyIds.has(eventId)) return;
    setBusy(eventId, true);
    setActionError('');
    dismissNotification(eventId)
      .then(replace)
      .catch(err => setActionError(getErrorMessage(err, 'Could not dismiss notification')))
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
      setActionError('Some notifications could not be marked as read. Please try again.');
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
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Notifications</h1>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <>
              <span className={styles.unreadBadge} aria-label={`${unreadCount} unread`}>{unreadCount}</span>
              <Button variant="secondary" size="sm" onClick={markAllRead} disabled={markingAll}>
                {markingAll ? 'Marking…' : 'Mark all read'}
              </Button>
            </>
          )}
          <Link to="/notifications/preferences" className={styles.textLink}>Preferences</Link>
        </div>
      </div>

      {actionError && <Banner variant="error">{actionError}</Banner>}

      {visible.length === 0 ? (
        <EmptyState
          title="No notifications"
          message="You're all caught up!"
          actionLabel={hasMore ? 'Load older notifications' : undefined}
          onAction={hasMore ? loadMore : undefined}
        />
      ) : (
        <div className={styles.list}>
          {visible.map(notif => {
            const unread = isUnread(notif);
            const busy = busyIds.has(notif.id);
            const title = textOf(notif.payload?.title) || CATEGORY_LABELS[notif.category] || notif.category;
            const body = textOf(notif.payload?.body);
            const expanded = expandedId === notif.id;
            return (
              <div
                key={notif.id}
                className={`${styles.notifItem} ${unread ? styles.notifUnread : ''}`}
                onClick={() => open(notif)}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                aria-label={unread ? `Unread notification: ${title}` : title}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(notif); } }}
              >
                <span className={`${styles.notifDot} ${unread ? '' : styles.notifDotRead}`} aria-hidden="true" />
                <div className={styles.notifContent}>
                  <span className={`${styles.notifTitle} ${unread ? styles.notifTitleUnread : ''}`}>{title}</span>
                  {body && (
                    <span className={`${styles.notifBody} ${expanded ? styles.notifBodyExpanded : ''}`}>{body}</span>
                  )}
                  <span className={styles.notifTime}>
                    {CATEGORY_LABELS[notif.category] ?? notif.category} · {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
                <div className={styles.notifActions}>
                  <button
                    className={styles.dismissBtn}
                    onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                    disabled={busy}
                    aria-label={`Dismiss ${title}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && visible.length > 0 && (
        <div className={styles.loadMore}>
          <Button variant="ghost" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
