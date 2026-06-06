import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../shared/supabase/client';

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
    return 'تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. حاول مرة أخرى.';
  }

  if (message.includes('email not confirmed')) {
    return 'يجب تأكيد البريد الإلكتروني أولًا. يرجى مراجعة صندوق الوارد.';
  }

  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم حاول مرة أخرى.';
  }

  return 'حدث خطأ غير متوقع. حاول مرة أخرى بعد لحظات.';
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
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (sessionError) {
          setError('تعذر قراءة جلسة الطالب الحالية. يمكنك تسجيل الدخول من جديد.');
          setLoading(false);
          return;
        }

        setSession(data.session);
        storeSession(data.session);
      } catch {
        if (isMounted) {
          setError('تعذر الاتصال بخدمة تسجيل الدخول. حاول مرة أخرى.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
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
    } catch {
      setError('تعذر تسجيل الخروج. حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToDashboard() {
    window.location.href = '/dashboard';
  }

  if (loading) {
    return (
      <main className="sl-page" dir="rtl" lang="ar">
        <style>{styles}</style>
        <section className="sl-card sl-card--center" aria-label="جاري تحميل جلسة الطالب">
          <div className="sl-spinner" aria-label="جاري التحميل" />
          <p className="sl-loading-text">جاري التحقق من جلسة الطالب...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="sl-page" dir="rtl" lang="ar">
      <style>{styles}</style>

      <section className="sl-card" aria-labelledby="student-login-title">
        <div className="sl-logo">
          <span className="sl-logo__mark">AIM</span>
          <p className="sl-logo__eyebrow">منصة التعلم الذكي</p>
          <h1 className="sl-logo__name" id="student-login-title">
            تسجيل دخول الطالب
          </h1>
          <p className="sl-logo__subtitle">
            ادخل إلى لوحة التعلم لمتابعة الدروس وتحليل أداء خوارزمية AIM.
          </p>
        </div>

        {error && (
          <div className="sl-error" role="alert">
            {error}
          </div>
        )}

        {user ? (
          <div className="sl-session">
            <p className="sl-session__label">تم تسجيل الدخول بنجاح</p>
            <p className="sl-session__email">{userLabel}</p>
            <p className="sl-session__hint">
              يمكنك الآن الانتقال إلى لوحة الطالب ومتابعة تجربة الدروس والتحليل التكيفي.
            </p>

            <div className="sl-actions">
              <button
                className="sl-btn sl-btn--primary"
                type="button"
                onClick={goToDashboard}
              >
                الذهاب إلى لوحة الطالب
              </button>
              <button
                className="sl-btn sl-btn--ghost"
                type="button"
                onClick={handleLogout}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
              </button>
            </div>
          </div>
        ) : (
          <form className="sl-form" onSubmit={handleLogin}>
            <label className="sl-label">
              <span>البريد الإلكتروني</span>
              <input
                className="sl-input"
                type="email"
                value={email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@example.com"
                required
              />
            </label>

            <label className="sl-label">
              <span>كلمة المرور</span>
              <input
                className="sl-input"
                type="password"
                value={password}
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="أدخل كلمة المرور"
                required
              />
            </label>

            <button className="sl-btn sl-btn--primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

            <p className="sl-switch">
              لا تملك حسابًا؟{' '}
              <a className="sl-link" href="/register">
                إنشاء حساب جديد
              </a>
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
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.14), transparent 34%),
    linear-gradient(135deg, #eef7f6 0%, #f6f8fb 52%, #edf4fb 100%);
  color: #17242f;
  display: flex;
  font-family: 'IBM Plex Sans Arabic', 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  text-align: right;
}

.sl-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(219, 228, 239, 0.95);
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(31, 57, 87, 0.12);
  max-width: 450px;
  padding: clamp(28px, 6vw, 48px);
  width: 100%;
}

.sl-card--center {
  align-items: center;
  display: grid;
  gap: 16px;
  justify-items: center;
  min-height: 260px;
}

.sl-spinner {
  animation: sl-spin 0.8s linear infinite;
  border: 3px solid #dbe7ee;
  border-radius: 50%;
  border-top-color: #0f766e;
  height: 38px;
  width: 38px;
}

.sl-loading-text {
  color: #657386;
  font-size: 0.95rem;
  font-weight: 800;
  margin: 0;
}

@keyframes sl-spin {
  to { transform: rotate(360deg); }
}

.sl-logo {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 26px;
  text-align: center;
}

.sl-logo__mark {
  align-items: center;
  background: linear-gradient(135deg, #0f766e, #115e59);
  border-radius: 14px;
  box-shadow: 0 12px 26px rgba(15, 118, 110, 0.25);
  color: #ffffff;
  display: inline-flex;
  font-size: 0.95rem;
  font-weight: 900;
  height: 52px;
  justify-content: center;
  letter-spacing: 0.08em;
  width: 74px;
}

.sl-logo__eyebrow {
  color: #0f766e;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  margin: 10px 0 0;
}

.sl-logo__name {
  color: #17242f;
  font-size: clamp(1.55rem, 4vw, 2rem);
  font-weight: 900;
  line-height: 1.25;
  margin: 0;
}

.sl-logo__subtitle {
  color: #657386;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.75;
  margin: 0;
  max-width: 340px;
}

.sl-form,
.sl-session,
.sl-actions {
  display: grid;
}

.sl-form {
  gap: 16px;
}

.sl-label {
  color: #475569;
  display: grid;
  font-size: 0.9rem;
  font-weight: 900;
  gap: 8px;
}

.sl-input {
  background: #f8fafc;
  border: 1px solid #d1d9e0;
  border-radius: 12px;
  color: #17242f;
  direction: ltr;
  font-size: 1rem;
  min-height: 50px;
  padding: 0 14px;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}

.sl-input:focus {
  background: #ffffff;
  border-color: #0f766e;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.12);
  outline: none;
}

.sl-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.7;
  margin-bottom: 16px;
  padding: 12px 14px;
}

.sl-btn {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 900;
  min-height: 50px;
  padding: 0 18px;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s, opacity 0.15s;
  width: 100%;
}

.sl-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.sl-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.sl-btn--primary {
  background: #0f766e;
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
  color: #ffffff;
}

.sl-btn--primary:hover:not(:disabled) {
  background: #0d6360;
}

.sl-btn--ghost {
  background: #f1f5f9;
  box-shadow: none;
  color: #475569;
}

.sl-btn--ghost:hover:not(:disabled) {
  background: #e2e8f0;
}

.sl-switch {
  color: #657386;
  font-size: 0.9rem;
  font-weight: 800;
  margin: 2px 0 0;
  text-align: center;
}

.sl-link {
  color: #0f766e;
  font-weight: 900;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.sl-session {
  gap: 14px;
  text-align: center;
}

.sl-session__label {
  color: #0f766e;
  font-size: 0.9rem;
  font-weight: 900;
  margin: 0;
}

.sl-session__email {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #17242f;
  direction: ltr;
  font-size: 1.05rem;
  font-weight: 900;
  margin: 0;
  overflow-wrap: anywhere;
  padding: 12px;
  text-align: center;
}

.sl-session__hint {
  color: #657386;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.8;
  margin: 0;
}

.sl-actions {
  gap: 10px;
  margin-top: 4px;
}

@media (max-width: 520px) {
  .sl-page {
    padding: 16px;
  }

  .sl-card {
    border-radius: 20px;
  }
}
`;

export default StudentLogin;
