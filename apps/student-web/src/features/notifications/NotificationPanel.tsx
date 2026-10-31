import { useState, useEffect, useRef, useCallback } from 'react';
import { getErrorMessage } from '../../api/client';
import { useI18n } from '../../i18n/I18nContext';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Banner } from '../../components/common/Banner';
import { BellEmptyIcon, CloseSmallIcon } from '../../components/common/Icons';
import {
  fetchInbox,
  markNotificationRead,
  dismissNotification,
  isUnread,
  categoryLabel,
  INBOX_PAGE_SIZE,
  type NotificationEvent,
} from './notificationsApi';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange?: (count: number) => void;
}

function textOf(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function NotificationPanel({ open, onClose, unreadCount, onUnreadCountChange }: NotificationPanelProps) {
  const { t, formatDateTime } = useI18n();
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(() => {
    setLoading(true);
    setError('');
    setActionError('');
    fetchInbox(INBOX_PAGE_SIZE, 0)
      .then(page => {
        setNotifications(page);
        const newUnreadCount = page.filter(n => isUnread(n) && !n.dismissed_at).length;
        onUnreadCountChange?.(newUnreadCount);
      })
      .catch(err => setError(getErrorMessage(err, t('Failed to load notifications'))))
      .finally(() => setLoading(false));
  }, [onUnreadCountChange, t]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        backdropRef.current &&
        backdropRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  function setBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function replace(updated: NotificationEvent) {
    setNotifications(prev => prev.map(n => (n.id === updated.id ? { ...n, ...updated } : n)));
    const visible = notifications.filter(n => !n.dismissed_at && n.state !== 'dismissed');
    const newUnreadCount = visible.filter(isUnread).length - (isUnread(updated) ? 0 : 1);
    onUnreadCountChange?.(Math.max(0, newUnreadCount));
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
      .then(updated => {
        replace(updated);
        const visible = notifications.filter(n => !n.dismissed_at && n.state !== 'dismissed');
        const remaining = visible.filter(n => n.id !== eventId && (isUnread(n) && !n.dismissed_at));
        onUnreadCountChange?.(remaining.length);
      })
      .catch(err => setActionError(getErrorMessage(err, t('Could not dismiss notification'))))
      .finally(() => setBusy(eventId, false));
  }

  async function markAllRead() {
    const visible = notifications.filter(n => !n.dismissed_at && n.state !== 'dismissed');
    const unread = visible.filter(isUnread);
    if (unread.length === 0) return;

    setMarkingAll(true);
    setActionError('');
    const results = await Promise.allSettled(unread.map(n => markNotificationRead(n.id)));
    results.forEach(r => {
      if (r.status === 'fulfilled') replace(r.value);
    });
    if (results.some(r => r.status === 'rejected')) {
      setActionError(t('Some notifications could not be marked as read. Please try again.'));
    }
    setMarkingAll(false);
    onUnreadCountChange?.(0);
  }

  if (!open) return null;

  const visible = notifications.filter(n => !n.dismissed_at && n.state !== 'dismissed');
  const unreadInPanel = visible.filter(isUnread).length;

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="fixed top-16 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl max-h-[480px] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white m-0">
              {t('Notifications')}
            </h2>
            {unreadInPanel > 0 && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {unreadInPanel} {t('unread')}
              </span>
            )}
          </div>
          {unreadInPanel > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              disabled={markingAll}
              className="text-xs"
            >
              {markingAll ? t('Marking…') : t('Mark all read')}
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-5">
              <Banner variant="error">{error}</Banner>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="text-slate-300 dark:text-slate-600 mb-3">
                <BellEmptyIcon className="size-12" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                {t("You're all caught up!")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('No new notifications')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0 divide-y divide-slate-100 dark:divide-slate-700">
              {visible.map(notif => {
                const unread = isUnread(notif);
                const busy = busyIds.has(notif.id);
                const title = textOf(notif.payload?.title) || categoryLabel(notif.category);
                const body = textOf(notif.payload?.body);

                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-5 py-3 transition-colors ${
                      unread
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/20'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span
                      className={`mt-1 size-2 rounded-full shrink-0 ${unread ? 'bg-[#4F46E5]' : 'bg-transparent'}`}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span
                        className={`text-xs leading-tight ${
                          unread ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-700 dark:text-slate-200 font-semibold'
                        }`}
                      >
                        {title}
                      </span>
                      {body && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                          {body}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        {formatDateTime(notif.created_at)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="size-8 -mr-2 shrink-0 rounded-lg flex items-center justify-center border-none bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors disabled:opacity-50"
                      onClick={() => dismiss(notif.id)}
                      disabled={busy}
                      aria-label={t('Dismiss')}
                      title={t('Dismiss')}
                    >
                      <CloseSmallIcon className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {actionError && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700">
              <Banner variant="error">{actionError}</Banner>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
