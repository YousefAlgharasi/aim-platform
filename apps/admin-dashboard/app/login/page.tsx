'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

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
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: var(--space-16, 16px);
          background: var(--color-neutral-50, #F7F8FA);
          font-family: 'Inter', 'IBM Plex Sans Arabic', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--color-neutral-0, #FFFFFF);
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
          padding: var(--space-32, 32px);
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-24, 24px);
        }

        .login-eyebrow {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-primary-600, #3349D6);
          margin: 0 0 8px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-neutral-900, #181C26);
          margin: 0 0 8px;
        }

        .login-subtitle {
          font-size: 14px;
          color: var(--color-neutral-500, #7A8499);
          margin: 0;
        }

        .login-error {
          background: var(--color-error-50, #FEF0F0);
          color: var(--color-error-700, #B91C1C);
          border: 1px solid var(--color-error-200, #FECACA);
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
          font-size: 14px;
          font-weight: 500;
          color: var(--color-neutral-700, #424A5C);
        }

        .login-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          font-family: inherit;
          border: 1px solid var(--color-neutral-300, #CDD2DD);
          border-radius: var(--radius-md, 8px);
          background: var(--color-neutral-0, #FFFFFF);
          color: var(--color-neutral-900, #181C26);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: var(--color-primary-500, #4762EE);
          box-shadow: 0 0 0 3px var(--color-primary-100, #DCE4FF);
        }

        .login-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-input::placeholder {
          color: var(--color-neutral-400, #A6AEBF);
        }

        .login-button {
          width: 100%;
          padding: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          color: var(--color-neutral-0, #FFFFFF);
          background: var(--color-primary-600, #3349D6);
          border: none;
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          transition: background 0.15s ease, opacity 0.15s ease;
          margin-top: 8px;
        }

        .login-button:hover:not(:disabled) {
          background: var(--color-primary-700, #2837AC);
        }

        .login-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px var(--color-primary-100, #DCE4FF);
        }

        .login-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}
