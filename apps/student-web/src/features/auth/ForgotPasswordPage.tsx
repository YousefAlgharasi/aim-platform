import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { AuthLogo, AuthHeader, AuthFooterLink, MailBadge } from '../../components/auth/AuthParts';
import { mapApiFieldErrors, validateEmail } from '../../utils/validation';
import { useI18n } from '../../i18n/I18nContext';

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function send() {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await apiClient.post(
        '/auth/forgot-password',
        { email: email.trim(), redirectUrl: `${window.location.origin}/reset-password` },
        { auth: false },
      );
      setSent(true);
    } catch (err) {
      const mapped = mapApiFieldErrors(err, ['email'] as const);
      // On the "sent" screen there is no email field, so surface it as a banner.
      if (mapped.email && !sent) setEmailError(mapped.email);
      else setError(getErrorMessage(err, t('Request failed')));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const invalid = validateEmail(email);
    setEmailError(invalid);
    if (invalid) {
      document.getElementById('forgot-email')?.focus();
      return;
    }
    void send();
  }

  if (sent) {
    return (
      <>
        <AuthLogo />
        <div className="flex flex-col items-center text-center my-auto">
          <MailBadge />
          <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight m-0 mb-2">{t('Check Your Email')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[280px]">
            {t('We sent a password reset link to {email}. Open it to continue.', { email })}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {error && <Banner variant="error">{error}</Banner>}
          <Button variant="ghost" fullWidth disabled={loading} onClick={() => void send()}>
            {loading ? t('Sending…') : t("Didn't get it? Resend email")}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>{t('Back to Sign In')}</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
      <AuthHeader
        eyebrow={t('Forgot Password?')}
        title={t('Reset your password')}
        subtitle={t("Enter the email linked to your account and we'll send you a link to reset your password.")}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-6" noValidate>
        {error && <Banner variant="error">{error}</Banner>}
        <Input
          id="forgot-email"
          name="email"
          spellCheck={false}
          label={t('Email address')}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(undefined); }}
          onBlur={() => email && setEmailError(validateEmail(email))}
          error={emailError}
          required
          autoComplete="email"
        />
        <div className="mt-2">
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? t('Sending…') : t('Send Reset Link')}
          </Button>
        </div>
      </form>
      </div>

      <AuthFooterLink prompt={t('Remembered your password?')} action={t('Back to Sign In')} onClick={() => navigate('/login')} />
    </>
  );
}
