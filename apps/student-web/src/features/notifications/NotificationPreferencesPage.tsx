import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './Notification.module.css';

interface NotificationPref {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

export function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPref[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchPrefs() {
    setLoading(true);
    setError('');
    apiClient.get<{ preferences: NotificationPref[] }>('/api/notifications/preferences')
      .then(({ preferences }) => setPrefs(preferences))
      .catch((err: ApiError) => setError(err.message || 'Failed to load preferences'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchPrefs(); }, []);

  function togglePref(key: string, enabled: boolean) {
    setPrefs(prev => prev.map(p => p.key === key ? { ...p, enabled } : p));
    apiClient.patch(`/api/notifications/preferences/${key}`, { enabled })
      .catch(() => {
        setPrefs(prev => prev.map(p => p.key === key ? { ...p, enabled: !enabled } : p));
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
            <div key={pref.key} className={styles.prefItem}>
              <div className={styles.prefLabel}>
                <span className={styles.prefName}>{pref.name}</span>
                <span className={styles.prefDesc}>{pref.description}</span>
              </div>
              <button
                className={`${styles.toggle} ${pref.enabled ? styles.toggleActive : ''}`}
                onClick={() => togglePref(pref.key, !pref.enabled)}
                role="switch"
                aria-checked={pref.enabled}
                aria-label={pref.name}
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
