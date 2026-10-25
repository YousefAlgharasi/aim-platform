import { useState, FormEvent, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  fetchProfile,
  updateProfile,
  DISPLAY_NAME_MAX,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  type ProfileMeResponse,
} from './profileApi';
import styles from './ProfilePage.module.css';

const QUICK_LINKS = [
  { to: '/settings', label: 'Account settings' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/billing', label: 'Subscription & billing' },
  { to: '/reports', label: 'My reports' },
  { to: '/support', label: 'Help & support' },
];

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileMeResponse | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ar'>('en');
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');

  const applyProfile = useCallback((p: ProfileMeResponse) => {
    setProfile(p);
    const sp = p.studentProfile;
    setDisplayName((sp ?? p.adminProfile)?.displayName ?? '');
    setPreferredLanguage(sp?.preferredLanguage === 'ar' ? 'ar' : 'en');
    setTimezone(sp?.timezone ?? '');
    setDirty(false);
  }, []);

  const loadProfile = useCallback(() => {
    setLoading(true);
    setFetchError('');
    fetchProfile()
      .then(applyProfile)
      .catch(err => setFetchError(getErrorMessage(err, 'Failed to load profile')))
      .finally(() => setLoading(false));
  }, [applyProfile]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  if (!user || loading) return <LoadingSpinner />;
  if (fetchError) return <ErrorState message={fetchError} onRetry={loadProfile} />;

  const studentProfile = profile?.studentProfile ?? null;
  const timezoneOptions = timezone && !TIMEZONE_OPTIONS.some(o => o.value === timezone)
    ? [{ value: timezone, label: timezone }, ...TIMEZONE_OPTIONS]
    : TIMEZONE_OPTIONS;

  function markDirty() {
    setDirty(true);
    setSuccess('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const name = displayName.trim();
    if (name.length > DISPLAY_NAME_MAX) {
      setNameError(`Display name must be ${DISPLAY_NAME_MAX} characters or fewer.`);
      return;
    }
    setNameError('');
    setSaving(true);
    try {
      const updated = await updateProfile({
        displayName: name || undefined,
        preferredLanguage,
        timezone: timezone || undefined,
      });
      applyProfile(updated);
      setSuccess('Profile updated');
      // Refresh the auth user so the header name and locale update.
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setError(getErrorMessage(err, 'Update failed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Profile</h1>

      <Card>
        <div className={styles.form}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.field}>
            <span className={styles.label}>Email</span>
            <p className={styles.value}>{user.email}</p>
          </div>
          {profile?.userType && (
            <div className={styles.field}>
              <span className={styles.label}>Account type</span>
              <p className={styles.value}>{profile.userType}</p>
            </div>
          )}
          {user.roles.length > 0 && (
            <div className={styles.field}>
              <span className={styles.label}>Roles</span>
              <div className={styles.pills}>
                {user.roles.map(r => <span key={r} className={styles.pill}>{r}</span>)}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        {studentProfile ? (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h2 className={styles.sectionTitle}>Edit profile</h2>
            {success && <Banner variant="success">{success}</Banner>}
            {error && <Banner variant="error">{error}</Banner>}

            <Input
              label="Display name"
              type="text"
              value={displayName}
              maxLength={DISPLAY_NAME_MAX}
              onChange={e => { setDisplayName(e.target.value); setNameError(''); markDirty(); }}
              error={nameError || undefined}
            />

            <div className={styles.field}>
              <label htmlFor="profile-language" className={styles.label}>Preferred language</label>
              <select
                id="profile-language"
                className={styles.select}
                value={preferredLanguage}
                onChange={e => { setPreferredLanguage(e.target.value as 'en' | 'ar'); markDirty(); }}
              >
                {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="profile-timezone" className={styles.label}>Timezone</label>
              <select
                id="profile-timezone"
                className={styles.select}
                value={timezone}
                onChange={e => { setTimezone(e.target.value); markDirty(); }}
              >
                <option value="" disabled>Select a timezone</option>
                {timezoneOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <Button type="submit" disabled={saving || !dirty}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        ) : (
          <Banner variant="info">
            This account has no student profile, so there are no editable student profile fields.
          </Banner>
        )}
      </Card>

      <Card>
        <nav className={styles.form} aria-label="Account links">
          <h2 className={styles.sectionTitle}>More</h2>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map(l => (
              <li key={l.to}><Link to={l.to} className={styles.link}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </Card>
    </div>
  );
}
