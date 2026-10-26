import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { AuthHeader, AuthFooterLink, PasswordToggle, TextLinkButton } from '../../components/auth/AuthParts';
import { useI18n } from '../../i18n/I18nContext';

export function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string })?.returnTo || '/';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, t('Login failed')));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
      <AuthHeader
        eyebrow={t('Welcome back')}
        title={t('Sign in to your account')}
        subtitle={t('Happy to see you again. Enter your email and password to continue.')}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-6">
        {error && <Banner variant="error">{error}</Banner>}
        <Input
          label={t('Email address')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label={t('Password')}
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          rightSlot={<PasswordToggle shown={showPass} onToggle={() => setShowPass(!showPass)} />}
        />

        <div className="text-right">
          <TextLinkButton onClick={() => navigate('/forgot-password')}>{t('Forgot password?')}</TextLinkButton>
        </div>

        <div className="mt-2">
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? t('Signing in…') : t('Sign in')}
          </Button>
        </div>
      </form>
      </div>

      <AuthFooterLink prompt={t("Don't have an account?")} action={t('Create account')} onClick={() => navigate('/register')} />
    </>
  );
}
