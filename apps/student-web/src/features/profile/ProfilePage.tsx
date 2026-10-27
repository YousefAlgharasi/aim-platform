import { useState, FormEvent, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
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
import { validateMaxLength, mapApiFieldErrors } from '../../utils/validation';
import { PageHeader, SectionTitle, Field, LinkRow, selectCls, labelCls, bodyCls, pillCls } from './ui';

const QUICK_LINKS = [
  { to: '/settings', label: 'Account settings' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/billing', label: 'Subscription & billing' },
  { to: '/reports', label: 'My reports' },
  { to: '/support', label: 'Help & support' },
];

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { t } = useI18n();
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
      .catch(err => setFetchError(getErrorMessage(err, t('Failed to load profile'))))
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
    if (saving) return;
    setError('');
    setSuccess('');
    const name = displayName.trim();
    const tooLong = validateMaxLength(name, DISPLAY_NAME_MAX, t('Display name must be {max} characters or fewer.', { max: DISPLAY_NAME_MAX }));
    if (tooLong) {
      setNameError(tooLong);
      document.getElementById('profile-display-name')?.focus();
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
      setSuccess(t('Profile updated'));
      // Refresh the auth user so the header name and locale update.
      await refreshUser().catch(() => undefined);
    } catch (err) {
      const mapped = mapApiFieldErrors(err, ['displayName'] as const);
      if (mapped.displayName) setNameError(mapped.displayName);
      else setError(getErrorMessage(err, t('Update failed')));
    } finally {
      setSaving(false);
    }
  }

  const initial = (displayName || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={t('Account')} title={t('Profile')} />

      <div className="grid gap-5 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1 flex flex-col gap-5">
          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="size-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shrink-0"
                  aria-hidden="true"
                >
                  {initial}
                </div>
                <div className="min-w-0">
                  {displayName && <p className="font-bold text-base m-0 text-slate-900 dark:text-white truncate">{displayName}</p>}
                  <p className="text-xs m-0 mt-0.5 text-slate-500 dark:text-slate-400 break-all">{user.email}</p>
                </div>
              </div>
              <dl className="m-0 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <dt className={labelCls}>{t('Email')}</dt>
                  <dd className={`${bodyCls} break-all`}>{user.email}</dd>
                </div>
                {profile?.userType && (
                  <div className="flex flex-col gap-1">
                    <dt className={labelCls}>{t('Account type')}</dt>
                    <dd className={bodyCls}>{profile.userType}</dd>
                  </div>
                )}
                {user.roles.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <dt className={labelCls}>{t('Roles')}</dt>
                    <dd className="m-0 flex flex-wrap gap-2">
                      {user.roles.map(r => <span key={r} className={pillCls}>{r}</span>)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </Card>

          <Card>
            <nav className="flex flex-col gap-1" aria-label={t('Account links')}>
              <SectionTitle>{t('More')}</SectionTitle>
              <ul className="list-none m-0 p-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
                {QUICK_LINKS.map(l => (
                  <li key={l.to}><LinkRow to={l.to}>{t(l.label)}</LinkRow></li>
                ))}
              </ul>
            </nav>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            {studentProfile ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <SectionTitle>{t('Edit profile')}</SectionTitle>
                {success && <Banner variant="success">{success}</Banner>}
                {error && <Banner variant="error">{error}</Banner>}

                <Input
                  id="profile-display-name"
                  label={t('Display name')}
                  type="text"
                  value={displayName}
                  maxLength={DISPLAY_NAME_MAX}
                  onChange={e => { setDisplayName(e.target.value); setNameError(''); markDirty(); }}
                  error={nameError || undefined}
                />

                <Field label={t('Preferred language')} htmlFor="profile-language">
                  <select
                    id="profile-language"
                    className={selectCls}
                    value={preferredLanguage}
                    onChange={e => { setPreferredLanguage(e.target.value as 'en' | 'ar'); markDirty(); }}
                  >
                    {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>

                <Field label={t('Timezone')} htmlFor="profile-timezone">
                  <select
                    id="profile-timezone"
                    className={selectCls}
                    value={timezone}
                    onChange={e => { setTimezone(e.target.value); markDirty(); }}
                  >
                    <option value="" disabled>{t('Select a timezone')}</option>
                    {timezoneOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>

                <Button type="submit" size="lg" disabled={saving || !dirty}>
                  {saving ? t('Saving...') : t('Save changes')}
                </Button>
              </form>
            ) : (
              <Banner variant="info">
                {t('This account has no student profile, so there are no editable student profile fields.')}
              </Banner>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
