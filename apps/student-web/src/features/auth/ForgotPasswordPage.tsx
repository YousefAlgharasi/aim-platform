import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { AuthHeader, AuthFooterLink, MailBadge } from '../../components/auth/AuthParts';
import { mapApiFieldErrors, validateEmail } from '../../utils/validation';
import { useI18n } from '../../i18n/I18nContext';

const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // Tick the resend countdown once per second.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function send() {
    if (loading || cooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await apiClient.post(
        '/auth/forgot-password',
        { email: email.trim(), redirectUrl: `${window.location.origin}/reset-password` },
        { auth: false },
      );
      setSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const wait = (err as { statusCode?: number; details?: { retryAfterSeconds?: number } } | null);
      if (wait?.statusCode === 429) {
        setCooldown(Math.min(Math.max(Math.ceil(wait.details?.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS), 1), 600));
      }
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
        <div className="flex flex-col items-start text-start">
          <MailBadge />
          <h1 className="lp-display m-0 text-[2.25rem] font-semibold text-ink rtl:text-3xl">{t('Check Your Email')}</h1>
          <p className="m-0 mt-3 max-w-sm text-base leading-relaxed text-ink-muted">
            {t('We sent a password reset link to {email}. Open it to continue.', { email })}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {error && <Banner variant="error">{error}</Banner>}
          <Button variant="ghost" fullWidth className="!rounded-full !tracking-normal" disabled={loading || cooldown > 0} onClick={() => void send()}>
            {loading ? t('Sending…') : cooldown > 0 ? t('Resend email in {seconds}s', { seconds: cooldown }) : t("Didn't get it? Resend email")}
          </Button>
          <Button variant="secondary" fullWidth className="!rounded-full !tracking-normal" onClick={() => navigate('/login')}>{t('Back to Sign In')}</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
      <AuthHeader
        title={t('Reset your password')}
        subtitle={t("Enter the email linked to your account and we'll send you a link to reset your password.")}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-8" noValidate>
        {error && <Banner variant="error">{error}</Banner>}
        <Input
          variant="editorial"
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
          <Button type="submit" size="lg" fullWidth className="!rounded-full !tracking-normal" disabled={loading}>
            {loading ? t('Sending…') : t('Send Reset Link')}
          </Button>
        </div>
      </form>
      </div>

      <AuthFooterLink prompt={t('Remembered your password?')} action={t('Back to Sign In')} onClick={() => navigate('/login')} />
    </>
  );
}
