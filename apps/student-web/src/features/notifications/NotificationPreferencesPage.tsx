import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Notification.module.css';

interface NotificationPref {
  id: string;
  user_id: string;
  user_type: string;
  channel: string;
  category: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPref[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchPrefs() {
    setLoading(true);
    setError('');
    apiClient.get<NotificationPref[]>('/api/v1/notifications/preferences')
      .then(preferences => setPrefs(preferences))
      .catch((err: ApiError) => setError(err.message || 'Failed to load preferences'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchPrefs(); }, []);

  function togglePref(channel: string, category: string, enabled: boolean) {
    setPrefs(prev => prev.map(p => (p.channel === channel && p.category === category) ? { ...p, enabled } : p));
    apiClient.patch('/api/v1/notifications/preferences', { channel, category, enabled })
      .catch(() => {
        setPrefs(prev => prev.map(p => (p.channel === channel && p.category === category) ? { ...p, enabled: !enabled } : p));
      });
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchPrefs} />;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Notification Preferences</h1>

      <Card>
        <div className={styles.prefSection}>
          {prefs.map(pref => (
            <div key={pref.id} className={styles.prefItem}>
              <div className={styles.prefLabel}>
                <span className={styles.prefName}>{pref.category}</span>
                <span className={styles.prefDesc}>{pref.channel}</span>
              </div>
              <button
                className={`${styles.toggle} ${pref.enabled ? styles.toggleActive : ''}`}
                onClick={() => togglePref(pref.channel, pref.category, !pref.enabled)}
                role="switch"
                aria-checked={pref.enabled}
                aria-label={`${pref.category} (${pref.channel})`}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
