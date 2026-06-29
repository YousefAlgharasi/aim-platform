import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { Card } from '../../components/common/Card';
import type { ApiError } from '../../types';
import styles from './AuthPages.module.css';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const { requiresEmailConfirmation } = await register(email, password, name);
      if (requiresEmailConfirmation) {
        setInfo('Check your email to confirm your account before signing in.');
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError((err as ApiError).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Create account</h1>
        {error && <Banner variant="error">{error}</Banner>}
        {info && <Banner variant="success">{info}</Banner>}
        <Input
          label="Full name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
        <div className={styles.links}>
          <Link to="/login" className={styles.link}>Already have an account? Sign in</Link>
        </div>
      </form>
    </Card>
  );
}
