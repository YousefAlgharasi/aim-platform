import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './SettingsPage.module.css';

interface Preferences {
  locale: 'en' | 'ar';
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export function SettingsPage() {
  const { logout } = useAuth();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    apiClient.get<{ preferences: Preferences }>('/settings')
      .then(({ preferences }) => setPrefs(preferences))
      .catch((err: ApiError) => setFetchError(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!prefs) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await apiClient.put('/settings', { preferences: prefs });
      setSuccess('Settings saved');
    } catch (err) {
      setError((err as ApiError).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (fetchError) return <ErrorState message={fetchError} onRetry={() => window.location.reload()} />;
  if (!prefs) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Settings</h1>

      {success && <Banner variant="success">{success}</Banner>}
      {error && <Banner variant="error">{error}</Banner>}

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Language</h2>
          <select
            className={styles.select}
            value={prefs.locale}
            onChange={e => setPrefs({ ...prefs, locale: e.target.value as 'en' | 'ar' })}
            aria-label="Language"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={prefs.emailNotifications}
              onChange={e => setPrefs({ ...prefs, emailNotifications: e.target.checked })}
            />
            Email notifications
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={prefs.pushNotifications}
              onChange={e => setPrefs({ ...prefs, pushNotifications: e.target.checked })}
            />
            Push notifications
          </label>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save settings'}
      </Button>

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <Button variant="ghost" onClick={logout}>Sign out</Button>
        </div>
      </Card>
    </div>
  );
}
