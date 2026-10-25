import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  fetchPreferences,
  updatePreference,
  fetchQuietHours,
  updateQuietHours,
  fetchReminders,
  setReminderStatus,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CATEGORIES,
  CHANNEL_LABELS,
  CATEGORY_LABELS,
  type NotificationChannel,
  type NotificationCategory,
  type NotificationPreference,
  type QuietHours,
  type ReminderSchedule,
} from './notificationsApi';
import styles from './Notification.module.css';

const REMINDER_KIND_LABELS: Record<string, string> = {
  learning_plan: 'Learning plan',
  review: 'Review',
  deadline: 'Deadline',
  streak: 'Streak',
  custom: 'Custom',
};

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Normalise "22:00:00" (Postgres TIME) to "22:00" for <input type="time"> and the DTO. */
function hhmm(value: string | null | undefined, fallback: string): string {
  const m = /^(\d{2}):(\d{2})/.exec(value ?? '');
  return m ? `${m[1]}:${m[2]}` : fallback;
}

const prefKey = (channel: string, category: string) => `${channel}:${category}`;

export function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prefError, setPrefError] = useState('');
  const [savingPrefs, setSavingPrefs] = useState<Set<string>>(new Set());

  // Quiet hours
  const [quietLoading, setQuietLoading] = useState(true);
  const [quietLoadError, setQuietLoadError] = useState('');
  const [quietEnabled, setQuietEnabled] = useState(false);
  const [startTime, setStartTime] = useState('22:00');
  const [endTime, setEndTime] = useState('07:00');
  const [timezone, setTimezone] = useState(browserTimezone());
  const [savingQuiet, setSavingQuiet] = useState(false);
  const [quietStatus, setQuietStatus] = useState<{ variant: 'success' | 'error'; message: string } | null>(null);

  // Reminders
  const [reminders, setReminders] = useState<ReminderSchedule[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [remindersError, setRemindersError] = useState('');
  const [reminderActionError, setReminderActionError] = useState('');
  const [busyReminders, setBusyReminders] = useState<Set<string>>(new Set());

  const loadPrefs = useCallback(() => {
    setLoading(true);
    setError('');
    fetchPreferences()
      .then(setPrefs)
      .catch(err => setError(getErrorMessage(err, 'Failed to load preferences')))
      .finally(() => setLoading(false));
  }, []);

  const applyQuietHours = useCallback((qh: QuietHours | null) => {
    setQuietEnabled(!!qh);
    if (qh) {
      setStartTime(hhmm(qh.start_time, '22:00'));
      setEndTime(hhmm(qh.end_time, '07:00'));
      setTimezone(qh.timezone || browserTimezone());
    }
  }, []);

  const loadQuietHours = useCallback(() => {
    setQuietLoading(true);
    setQuietLoadError('');
    fetchQuietHours()
      .then(applyQuietHours)
      .catch(err => setQuietLoadError(getErrorMessage(err, 'Failed to load quiet hours')))
      .finally(() => setQuietLoading(false));
  }, [applyQuietHours]);

  const loadReminders = useCallback(() => {
    setRemindersLoading(true);
    setRemindersError('');
    fetchReminders()
      .then(setReminders)
      .catch(err => setRemindersError(getErrorMessage(err, 'Failed to load reminders')))
      .finally(() => setRemindersLoading(false));
  }, []);

  useEffect(() => {
    loadPrefs();
    loadQuietHours();
    loadReminders();
  }, [loadPrefs, loadQuietHours, loadReminders]);

  // Backend treats a missing preference row as enabled (NotificationPreferenceService.isEnabled).
  function isEnabled(channel: string, category: string): boolean {
    const match = prefs.find(p => p.channel === channel && p.category === category);
    return match ? match.enabled : true;
  }

  function togglePref(channel: NotificationChannel, category: NotificationCategory) {
    const key = prefKey(channel, category);
    if (savingPrefs.has(key)) return;
    const enabled = !isEnabled(channel, category);
    setPrefError('');
    setSavingPrefs(prev => new Set(prev).add(key));
    updatePreference(channel, category, enabled)
      .then(saved => {
        setPrefs(prev => {
          const others = prev.filter(p => !(p.channel === saved.channel && p.category === saved.category));
          return [...others, saved];
        });
      })
      .catch(err => setPrefError(getErrorMessage(err, 'Could not update preference')))
      .finally(() => setSavingPrefs(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      }));
  }

  async function saveQuietHours(e: FormEvent) {
    e.preventDefault();
    setSavingQuiet(true);
    setQuietStatus(null);
    try {
      const saved = await updateQuietHours({
        enabled: quietEnabled,
        startTime: hhmm(startTime, '22:00'),
        endTime: hhmm(endTime, '07:00'),
        timezone: timezone.trim() || browserTimezone(),
      });
      applyQuietHours(saved ?? null);
      setQuietStatus({ variant: 'success', message: quietEnabled ? 'Quiet hours saved.' : 'Quiet hours turned off.' });
    } catch (err) {
      setQuietStatus({ variant: 'error', message: getErrorMessage(err, 'Could not save quiet hours') });
    } finally {
      setSavingQuiet(false);
    }
  }

  function reminderAction(schedule: ReminderSchedule, action: 'pause' | 'resume' | 'cancel') {
    if (busyReminders.has(schedule.id)) return;
    if (action === 'cancel' && !window.confirm('Cancel this reminder? This cannot be undone.')) return;
    setReminderActionError('');
    setBusyReminders(prev => new Set(prev).add(schedule.id));
    setReminderStatus(schedule.id, action)
      .then(updated => setReminders(prev => prev.map(r => (r.id === updated.id ? updated : r))))
      .catch(err => setReminderActionError(getErrorMessage(err, `Could not ${action} reminder`)))
      .finally(() => setBusyReminders(prev => {
        const next = new Set(prev);
        next.delete(schedule.id);
        return next;
      }));
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={loadPrefs} />;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Notification Preferences</h1>
        <Link to="/notifications" className={styles.textLink}>Inbox</Link>
      </div>

      <Card>
        <div className={styles.prefSection}>
          <h2 className={styles.subtitle}>Channels</h2>
          <p className={styles.prefDesc}>
            Choose how you hear about each topic. Push notifications are delivered to the AIM mobile app.
          </p>
          {prefError && <Banner variant="error">{prefError}</Banner>}
          {NOTIFICATION_CATEGORIES.map(category => (
            <div key={category} className={styles.prefGroup}>
              <span className={styles.prefName}>{CATEGORY_LABELS[category] ?? category}</span>
              {NOTIFICATION_CHANNELS.map(channel => {
                const enabled = isEnabled(channel, category);
                const saving = savingPrefs.has(prefKey(channel, category));
                const label = `${CHANNEL_LABELS[channel]} notifications for ${CATEGORY_LABELS[category] ?? category}`;
                return (
                  <div key={channel} className={styles.prefItem}>
                    <span className={styles.prefDesc}>{CHANNEL_LABELS[channel]}</span>
                    <button
                      type="button"
                      className={`${styles.toggle} ${enabled ? styles.toggleActive : ''}`}
                      onClick={() => togglePref(channel, category)}
                      role="switch"
                      aria-checked={enabled}
                      aria-label={label}
                      disabled={saving}
                    >
                      <span className={styles.toggleKnob} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <form className={styles.prefSection} onSubmit={saveQuietHours}>
          <h2 className={styles.subtitle}>Quiet hours</h2>
          {quietLoading ? (
            <LoadingSpinner />
          ) : quietLoadError ? (
            <>
              <Banner variant="error">{quietLoadError}</Banner>
              <div><Button type="button" variant="ghost" size="sm" onClick={loadQuietHours}>Retry</Button></div>
            </>
          ) : (
            <>
              <p className={styles.prefDesc}>Non-urgent notifications are held during this window.</p>
              {quietStatus && <Banner variant={quietStatus.variant}>{quietStatus.message}</Banner>}
              <div className={styles.prefItem}>
                <span className={styles.prefName}>Enable quiet hours</span>
                <button
                  type="button"
                  className={`${styles.toggle} ${quietEnabled ? styles.toggleActive : ''}`}
                  onClick={() => { setQuietEnabled(v => !v); setQuietStatus(null); }}
                  role="switch"
                  aria-checked={quietEnabled}
                  aria-label="Enable quiet hours"
                >
                  <span className={styles.toggleKnob} />
                </button>
              </div>
              <div className={styles.timeRow}>
                <label className={styles.fieldLabel}>
                  From
                  <input
                    type="time"
                    className={styles.fieldInput}
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    disabled={!quietEnabled}
                    required
                  />
                </label>
                <label className={styles.fieldLabel}>
                  To
                  <input
                    type="time"
                    className={styles.fieldInput}
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    disabled={!quietEnabled}
                    required
                  />
                </label>
                <label className={styles.fieldLabel}>
                  Timezone
                  <input
                    type="text"
                    className={styles.fieldInput}
                    value={timezone}
                    maxLength={64}
                    onChange={e => setTimezone(e.target.value)}
                    disabled={!quietEnabled}
                    required
                  />
                </label>
              </div>
              <div>
                <Button type="submit" size="sm" disabled={savingQuiet}>
                  {savingQuiet ? 'Saving…' : 'Save quiet hours'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Card>

      <Card>
        <div className={styles.prefSection}>
          <h2 className={styles.subtitle}>Reminders</h2>
          {remindersLoading ? (
            <LoadingSpinner />
          ) : remindersError ? (
            <>
              <Banner variant="error">{remindersError}</Banner>
              <div><Button variant="ghost" size="sm" onClick={loadReminders}>Retry</Button></div>
            </>
          ) : reminders.length === 0 ? (
            <p className={styles.prefDesc}>You have no scheduled reminders.</p>
          ) : (
            <>
              {reminderActionError && <Banner variant="error">{reminderActionError}</Banner>}
              {reminders.map(r => {
                const busy = busyReminders.has(r.id);
                const finished = r.status === 'cancelled' || r.status === 'completed';
                return (
                  <div key={r.id} className={styles.prefItem}>
                    <div className={styles.prefLabel}>
                      <span className={styles.prefName}>
                        {REMINDER_KIND_LABELS[r.kind] ?? r.kind}
                        <span className={styles.statusPill}>{r.status}</span>
                      </span>
                      <span className={styles.prefDesc}>
                        {r.cadence}
                        {!finished && r.next_run_at && ` · next ${new Date(r.next_run_at).toLocaleString()}`}
                      </span>
                    </div>
                    {!finished && (
                      <div className={styles.notifActions}>
                        {r.status === 'paused' ? (
                          <Button variant="secondary" size="sm" onClick={() => reminderAction(r, 'resume')} disabled={busy}>Resume</Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => reminderAction(r, 'pause')} disabled={busy}>Pause</Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => reminderAction(r, 'cancel')} disabled={busy}>Cancel</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
