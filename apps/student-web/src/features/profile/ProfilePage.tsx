import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import type { ApiError } from '../../types';
import styles from './ProfilePage.module.css';

interface StudentProfileResponse {
  id: string;
  profileType: 'student_profile';
  displayName: string | null;
  avatarUrl: string | null;
  preferredLanguage: string | null;
  timezone: string | null;
}

interface ProfileMeResponse {
  internalUserId: string;
  userType: string;
  studentProfile: StudentProfileResponse | null;
  adminProfile: {
    id: string;
    profileType: 'admin_profile';
    displayName: string | null;
    avatarUrl: string | null;
    department: string | null;
  } | null;
}

export function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ar'>('en');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function fetchProfile() {
    setLoading(true);
    setFetchError('');
    apiClient.get<ProfileMeResponse>('/profile/me')
      .then(profile => {
        const p = profile.studentProfile ?? profile.adminProfile;
        setDisplayName(p?.displayName ?? '');
        if (profile.studentProfile?.preferredLanguage === 'ar' || profile.studentProfile?.preferredLanguage === 'en') {
          setPreferredLanguage(profile.studentProfile.preferredLanguage);
        }
      })
      .catch((err: ApiError) => setFetchError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchProfile(); }, []);

  if (!user || loading) return <LoadingSpinner />;
  if (fetchError) return <ErrorState message={fetchError} onRetry={fetchProfile} />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await apiClient.patch<ProfileMeResponse>('/profile/me', {
        displayName,
        preferredLanguage,
      });
      setSuccess('Profile updated');
    } catch (err) {
      setError((err as ApiError).message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Profile</h1>
      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          {success && <Banner variant="success">{success}</Banner>}
          {error && <Banner variant="error">{error}</Banner>}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <p className={styles.value}>{user.email}</p>
          </div>

          <Input
            label="Name"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
          />

          <div className={styles.field}>
            <label htmlFor="locale" className={styles.label}>Language</label>
            <select
              id="locale"
              className={styles.select}
              value={preferredLanguage}
              onChange={e => setPreferredLanguage(e.target.value as 'en' | 'ar')}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
