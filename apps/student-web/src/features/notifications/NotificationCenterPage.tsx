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
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: string;
}

export function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchNotifications() {
    setLoading(true);
    setError('');
    apiClient.get<{ notifications: Notification[] }>('/notifications')
      .then(({ notifications: n }) => setNotifications(n))
      .catch((err: ApiError) => setError(err.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchNotifications(); }, []);

  function markRead(id: string) {
    apiClient.post(`/notifications/${id}/read`, {})
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      })
      .catch(() => {});
  }

  function dismiss(id: string) {
    apiClient.post(`/notifications/${id}/dismiss`, {})
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      })
      .catch(() => {});
  }

  function markAllRead() {
    apiClient.post('/notifications/read-all', {})
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      })
      .catch(() => {});
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;
  if (notifications.length === 0) {
    return <EmptyState title="No notifications" message="You're all caught up!" />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

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
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`${styles.notifItem} ${!notif.read ? styles.notifUnread : ''}`}
            onClick={() => !notif.read && markRead(notif.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && !notif.read && markRead(notif.id)}
          >
            <span className={`${styles.notifDot} ${notif.read ? styles.notifDotRead : ''}`} aria-hidden="true" />
            <div className={styles.notifContent}>
              <span className={styles.notifTitle}>{notif.title}</span>
              <span className={styles.notifBody}>{notif.body}</span>
              <span className={styles.notifTime}>{new Date(notif.createdAt).toLocaleString()}</span>
            </div>
            <div className={styles.notifActions}>
              <button
                className={styles.dismissBtn}
                onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                aria-label={`Dismiss ${notif.title}`}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
