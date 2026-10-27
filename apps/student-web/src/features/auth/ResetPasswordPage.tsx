import { useState, FormEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { AuthLogo, AuthHeader, PasswordToggle, SuccessBadge } from '../../components/auth/AuthParts';
import { collectErrors, focusFirstInvalid, hasErrors, mapApiFieldErrors, validateConfirm, validateNewPassword, type FieldErrors } from '../../utils/validation';
import { useI18n } from '../../i18n/I18nContext';

/** Supabase's recovery link lands here as /reset-password#access_token=…&type=recovery. */
function readRecoveryToken(): string | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return params.get('type') === 'recovery' ? params.get('access_token') : null;
}

export function ResetPasswordPage() {
  const { t } = useI18n();
  const recoveryToken = useMemo(readRecoveryToken, []);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'password' | 'confirm'>>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    const errors = collectErrors({
      password: validateNewPassword(password),
      confirm: validateConfirm(password, confirm),
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      focusFirstInvalid([['password', 'reset-password'], ['confirm', 'reset-confirm']], errors);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { password }, { token: recoveryToken ?? '' });
      window.history.replaceState(null, '', window.location.pathname);
      setDone(true);
    } catch (err) {
      const mapped = mapApiFieldErrors(err, ['password'] as const);
      setFieldErrors(mapped);
      setError(hasErrors(mapped) ? '' : getErrorMessage(err, t('Could not reset password. The link may have expired.')));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <>
        <div className="my-auto flex flex-col items-center text-center">
          <SuccessBadge />
          <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight m-0">{t('Password Reset!')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-[260px] leading-relaxed">
            {t('Your password has been updated. Sign in with your new password.')}
          </p>
        </div>
        <Button size="lg" fullWidth onClick={() => navigate('/login')}>{t('Back to Sign In')}</Button>
      </>
    );
  }

  if (!recoveryToken) {
    return (
      <>
        <AuthLogo />
        <div className="my-auto text-center flex flex-col items-center gap-2">
          <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight m-0">{t('Invalid reset link')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[280px]">
            {t('This link is missing or has expired. Request a new one.')}
          </p>
        </div>
        <Button size="lg" fullWidth onClick={() => navigate('/forgot-password')}>{t('Send a new reset link')}</Button>
      </>
    );
  }

  return (
    <>
      <div>
      <AuthHeader
        eyebrow={t('Reset Password')}
        title={t('Create a new password')}
        subtitle={t("Choose a strong password you haven't used before.")}
      />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-6" noValidate>
        {error && <Banner variant="error">{error}</Banner>}
        <Input
          id="reset-password"
          label={t('New password')}
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: undefined, confirm: undefined })); }}
          onBlur={() => password && setFieldErrors((f) => ({ ...f, password: validateNewPassword(password) }))}
          error={fieldErrors.password}
          required
          autoComplete="new-password"
          rightSlot={<PasswordToggle shown={showPass} onToggle={() => setShowPass(!showPass)} />}
        />
        <Input
          id="reset-confirm"
          label={t('Confirm new password')}
          type={showPass ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setFieldErrors((f) => ({ ...f, confirm: undefined })); }}
          onBlur={() => confirm && setFieldErrors((f) => ({ ...f, confirm: validateConfirm(password, confirm) }))}
          error={fieldErrors.confirm}
          required
          autoComplete="new-password"
        />
        <div className="mt-2">
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? t('Resetting…') : t('Reset Password')}
          </Button>
        </div>
      </form>
      </div>
    </>
  );
}
