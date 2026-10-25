import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { AuthLogo, AuthHeader, AuthFooterLink, MailBadge } from '../../components/auth/AuthParts';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function send() {
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
      setError(getErrorMessage(err, 'Request failed'));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (email.trim()) void send();
  }

  if (sent) {
    return (
      <>
        <AuthLogo />
        <div className="flex flex-col items-center text-center my-auto">
          <MailBadge />
          <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight m-0 mb-2">Check Your Email</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[280px]">
            If an account exists for{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>, we sent a password reset link. Open it to continue.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {error && <Banner variant="error">{error}</Banner>}
          <Button variant="ghost" fullWidth disabled={loading} onClick={() => void send()}>
            {loading ? 'Sending…' : "Didn't get it? Resend email"}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>Back to Sign In</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        eyebrow="Forgot Password?"
        title={<>Reset your<br />password</>}
        subtitle="Enter the email linked to your account and we'll send you a link to reset your password."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 my-auto pt-4">
        {error && <Banner variant="error">{error}</Banner>}
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <div className="mt-2">
          <Button type="submit" size="lg" fullWidth disabled={loading || !email.trim()}>
            {loading ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </div>
      </form>

      <AuthFooterLink prompt="Remembered your password?" action="Back to Sign In" onClick={() => navigate('/login')} />
    </>
  );
}
