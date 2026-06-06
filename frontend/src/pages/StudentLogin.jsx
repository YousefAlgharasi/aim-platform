import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../shared/supabase/client';

function storeSession(session) {
  if (!session) {
    window.localStorage.removeItem('aim_supabase_access_token');
    window.localStorage.removeItem('aim_supabase_refresh_token');
    window.localStorage.removeItem('aim_supabase_user');
    return;
  }
  window.localStorage.setItem('aim_supabase_access_token', session.access_token || '');
  window.localStorage.setItem('aim_supabase_refresh_token', session.refresh_token || '');
  window.localStorage.setItem('aim_supabase_user', JSON.stringify(session.user || null));
}

function getFriendlyAuthError(error) {
  if (!error?.message) {
    return 'Login failed. Please check your email and password.';
  }
  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please check your inbox and confirm your email first.';
  }
  return 'Something went wrong. Please try again.';
}

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = session?.user || null;

  const userLabel = useMemo(() => {
    if (!user) return '';
    return user.email || user.phone || user.id;
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (sessionError) {
        setLoading(false);
        return;
      }
      setSession(data.session);
      storeSession(data.session);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      storeSession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) throw loginError;
      setSession(data.session);
      storeSession(data.session);
    } catch (loginError) {
      setError(getFriendlyAuthError(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    setError('');
    try {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
      setSession(null);
      storeSession(null);
    } catch (logoutError) {
      setError('Could not sign out. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="sl-page">
        <style>{styles}</style>
        <div className="sl-card sl-card--center">
          <div className="sl-spinner" aria-label="Loading" />
        </div>
      </main>
    );
  }

  return (
    <main className="sl-page">
      <style>{styles}</style>

      <section className="sl-card">
        <div className="sl-logo">
          <span className="sl-logo__mark">AIM</span>
          <h1 className="sl-logo__name">English Learning</h1>
        </div>

        {user ? (
          <div className="sl-session">
            <p className="sl-session__label">Signed in as</p>
            <p className="sl-session__email">{userLabel}</p>
            <div className="sl-actions">
              <button
                className="sl-btn sl-btn--primary"
                type="button"
                onClick={() => { window.location.href = '/lesson-session'; }}
              >
                Go to My Lessons
              </button>
              <button
                className="sl-btn sl-btn--ghost"
                type="button"
                onClick={handleLogout}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        ) : (
          <form className="sl-form" onSubmit={handleLogin}>
            <h2 className="sl-form__title">Sign in to your account</h2>

            <label className="sl-label">
              <span>Email</span>
              <input
                className="sl-input"
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
              />
            </label>

            <label className="sl-label">
              <span>Password</span>
              <input
                className="sl-input"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </label>

            {error && (
              <div className="sl-error" role="alert">
                {error}
              </div>
            )}

            <button className="sl-btn sl-btn--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="sl-switch">
              Don&apos;t have an account?{' '}
              <a className="sl-link" href="/register">Register for free</a>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

const styles = `
.sl-page {
  align-items: center;
  background: var(--background, #eef3f7);
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.sl-card {
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(31, 57, 87, 0.09);
  max-width: 420px;
  padding: clamp(28px, 6vw, 48px);
  width: 100%;
}

.sl-card--center {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 260px;
}

.sl-spinner {
  animation: sl-spin 0.8s linear infinite;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #0f766e;
  height: 36px;
  width: 36px;
}

@keyframes sl-spin {
  to { transform: rotate(360deg); }
}

.sl-logo {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 28px;
  text-align: center;
}

.sl-logo__mark {
  align-items: center;
  background: #0f766e;
  border-radius: 10px;
  color: #ffffff;
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 900;
  height: 48px;
  justify-content: center;
  letter-spacing: 0.06em;
  width: 68px;
}

.sl-logo__name {
  color: #17242f;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
}

.sl-form {
  display: grid;
  gap: 16px;
}

.sl-form__title {
  color: #17242f;
  font-size: 1.35rem;
  font-weight: 900;
  margin: 0 0 4px;
}

.sl-label {
  color: #657386;
  display: grid;
  font-size: 0.84rem;
  font-weight: 800;
  gap: 7px;
  letter-spacing: 0.02em;
}

.sl-input {
  background: #f8fafc;
  border: 1px solid #d1d9e0;
  border-radius: 10px;
  color: #17242f;
  font-size: 1rem;
  min-height: 48px;
  padding: 0 14px;
  transition: border-color 0.15s;
}

.sl-input:focus {
  border-color: #0f766e;
  outline: none;
}

.sl-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #b91c1c;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 12px 14px;
}

.sl-btn {
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 900;
  min-height: 48px;
  padding: 0 18px;
  transition: opacity 0.15s;
  width: 100%;
}

.sl-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.sl-btn--primary {
  background: #0f766e;
  color: #ffffff;
}

.sl-btn--primary:hover:not(:disabled) {
  background: #0d6360;
}

.sl-btn--ghost {
  background: #f1f5f9;
  color: #475569;
}

.sl-btn--ghost:hover:not(:disabled) {
  background: #e2e8f0;
}

.sl-switch {
  color: #657386;
  font-size: 0.88rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
}

.sl-link {
  color: #0f766e;
  font-weight: 900;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.sl-session {
  display: grid;
  gap: 14px;
  text-align: center;
}

.sl-session__label {
  color: #657386;
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: uppercase;
}

.sl-session__email {
  color: #17242f;
  font-size: 1.1rem;
  font-weight: 900;
  margin: 0;
  overflow-wrap: anywhere;
}

.sl-actions {
  display: grid;
  gap: 10px;
}
`;

export default StudentLogin;
