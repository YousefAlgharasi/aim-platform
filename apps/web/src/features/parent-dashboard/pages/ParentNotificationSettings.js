// P13-063: Parent notification preferences/quiet hours UI.
//
// Toggle/save actions are requests only; the backend remains the final
// authority on notification eligibility and on whether quiet hours
// actually suppress a notification at send time.

import { useEffect, useState } from 'react';
import {
  getChannelPreferences,
  updateChannelPreference,
  getQuietHours,
  updateQuietHours,
} from '../api';
import { ParentCard, ParentLoadingState, ParentErrorState } from '../components';
import './ParentPages.css';

const CHANNELS = ['in_app', 'push', 'email'];
const CATEGORIES = [
  'learning_reminder',
  'deadline_reminder',
  'progress_update',
  'assessment_result',
  'parent_summary',
  'system_alert',
];

const CHANNEL_LABELS = {
  in_app: 'داخل التطبيق',
  push: 'إشعارات فورية',
  email: 'البريد الإلكتروني',
};

const CATEGORY_LABELS = {
  learning_reminder: 'تذكيرات التعلم',
  deadline_reminder: 'تذكيرات المواعيد',
  progress_update: 'تحديثات التقدم',
  assessment_result: 'نتائج التقييمات',
  parent_summary: 'الملخصات الدورية',
  system_alert: 'تنبيهات النظام',
};

function isEnabled(preferences, channel, category) {
  const match = preferences.find((p) => p.channel === channel && p.category === category);
  return match ? match.enabled : true;
}

function ParentNotificationSettings() {
  const [preferences, setPreferences] = useState([]);
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
    timezone: 'UTC',
  });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [savingQuietHours, setSavingQuietHours] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    Promise.all([getChannelPreferences(), getQuietHours()])
      .then(([prefData, quietHoursData]) => {
        if (cancelled) return;
        setPreferences(Array.isArray(prefData) ? prefData : []);
        if (quietHoursData) {
          setQuietHours({
            enabled: !!quietHoursData.enabled,
            startTime: quietHoursData.startTime || quietHoursData.start_time || '22:00',
            endTime: quietHoursData.endTime || quietHoursData.end_time || '07:00',
            timezone: quietHoursData.timezone || 'UTC',
          });
        }
        setStatus('ready');
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

  async function handleToggle(channel, category, enabled) {
    try {
      const updated = await updateChannelPreference(channel, category, enabled);
      setPreferences((prev) => {
        const exists = prev.some((p) => p.channel === channel && p.category === category);
        if (!exists) return [...prev, updated];
        return prev.map((p) =>
          p.channel === channel && p.category === category ? updated : p,
        );
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveQuietHours(e) {
    e.preventDefault();
    setSavingQuietHours(true);
    try {
      const updated = await updateQuietHours(quietHours);
      if (updated) {
        setQuietHours({
          enabled: !!updated.enabled,
          startTime: updated.startTime || updated.start_time || quietHours.startTime,
          endTime: updated.endTime || updated.end_time || quietHours.endTime,
          timezone: updated.timezone || quietHours.timezone,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingQuietHours(false);
    }
  }

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;

  return (
    <div className="parent-notification-settings">
      <h2 className="parent-page__title">تفضيلات الإشعارات</h2>

      {CATEGORIES.map((category) => (
        <ParentCard key={category} title={CATEGORY_LABELS[category]}>
          {CHANNELS.map((channel) => (
            <div key={channel} className="parent-notification-prefs__item">
              <label className="parent-notification-prefs__label">
                <input
                  type="checkbox"
                  checked={isEnabled(preferences, channel, category)}
                  onChange={(e) => handleToggle(channel, category, e.target.checked)}
                  className="parent-form__checkbox"
                  aria-label={`${CHANNEL_LABELS[channel]} لـ ${CATEGORY_LABELS[category]}`}
                />
                <span>{CHANNEL_LABELS[channel]}</span>
              </label>
            </div>
          ))}
        </ParentCard>
      ))}

      <ParentCard title="ساعات الهدوء">
        <form className="parent-invitation__form" onSubmit={handleSaveQuietHours}>
          <label className="parent-notification-prefs__label">
            <input
              type="checkbox"
              checked={quietHours.enabled}
              onChange={(e) =>
                setQuietHours((prev) => ({ ...prev, enabled: e.target.checked }))
              }
              className="parent-form__checkbox"
            />
            <span>تفعيل ساعات الهدوء</span>
          </label>

          <label className="parent-form__label" htmlFor="quiet-hours-start">
            البداية
          </label>
          <input
            id="quiet-hours-start"
            type="time"
            className="parent-form__input"
            value={quietHours.startTime}
            onChange={(e) =>
              setQuietHours((prev) => ({ ...prev, startTime: e.target.value }))
            }
          />

          <label className="parent-form__label" htmlFor="quiet-hours-end">
            النهاية
          </label>
          <input
            id="quiet-hours-end"
            type="time"
            className="parent-form__input"
            value={quietHours.endTime}
            onChange={(e) =>
              setQuietHours((prev) => ({ ...prev, endTime: e.target.value }))
            }
          />

          <button type="submit" className="parent-form__btn" disabled={savingQuietHours}>
            حفظ ساعات الهدوء
          </button>
        </form>
      </ParentCard>
    </div>
  );
}

export default ParentNotificationSettings;
