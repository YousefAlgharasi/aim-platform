import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LevelBadge } from '../level/LevelBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { apiClient, getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { updateProfile } from '../profile/profileApi';
import { LogOutIcon } from '../../components/common/Icons';
import { PageHeader, SectionTitle, LinkRow, subCls } from '../profile/ui';
import { LanguageDropdown } from './LanguageDropdown';
import { ThemeSwitch } from './ThemeSwitch';
import { DisplayPrefs } from './DisplayPrefs';

// Mirrors Flutter features/profile/ui/pages/account_settings_page.dart:
// language (profile.preferredLanguage), notification preferences, password reset
// email (POST /auth/forgot-password) and sign out.

type Status = { variant: 'success' | 'error'; message: string } | null;

export function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();

  // Language
  const [language, setLanguage] = useState<'en' | 'ar'>(locale);
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [languageStatus, setLanguageStatus] = useState<Status>(null);

  // Password reset
  const [sendingReset, setSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<Status>(null);

  // Logout
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  async function saveLanguage() {
    setSavingLanguage(true);
    setLanguageStatus(null);
    try {
      await updateProfile({ preferredLanguage: language });
      await refreshUser().catch(() => undefined);
      setLanguageStatus({ variant: 'success', message: t('Language saved to your profile.') });
      // Switch the whole app language immediately (also persists the choice).
      setLocale(language);
    } catch (err) {
      setLanguageStatus({ variant: 'error', message: getErrorMessage(err, t('Failed to save language')) });
    } finally {
      setSavingLanguage(false);
    }
  }

  async function sendPasswordReset() {
    if (!user?.email) return;
    setSendingReset(true);
    setResetStatus(null);
    try {
      await apiClient.post(
        '/auth/forgot-password',
        { email: user.email, redirectUrl: `${window.location.origin}/reset-password` },
        { auth: false },
      );
      setResetStatus({ variant: 'success', message: t('We sent a password reset link to {email}.', { email: user.email }) });
    } catch (err) {
      setResetStatus({ variant: 'error', message: getErrorMessage(err, t('Failed to send reset email')) });
    } finally {
      setSendingReset(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
      navigate('/login', { replace: true });
    }
  }

  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="stagger flex w-full flex-col gap-6">
      <PageHeader title={t('Settings')} subtitle={t('Your account and how AIM looks and behaves for you.')} />

      <Link to="/profile" className="flex items-center gap-4 rounded-2xl bg-surface p-4 no-underline ring-1 ring-line transition-all hover:ring-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-xl font-semibold text-white" aria-hidden="true">{initial}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold text-ink">{user?.name}</span>
          <span className="block truncate text-sm text-ink-muted">{user?.email}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2"><LevelBadge /><span className="text-sm font-bold text-brand-ink">{t('Edit profile')}</span></span>
      </Link>

      <section className="flex flex-col gap-3" aria-label={t('Preferences')}>
        <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t('Preferences')}</h2>
        <Card>
          <div className="flex flex-col gap-3.5">
            <SectionTitle hint={t('Saved to your profile and used across AIM.')}>{t('Language')}</SectionTitle>
            {languageStatus && <Banner variant={languageStatus.variant}>{languageStatus.message}</Banner>}
            <LanguageDropdown
              value={language}
              onChange={lang => { setLanguage(lang); setLanguageStatus(null); }}
              onSave={saveLanguage}
              disabled={savingLanguage || language === locale}
              loading={savingLanguage}
            />
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-3.5">
            <SectionTitle hint={t('Switch between the light and dark look. Saved on this device.')}>{t('Appearance')}</SectionTitle>
            <ThemeSwitch />
            <DisplayPrefs />
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-3" aria-label={t('Notifications')}>
        <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t('Notifications')}</h2>
        <Card>
          <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0 dark:divide-line">
            <li><LinkRow to="/notifications/preferences">{t('Notification channels, quiet hours & reminders')}</LinkRow></li>
            <li><LinkRow to="/notifications">{t('Notification inbox')}</LinkRow></li>
          </ul>
        </Card>
      </section>

      <section className="flex flex-col gap-3" aria-label={t('Security')}>
        <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t('Security')}</h2>
        <Card>
          <div className="flex flex-col gap-3.5">
            <SectionTitle hint={t("We'll email you a secure link to set a new password.")}>{t('Password')}</SectionTitle>
            {resetStatus && <Banner variant={resetStatus.variant}>{resetStatus.message}</Banner>}
            <div>
              <Button variant="secondary" size="sm" onClick={sendPasswordReset} disabled={sendingReset || !user?.email}>
                {sendingReset ? t('Sending…') : t('Send password reset email')}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-3" aria-label={t('Billing')}>
        <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t('Billing')}</h2>
        <Card>
          <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0 dark:divide-line">
            <li><LinkRow to="/billing">{t('Subscription & billing')}</LinkRow></li>
            <li><LinkRow to="/support">{t('Help & support')}</LinkRow></li>
          </ul>
        </Card>
      </section>

      <div className="flex flex-col gap-3 rounded-2xl bg-danger-soft p-4 ring-1 ring-danger-line sm:p-5">
        <h2 className="m-0 text-xl font-semibold tracking-tight text-danger-ink">{t('Sign out')}</h2>
        <p className="m-0 text-sm text-danger-ink">{t("You'll need to sign in again to continue learning.")}</p>
        <div>
          <Button variant="secondary" size="sm" onClick={() => setConfirmLogout(true)} disabled={loggingOut} className="!text-danger-ink">
            <LogOutIcon className="size-4" />
            {t('Sign out')}
          </Button>
        </div>
      </div>

      <Modal open={confirmLogout} onClose={() => !loggingOut && setConfirmLogout(false)} title={t('Sign out?')}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-danger-ink">{t("You'll need to sign in again to continue learning.")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>{t('Cancel')}</Button>
            <Button variant="primary" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? t('Signing out…') : t('Sign out')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
