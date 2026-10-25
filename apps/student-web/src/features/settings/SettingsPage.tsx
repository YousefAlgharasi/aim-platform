import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { updateProfile, LANGUAGE_OPTIONS } from '../profile/profileApi';
import styles from './SettingsPage.module.css';

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
    <div className={styles.container}>
      <h1 className={styles.heading}>Settings</h1>

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Language</h2>
          <p className={styles.hint}>Saved to your profile and used across AIM.</p>
          {languageStatus && <Banner variant={languageStatus.variant}>{languageStatus.message}</Banner>}
          <label htmlFor="settings-language" className={styles.srOnly}>Preferred language</label>
          <select
            id="settings-language"
            className={styles.select}
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
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Daily learning goal</h2>
          {goalLoading ? (
            <LoadingSpinner />
          ) : goalLoadError ? (
            <div className={styles.section}>
              <Banner variant="error">{goalLoadError}</Banner>
              <div><Button variant="ghost" size="sm" onClick={loadGoal}>Retry</Button></div>
            </div>
          ) : (
            <>
              {goal && (
                <p className={styles.hint}>
                  Today: {goal.completedToday} of {goal.targetLessons} lessons · {goal.streakDays}-day streak
                </p>
              )}
              {goalStatus && <Banner variant={goalStatus.variant}>{goalStatus.message}</Banner>}
              <label htmlFor="settings-goal" className={styles.srOnly}>Daily commitment</label>
              <select
                id="settings-goal"
                className={styles.select}
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
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          <ul className={styles.linkList}>
            <li><Link to="/notifications/preferences" className={styles.link}>Notification channels, quiet hours &amp; reminders</Link></li>
            <li><Link to="/notifications" className={styles.link}>Notification inbox</Link></li>
          </ul>
        </div>
      </Card>

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <ul className={styles.linkList}>
            <li><Link to="/profile" className={styles.link}>Edit profile</Link></li>
            <li><Link to="/billing" className={styles.link}>Subscription &amp; billing</Link></li>
            <li><Link to="/support" className={styles.link}>Help &amp; support</Link></li>
          </ul>
        </div>
      </Card>

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Security</h2>
          <p className={styles.hint}>We'll email you a secure link to set a new password.</p>
          {resetStatus && <Banner variant={resetStatus.variant}>{resetStatus.message}</Banner>}
          <div>
            <Button variant="secondary" size="sm" onClick={sendPasswordReset} disabled={sendingReset || !user?.email}>
              {sendingReset ? 'Sending…' : 'Send password reset email'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Sign out</h2>
          <div>
            <Button variant="ghost" onClick={() => setConfirmLogout(true)} disabled={loggingOut}>Sign out</Button>
          </div>
        </div>
      </Card>

      <Modal open={confirmLogout} onClose={() => !loggingOut && setConfirmLogout(false)} title="Sign out?">
        <div className={styles.section}>
          <p className={styles.hint}>You'll need to sign in again to continue learning.</p>
          <div className={styles.actions}>
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
