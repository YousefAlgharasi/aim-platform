import { useEffect, useMemo, useState } from 'react';
import { supabase, SUPABASE_URL } from '../shared/supabase/client';

const ACCESS_TOKEN_KEY = 'aim_supabase_access_token';
const REFRESH_TOKEN_KEY = 'aim_supabase_refresh_token';
const USER_KEY = 'aim_supabase_user';

function storeSession(session) {
  if (!session) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token || '');
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token || '');
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user || null));
}

function getFriendlyAuthError(error) {
  if (!error?.message) {
    return 'Login failed. Please check your email and password.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  if (message.includes('email not confirmed')) {
    return 'Your email is not confirmed yet. Please check your inbox.';
  }

  return error.message;
}

function StudentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('Checking session...');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = session?.user || null;

  const userLabel = useMemo(() => {
    if (!user) {
      return 'No active student session';
    }

    return user.email || user.phone || user.id;
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        setStatus('Could not read session');
        return;
      }

      setSession(data.session);
      storeSession(data.session);
      setStatus(data.session ? 'Student is logged in' : 'Ready to login');
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      storeSession(nextSession);
      setStatus(nextSession ? 'Student is logged in' : 'Logged out');
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
    setStatus('Signing in...');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw loginError;
      }

      setSession(data.session);
      storeSession(data.session);
      setStatus('Student is logged in');
    } catch (loginError) {
      setError(getFriendlyAuthError(loginError));
      setStatus('Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    setError('');
    setStatus('Signing out...');

    try {
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      setSession(null);
      storeSession(null);
      setStatus('Logged out');
    } catch (logoutError) {
      setError(logoutError.message || 'Logout failed.');
      setStatus('Logout failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToLessonSession() {
    window.location.href = '/lesson-session';
  }

  return (
    <main className="student-login">
      <style>{styles}</style>

      <section className="student-login__shell">
        <div className="student-login__intro">
          <span>AIM Web Pilot</span>
          <h1>Student Login</h1>
          <p>
            Login with Supabase Auth, store the access token locally, then continue to the lesson session flow.
          </p>

          <div className="student-login__status">
            <strong>Status</strong>
            <span>{status}</span>
          </div>

          <div className="student-login__status">
            <strong>Supabase</strong>
            <span>{SUPABASE_URL}</span>
          </div>
        </div>

        <div className="student-login__card">
          {user ? (
            <section className="student-login__session">
              <span>Active session</span>
              <h2>{userLabel}</h2>
              <p>
                The access token is saved in local storage under <code>{ACCESS_TOKEN_KEY}</code>.
              </p>

              <div className="student-login__actions">
                <button type="button" onClick={goToLessonSession}>
                  Continue to Lesson
                </button>
                <button type="button" onClick={handleLogout} disabled={isSubmitting}>
                  {isSubmitting ? 'Signing out...' : 'Logout'}
                </button>
              </div>
            </section>
          ) : (
            <form onSubmit={handleLogin}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@example.com"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Student password"
                  required
                />
              </label>

              {error && (
                <div className="student-login__error" role="alert">
                  {error}
                </div>
              )}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

const styles = `
.student-login {
  align-items: center;
  background: #f5f7fb;
  color: #172328;
  display: flex;
  min-height: 100vh;
  padding: 28px;
}

.student-login__shell {
  display: grid;
  gap: 22px;
  grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr);
  margin: 0 auto;
  max-width: 1120px;
  width: 100%;
}

.student-login__intro,
.student-login__card {
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 18px;
  box-shadow: 0 18px 48px rgba(31, 57, 87, 0.08);
  padding: 28px;
}

.student-login__intro > span,
.student-login__status strong,
.student-login form label span,
.student-login__session > span {
  color: #3f6f78;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.student-login h1 {
  font-size: clamp(2.2rem, 5vw, 4.2rem);
  line-height: 1;
  margin: 12px 0 14px;
}

.student-login p {
  color: #64748b;
  font-weight: 700;
  line-height: 1.55;
  margin: 0;
}

.student-login__status {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: grid;
  gap: 8px;
  margin-top: 14px;
  padding: 14px;
}

.student-login__status span {
  overflow-wrap: anywhere;
}

.student-login__card {
  align-content: center;
  display: grid;
}

.student-login form {
  display: grid;
  gap: 16px;
}

.student-login label {
  display: grid;
  gap: 8px;
}

.student-login input {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #172328;
  font-size: 1rem;
  min-height: 48px;
  padding: 0 14px;
}

.student-login button {
  background: #164da8;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 900;
  min-height: 48px;
  padding: 0 18px;
}

.student-login button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.student-login__error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #b91c1c;
  font-weight: 800;
  padding: 12px 14px;
}

.student-login__session {
  display: grid;
  gap: 14px;
}

.student-login__session h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  margin: 0;
  overflow-wrap: anywhere;
}

.student-login__session code {
  background: #eef4ff;
  border-radius: 6px;
  color: #164da8;
  font-weight: 900;
  padding: 2px 6px;
}

.student-login__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.student-login__actions button:last-child {
  background: #e2e8f0;
  color: #172328;
}

@media (max-width: 860px) {
  .student-login {
    padding: 16px;
  }

  .student-login__shell {
    grid-template-columns: 1fr;
  }
}
`;

export default StudentLogin;