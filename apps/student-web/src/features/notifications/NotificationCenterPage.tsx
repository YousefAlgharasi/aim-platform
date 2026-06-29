import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import type { ApiError } from '../../types';
import styles from './Notification.module.css';

interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: string;
  template_id: string;
  category: string;
  channel: string;
  payload: { title?: string; body?: string; [key: string]: unknown };
  state: string;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchNotifications() {
    setLoading(true);
    setError('');
    apiClient.get<Notification[]>('/api/v1/notifications/inbox')
      .then(n => setNotifications(n))
      .catch((err: ApiError) => setError(err.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchNotifications(); }, []);

  function markRead(eventId: string) {
    apiClient.patch(`/api/v1/notifications/inbox/${eventId}/read`, {})
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === eventId ? { ...n, state: 'read', read_at: new Date().toISOString() } : n));
      })
      .catch(() => {});
  }

  function dismiss(eventId: string) {
    apiClient.patch(`/api/v1/notifications/inbox/${eventId}/dismiss`, {})
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== eventId));
      })
      .catch(() => {});
  }

  function markAllRead() {
    const unread = notifications.filter(n => !n.read_at);
    Promise.all(unread.map(n => apiClient.patch(`/api/v1/notifications/inbox/${n.id}/read`, {})))
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, state: 'read', read_at: n.read_at ?? new Date().toISOString() })));
      })
      .catch(() => {});
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;
  if (notifications.length === 0) {
    return <EmptyState title="No notifications" message="You're all caught up!" />;
  }

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Notifications</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
          {unreadCount > 0 && (
            <>
              <span className={styles.unreadBadge}>{unreadCount}</span>
              <Button variant="secondary" onClick={markAllRead}>Mark all read</Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {notifications.map(notif => {
          const isRead = !!notif.read_at;
          const title = notif.payload?.title ?? notif.category;
          const body = notif.payload?.body ?? '';
          return (
            <div
              key={notif.id}
              className={`${styles.notifItem} ${!isRead ? styles.notifUnread : ''}`}
              onClick={() => !isRead && markRead(notif.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && !isRead && markRead(notif.id)}
            >
              <span className={`${styles.notifDot} ${isRead ? styles.notifDotRead : ''}`} aria-hidden="true" />
              <div className={styles.notifContent}>
                <span className={styles.notifTitle}>{title}</span>
                <span className={styles.notifBody}>{body}</span>
                <span className={styles.notifTime}>{new Date(notif.created_at).toLocaleString()}</span>
              </div>
              <div className={styles.notifActions}>
                <button
                  className={styles.dismissBtn}
                  onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                  aria-label={`Dismiss ${title}`}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
