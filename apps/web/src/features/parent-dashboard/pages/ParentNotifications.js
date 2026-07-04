// P13-061/P13-062: Parent notification inbox UI.
//
// Renders the parent's own in-app notification inbox using only
// backend-supplied fields (title/body are rendered server-side from
// approved templates). This page never computes eligibility, delivery
// state, or read/unread status — it only requests mark-as-read/dismiss
// and reflects whatever the backend returns.

import { useEffect, useState } from 'react';
import {
  getNotificationInbox,
  markNotificationAsRead,
  dismissNotification,
} from '../api';
import { ParentCard, ParentBadge } from '../components';
import { ParentNotificationsShell } from '../notifications';
import ParentNotificationSettings from './ParentNotificationSettings';
import ParentDeadlineReminders from './ParentDeadlineReminders';
import './ParentPages.css';

const CATEGORY_LABELS = {
  learning_reminder: 'تذكير تعلم',
  deadline_reminder: 'تذكير موعد',
  progress_update: 'تحديث تقدم',
  assessment_result: 'نتيجة تقييم',
  parent_summary: 'ملخص للوالدين',
  system_alert: 'تنبيه نظام',
};

function ParentNotifications() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getNotificationInbox()
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data?.items || [];
        setEvents(items);
        setStatus(items.length > 0 ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMarkAsRead(eventId) {
    try {
      const updated = await markNotificationAsRead(eventId);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDismiss(eventId) {
    try {
      const updated = await dismissNotification(eventId);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
    } catch (err) {
      setError(err.message);
    }
  }

  const visibleEvents = events.filter((e) => !e.dismissedAt && !e.dismissed_at);

  const tabs = (
    <div className="parent-notifications__tabs" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'inbox'}
        className={`parent-btn${activeTab === 'inbox' ? ' parent-btn--primary' : ''}`}
        onClick={() => setActiveTab('inbox')}
      >
        صندوق الإشعارات
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'settings'}
        className={`parent-btn${activeTab === 'settings' ? ' parent-btn--primary' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        التفضيلات
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'deadlines'}
        className={`parent-btn${activeTab === 'deadlines' ? ' parent-btn--primary' : ''}`}
        onClick={() => setActiveTab('deadlines')}
      >
        تذكيرات المواعيد النهائية
      </button>
    </div>
  );

  if (activeTab === 'settings') {
    return (
      <div className="parent-notifications">
        {tabs}
        <ParentNotificationSettings />
      </div>
    );
  }

  if (activeTab === 'deadlines') {
    return (
      <div className="parent-notifications">
        {tabs}
        <ParentDeadlineReminders />
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="parent-notifications">
        {tabs}
        <ParentNotificationsShell status="loading" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="parent-notifications">
        {tabs}
        <ParentNotificationsShell status="error" errorMessage={error} />
      </div>
    );
  }

  if (status === 'empty' || visibleEvents.length === 0) {
    return (
      <div className="parent-notifications">
        {tabs}
        <ParentNotificationsShell
          status="empty"
          emptyMessage="لا توجد إشعارات بعد."
        />
      </div>
    );
  }

  return (
    <div className="parent-notifications">
      {tabs}
      <h2 className="parent-page__title">الإشعارات</h2>
      <div className="parent-notifications__list">
        {visibleEvents.map((event) => {
          const isUnread = !(event.readAt || event.read_at) && !(event.dismissedAt || event.dismissed_at);
          const category = event.category;
          return (
            <ParentCard key={event.id} title={event.title || 'إشعار'}>
              <div className="parent-notifications__meta">
                {category && (
                  <ParentBadge
                    label={CATEGORY_LABELS[category] || category}
                    variant="info"
                  />
                )}
                {isUnread && <ParentBadge label="غير مقروء" variant="warning" />}
              </div>
              {event.body && <p>{event.body}</p>}
              <div className="parent-notifications__actions">
                {isUnread && (
                  <button
                    type="button"
                    className="parent-btn parent-btn--primary"
                    onClick={() => handleMarkAsRead(event.id)}
                    aria-label={`تمييز الإشعار كمقروء: ${event.title || ''}`}
                  >
                    تمييز كمقروء
                  </button>
                )}
                <button
                  type="button"
                  className="parent-btn"
                  onClick={() => handleDismiss(event.id)}
                  aria-label={`إغلاق الإشعار: ${event.title || ''}`}
                >
                  إغلاق
                </button>
              </div>
            </ParentCard>
          );
        })}
      </div>
    </div>
  );
}

export default ParentNotifications;
