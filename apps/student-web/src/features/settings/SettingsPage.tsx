import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { useTheme } from '../../state/ThemeContext';
import { apiClient, getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { updateProfile, LANGUAGE_OPTIONS } from '../profile/profileApi';
import {
  LogOutIcon,
  UserIcon,
  ShieldIcon,
  BellIcon,
  BookIcon,
  PaletteIcon,
  HelpIcon,
  ChevronRightIcon,
} from '../../components/common/Icons';
import { PageHeader, subCls } from '../profile/ui';

// Mirrors Flutter features/profile/ui/pages/account_settings_page.dart:
// language (profile.preferredLanguage), notification preferences, password reset
// email (POST /auth/forgot-password) and sign out.

type Status = { variant: 'success' | 'error'; message: string } | null;

export function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useI18n();
  const { isDarkMode, toggle } = useTheme();

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

  const initial = (user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?').toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader eyebrow={t('Account')} title={t('Settings')} />

      {/* Main scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl mx-auto w-full">
        {/* Profile Summary Section */}
        <div className="mb-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="size-14 sm:size-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-md">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              {user?.name && (
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate m-0">
                  {user.name}
                </h2>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1 mb-3">
                {user?.email}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/profile')}
              >
                {t('Edit Profile')}
              </Button>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-3">
            {t('Account')}
          </h3>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {/* Personal Information */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-none bg-transparent cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <UserIcon className="size-5" />
                </div>
                <div className="text-start min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Personal Information')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('Name, email and profile')}
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="size-5 text-slate-400 dark:text-slate-600 shrink-0 rtl:-scale-x-100" />
            </button>

            {/* Security */}
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <ShieldIcon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Security')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('Password and account security')}
                  </p>
                </div>
              </div>
              {resetStatus && <Banner variant={resetStatus.variant}>{resetStatus.message}</Banner>}
              <Button
                variant="secondary"
                size="sm"
                onClick={sendPasswordReset}
                disabled={sendingReset || !user?.email}
                className="w-full"
              >
                {sendingReset ? t('Sending…') : t('Send password reset email')}
              </Button>
            </div>
          </div>
        </div>

        {/* Learning Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-3">
            {t('Learning')}
          </h3>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {/* Notifications */}
            <button
              type="button"
              onClick={() => navigate('/notifications/preferences')}
              className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-none bg-transparent cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <BellIcon className="size-5" />
                </div>
                <div className="text-start min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Notifications')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('Learning reminders and updates')}
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="size-5 text-slate-400 dark:text-slate-600 shrink-0 rtl:-scale-x-100" />
            </button>
          </div>
        </div>

        {/* App Preferences Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-3">
            {t('App Preferences')}
          </h3>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {/* Language */}
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Language')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {LANGUAGE_OPTIONS.find(o => o.value === language)?.label}
                  </p>
                </div>
              </div>
              {languageStatus && <Banner variant={languageStatus.variant}>{languageStatus.message}</Banner>}
              <label htmlFor="settings-language" className="sr-only">{t('Preferred language')}</label>
              <select
                id="settings-language"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm mb-3"
                value={language}
                onChange={e => { setLanguage(e.target.value as 'en' | 'ar'); setLanguageStatus(null); }}
              >
                {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <Button
                variant="secondary"
                size="sm"
                onClick={saveLanguage}
                disabled={savingLanguage || language === locale}
                className="w-full"
              >
                {savingLanguage ? t('Saving…') : t('Save language')}
              </Button>
            </div>

            {/* Appearance */}
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <PaletteIcon className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Appearance')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isDarkMode ? t('Dark mode') : t('Light mode')}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={toggle}
                className="w-full"
              >
                {isDarkMode ? t('Switch to light mode') : t('Switch to dark mode')}
              </Button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-12">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 mb-3">
            {t('Support')}
          </h3>
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-none bg-transparent cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <HelpIcon className="size-5" />
                </div>
                <div className="text-start min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('Help & Support')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('Get help and contact support')}
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="size-5 text-slate-400 dark:text-slate-600 shrink-0 rtl:-scale-x-100" />
            </button>
          </div>
        </div>

        {/* Sign Out Section */}
        <div className="mb-8 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 sm:p-6">
          <h2 className="text-base font-bold text-red-600 dark:text-red-400 m-0 mb-4">
            {t('Sign out')}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setConfirmLogout(true)}
            disabled={loggingOut}
            className="w-full !text-red-600 dark:!text-red-400 border-red-200 dark:border-red-900/30"
          >
            <LogOutIcon className="size-4" />
            {t('Sign out')}
          </Button>
        </div>

        {/* App Version Footer */}
        <div className="text-center pb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('AIM')} • v1.0.0
          </p>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Modal open={confirmLogout} onClose={() => !loggingOut && setConfirmLogout(false)} title={t('Sign out?')}>
        <div className="flex flex-col gap-4">
          <p className={subCls}>{t("You'll need to sign in again to continue learning.")}</p>
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
