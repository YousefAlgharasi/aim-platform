import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { ApiError, User } from '../../types';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLocale(user.locale || 'en');
    }
  }, [user]);

  if (!user) return <LoadingSpinner />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await apiClient.patch<{ user: User }>('/profile', { name, locale });
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
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div className={styles.field}>
            <label htmlFor="locale" className={styles.label}>Language</label>
            <select
              id="locale"
              className={styles.select}
              value={locale}
              onChange={e => setLocale(e.target.value as 'en' | 'ar')}
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
