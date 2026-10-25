import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { updateProfile, LANGUAGE_OPTIONS } from '../profile/profileApi';
import { LogOutIcon } from '../../components/common/Icons';
import { PageHeader, SectionTitle, LinkRow, selectCls, subCls } from '../profile/ui';

// Mirrors Flutter features/profile/ui/pages/account_settings_page.dart:
// language (profile.preferredLanguage), daily learning commitment
// (PUT /student/engagement/goal), notification preferences, password reset
// email (POST /auth/forgot-password) and sign out.

interface DailyGoalSummary {
  targetLessons: number;
  completedToday: number;
  streakDays: number;
}

interface EngagementSummaryResponse {
  goal: DailyGoalSummary;
}

// Same commitment presets as Flutter ('5' → 1, '15' → 2, '30' → 3 lessons/day).
const COMMITMENT_OPTIONS = [
  { lessons: 1, label: 'Casual — about 5 min/day (1 lesson)' },
  { lessons: 2, label: 'Recommended — about 15 min/day (2 lessons)' },
  { lessons: 3, label: 'Intensive — about 30 min/day (3 lessons)' },
];

type Status = { variant: 'success' | 'error'; message: string } | null;

export function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Language
  const [language, setLanguage] = useState<'en' | 'ar'>(user?.locale === 'ar' ? 'ar' : 'en');
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [languageStatus, setLanguageStatus] = useState<Status>(null);

  // Daily goal
  const [goal, setGoal] = useState<DailyGoalSummary | null>(null);
  const [goalLessons, setGoalLessons] = useState<number>(2);
  const [goalLoading, setGoalLoading] = useState(true);
  const [goalLoadError, setGoalLoadError] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalStatus, setGoalStatus] = useState<Status>(null);

  // Password reset
  const [sendingReset, setSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState<Status>(null);

  // Logout
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.locale) setLanguage(user.locale === 'ar' ? 'ar' : 'en');
  }, [user?.locale]);

  const loadGoal = useCallback(() => {
    setGoalLoading(true);
    setGoalLoadError('');
    apiClient.get<EngagementSummaryResponse>('/student/engagement/summary')
      .then(summary => {
        setGoal(summary.goal);
        setGoalLessons(summary.goal.targetLessons);
      })
      .catch(err => setGoalLoadError(getErrorMessage(err, 'Failed to load your daily goal')))
      .finally(() => setGoalLoading(false));
  }, []);

  useEffect(() => { loadGoal(); }, [loadGoal]);

  async function saveLanguage() {
    setSavingLanguage(true);
    setLanguageStatus(null);
    try {
      await updateProfile({ preferredLanguage: language });
      await refreshUser().catch(() => undefined);
      setLanguageStatus({ variant: 'success', message: 'Language saved to your profile.' });
    } catch (err) {
      setLanguageStatus({ variant: 'error', message: getErrorMessage(err, 'Failed to save language') });
    } finally {
      setSavingLanguage(false);
    }
  }

  async function saveGoal() {
    setSavingGoal(true);
    setGoalStatus(null);
    try {
      const updated = await apiClient.put<DailyGoalSummary>('/student/engagement/goal', {
        dailyGoalLessons: goalLessons,
      });
      setGoal(updated);
      setGoalLessons(updated.targetLessons);
      setGoalStatus({ variant: 'success', message: 'Daily goal updated.' });
    } catch (err) {
      setGoalStatus({ variant: 'error', message: getErrorMessage(err, 'Failed to update daily goal') });
    } finally {
      setSavingGoal(false);
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
      setResetStatus({ variant: 'success', message: `We sent a password reset link to ${user.email}.` });
    } catch (err) {
      setResetStatus({ variant: 'error', message: getErrorMessage(err, 'Failed to send reset email') });
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

  const goalOptions = COMMITMENT_OPTIONS.some(o => o.lessons === goalLessons)
    ? COMMITMENT_OPTIONS
    : [{ lessons: goalLessons, label: `${goalLessons} lessons per day (current)` }, ...COMMITMENT_OPTIONS];


  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Account" title="Settings" subtitle={user?.email} />

      <div className="grid gap-5 md:grid-cols-2 items-start">
        <Card>
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3">
              <span className="size-9 rounded-xl bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 font-extrabold text-sm" aria-hidden="true"><svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg></span>
              <SectionTitle hint="Saved to your profile and used across AIM.">Language</SectionTitle>
            </div>
            {languageStatus && <Banner variant={languageStatus.variant}>{languageStatus.message}</Banner>}
            <label htmlFor="settings-language" className="sr-only">Preferred language</label>
            <select
              id="settings-language"
              className={selectCls}
              value={language}
              onChange={e => { setLanguage(e.target.value as 'en' | 'ar'); setLanguageStatus(null); }}
            >
              {LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={saveLanguage}
                disabled={savingLanguage || language === (user?.locale === 'ar' ? 'ar' : 'en')}
              >
                {savingLanguage ? 'Saving…' : 'Save language'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3.5">
            <SectionTitle>Daily learning goal</SectionTitle>
            {goalLoading ? (
              <LoadingSpinner />
            ) : goalLoadError ? (
              <div className="flex flex-col gap-3">
                <Banner variant="error">{goalLoadError}</Banner>
                <div><Button variant="ghost" size="sm" onClick={loadGoal}>Retry</Button></div>
              </div>
            ) : (
              <>
                {goal && (
                  <p className={subCls}>
                    Today: {goal.completedToday} of {goal.targetLessons} lessons · {goal.streakDays}-day streak
                  </p>
                )}
                {goalStatus && <Banner variant={goalStatus.variant}>{goalStatus.message}</Banner>}
                <label htmlFor="settings-goal" className="sr-only">Daily commitment</label>
                <select
                  id="settings-goal"
                  className={selectCls}
                  value={goalLessons}
                  onChange={e => { setGoalLessons(Number(e.target.value)); setGoalStatus(null); }}
                >
                  {goalOptions.map(o => <option key={o.lessons} value={o.lessons}>{o.label}</option>)}
                </select>
                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={saveGoal}
                    disabled={savingGoal || goal?.targetLessons === goalLessons}
                  >
                    {savingGoal ? 'Saving…' : 'Save goal'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-1">
            <SectionTitle>Notifications</SectionTitle>
            <ul className="list-none m-0 p-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              <li><LinkRow to="/notifications/preferences">Notification channels, quiet hours &amp; reminders</LinkRow></li>
              <li><LinkRow to="/notifications">Notification inbox</LinkRow></li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-1">
            <SectionTitle>Account</SectionTitle>
            <ul className="list-none m-0 p-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
              <li><LinkRow to="/profile">Edit profile</LinkRow></li>
              <li><LinkRow to="/billing">Subscription &amp; billing</LinkRow></li>
              <li><LinkRow to="/support">Help &amp; support</LinkRow></li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-3.5">
            <SectionTitle hint="We'll email you a secure link to set a new password.">Security</SectionTitle>
            {resetStatus && <Banner variant={resetStatus.variant}>{resetStatus.message}</Banner>}
            <div>
              <Button variant="secondary" size="sm" onClick={sendPasswordReset} disabled={sendingReset || !user?.email}>
                {sendingReset ? 'Sending…' : 'Send password reset email'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="rounded-2xl p-4 sm:p-5 bg-red-50 dark:bg-red-950/30 ring-1 ring-red-100 dark:ring-red-900/50 flex flex-col gap-3.5">
          <h2 className="text-base font-extrabold tracking-tight text-red-600 dark:text-red-300 m-0">Sign out</h2>
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmLogout(true)}
              disabled={loggingOut}
              className="!text-red-600 dark:!text-red-300"
            >
              <LogOutIcon className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <Modal open={confirmLogout} onClose={() => !loggingOut && setConfirmLogout(false)} title="Sign out?">
        <div className="flex flex-col gap-4">
          <p className={subCls}>You'll need to sign in again to continue learning.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>Cancel</Button>
            <Button variant="primary" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
