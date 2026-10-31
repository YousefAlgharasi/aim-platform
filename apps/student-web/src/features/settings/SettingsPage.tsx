import { useEffect, useState } from 'react';
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow={t('Account')} title={t('Settings')} subtitle={user?.email} />

      <div className="grid gap-5 md:grid-cols-2 items-start">
        <Card>
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-xl bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 font-extrabold text-sm" aria-hidden="true"><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg></span>
              <SectionTitle hint={t('Saved to your profile and used across AIM.')}>{t('Language')}</SectionTitle>
            </div>
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
          <div className="flex flex-col gap-1">
            <SectionTitle>{t('Notifications')}</SectionTitle>
            <ul className="list-none m-0 p-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              <li><LinkRow to="/notifications/preferences">{t('Notification channels, quiet hours & reminders')}</LinkRow></li>
              <li><LinkRow to="/notifications">{t('Notification inbox')}</LinkRow></li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-1">
            <SectionTitle>{t('Account')}</SectionTitle>
            <ul className="list-none m-0 p-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              <li><LinkRow to="/profile">{t('Edit profile')}</LinkRow></li>
              <li><LinkRow to="/billing">{t('Subscription & billing')}</LinkRow></li>
              <li><LinkRow to="/support">{t('Help & support')}</LinkRow></li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3.5">
            <SectionTitle hint={t("We'll email you a secure link to set a new password.")}>{t('Security')}</SectionTitle>
            {resetStatus && <Banner variant={resetStatus.variant}>{resetStatus.message}</Banner>}
            <div>
              <Button variant="secondary" size="sm" onClick={sendPasswordReset} disabled={sendingReset || !user?.email}>
                {sendingReset ? t('Sending…') : t('Send password reset email')}
              </Button>
            </div>
          </div>
        </Card>

        <div className="rounded-2xl p-4 sm:p-5 bg-red-50 dark:bg-red-950/30 ring-1 ring-red-100 dark:ring-red-900/50 flex flex-col gap-3.5">
          <h2 className="text-base font-extrabold tracking-tight text-red-600 dark:text-red-300 m-0">{t('Sign out')}</h2>
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmLogout(true)}
              disabled={loggingOut}
              className="!text-red-600 dark:!text-red-300"
            >
              <LogOutIcon className="size-4" />
              {t('Sign out')}
            </Button>
          </div>
        </div>
      </div>

      <Modal open={confirmLogout} onClose={() => !loggingOut && setConfirmLogout(false)} title={t('Sign out?')}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-red-600 dark:text-red-400">{t("You'll need to sign in again to continue learning.")}</p>
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
