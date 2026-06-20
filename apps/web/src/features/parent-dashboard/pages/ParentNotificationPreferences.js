// P12-064: Parent Notification Preferences UI
// Stores preferences only — does NOT send notifications (Phase 13 scope).

import { useState, useEffect } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '../api';
import { ParentCard, ParentLoadingState, ParentErrorState } from '../components';
import './ParentPages.css';

const PREF_LABELS = {
  progress_updates: 'تحديثات التقدم',
  assessment_results: 'نتائج التقييمات',
  deadline_reminders: 'تذكيرات المواعيد',
  weekly_reports: 'التقارير الأسبوعية',
};

function ParentNotificationPreferences() {
  const [prefs, setPrefs] = useState({});
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getNotificationPreferences()
      .then((data) => { if (!cancelled) { setPrefs(data || {}); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, []);

  async function handleToggle(key) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await updateNotificationPreferences(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;

  return (
    <div className="parent-notification-prefs">
      <h2 className="parent-page__title">تفضيلات الإشعارات</h2>
      <p className="parent-text--muted">سيتم تفعيل الإشعارات في مرحلة لاحقة. يمكنك ضبط تفضيلاتك الآن.</p>
      <ParentCard>
        {Object.entries(PREF_LABELS).map(([key, label]) => (
          <div key={key} className="parent-notification-prefs__item">
            <label className="parent-notification-prefs__label">
              <input
                type="checkbox"
                checked={!!prefs[key]}
                onChange={() => handleToggle(key)}
                disabled={saving}
                className="parent-form__checkbox"
              />
              <span>{label}</span>
            </label>
          </div>
        ))}
      </ParentCard>
    </div>
  );
}

export default ParentNotificationPreferences;
