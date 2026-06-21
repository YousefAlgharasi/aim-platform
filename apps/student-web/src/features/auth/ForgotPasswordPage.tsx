import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Card } from '../../components/common/Card';
import type { ApiError } from '../../types';
import styles from './AuthPages.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError((err as ApiError).message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card>
        <div className={styles.form}>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.text}>
            If an account exists for {email}, you will receive a password reset link.
          </p>
          <Link to="/login" className={styles.link}>Back to sign in</Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Reset password</h1>
        {error && <Banner variant="error">{error}</Banner>}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
        <div className={styles.links}>
          <Link to="/login" className={styles.link}>Back to sign in</Link>
        </div>
      </form>
    </Card>
  );
}
