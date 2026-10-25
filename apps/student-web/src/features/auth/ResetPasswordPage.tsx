import { useState, FormEvent, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Card } from '../../components/common/Card';
import styles from './AuthPages.module.css';

/** Supabase's recovery link lands here as /reset-password#access_token=…&type=recovery. */
function readRecoveryToken(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return params.get('type') === 'recovery' ? params.get('access_token') : null;
}

export function ResetPasswordPage() {
  const recoveryToken = useMemo(readRecoveryToken, []);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { password }, { token: recoveryToken ?? '' });
      window.history.replaceState(null, '', window.location.pathname);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset password. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  }

  if (!recoveryToken && !done) {
    return (
      <Card>
        <div className={styles.form}>
          <h1 className={styles.title}>Invalid reset link</h1>
          <p className={styles.text}>This link is missing or has expired. Request a new one.</p>
          <Link to="/forgot-password" className={styles.link}>Send a new reset link</Link>
        </div>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <div className={styles.form}>
          <h1 className={styles.title}>Password updated</h1>
          <p className={styles.text}>Sign in with your new password.</p>
          <Link to="/login" className={styles.link}>Back to sign in</Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Choose a new password</h1>
        {error && <Banner variant="error">{error}</Banner>}
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </Button>
      </form>
    </Card>
  );
}
