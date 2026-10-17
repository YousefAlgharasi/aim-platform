'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ThemeToggle } from '../../shared/components/Theme';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = email.includes('@') && email.length >= 4 && password.length >= 6;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json();

      if (!response.ok || !body.success) {
        setError(body.error ?? 'Login failed. Please try again.');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-theme-toggle">
        <ThemeToggle variant="compact" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <p className="login-eyebrow">AIM Platform</p>
          <h1 className="login-title">Admin Sign In</h1>
          <p className="login-subtitle">
            Sign in with your admin credentials to access the dashboard.
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={!isFormValid || loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <style>{`
        .login-page {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: var(--space-16, 16px);
          background: var(--background);
          font-family: 'Inter', 'IBM Plex Sans Arabic', sans-serif;
          transition: background 0.2s ease;
        }

        .login-theme-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg, 16px);
          box-shadow: var(--shadow-modal);
          padding: var(--space-32, 32px);
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-24, 24px);
        }

        .login-eyebrow {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-primary-500);
          margin: 0 0 8px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 8px;
        }

        .login-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        .login-error {
          background: var(--error-soft);
          color: var(--error-soft-fg);
          border: 1px solid var(--color-error-500);
          border-radius: var(--radius-md, 8px);
          padding: 12px 16px;
          font-size: 14px;
          margin-bottom: var(--space-16, 16px);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-16, 16px);
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .login-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          font-size: 14px;
          font-family: inherit;
          border: 1px solid var(--border);
          border-radius: var(--radius-md, 8px);
          background: var(--surface-sunken);
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: var(--color-primary-500);
          box-shadow: var(--shadow-focus);
          background: var(--surface);
        }

        .login-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-input::placeholder {
          color: var(--text-muted);
        }

        .login-button {
          width: 100%;
          height: 44px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          color: #ffffff;
          background: var(--color-primary-500);
          border: none;
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: background 0.15s ease, opacity 0.15s ease, transform 0.1s ease;
          margin-top: 8px;
        }

        .login-button:hover:not(:disabled) {
          background: var(--color-primary-600);
        }

        .login-button:active:not(:disabled) {
          transform: scale(0.99);
        }

        .login-button:focus-visible {
          outline: none;
          box-shadow: var(--shadow-focus);
        }

        .login-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}
