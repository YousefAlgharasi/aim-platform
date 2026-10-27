import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { AuthLogo, AuthHeader, AuthFooterLink, MailBadge, PasswordToggle } from '../../components/auth/AuthParts';
import { collectErrors, focusFirstInvalid, hasErrors, mapApiFieldErrors, validateConfirm, validateEmail, validateNewPassword, validateRequired, type FieldErrors } from '../../utils/validation';
import { useI18n } from '../../i18n/I18nContext';

// Matches the profile display-name limit (DISPLAY_NAME_MAX in features/profile/profileApi.ts).
const NAME_MAX = 80;

export function RegisterPage() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'name' | 'email' | 'password' | 'confirm'>>({});
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    const errors = collectErrors({
      name: validateRequired(name, t('Full name is required.')) ?? (name.trim().length > NAME_MAX ? t('Full name must be {max} characters or fewer.', { max: NAME_MAX }) : undefined),
      email: validateEmail(email),
      password: validateNewPassword(password),
      confirm: validateConfirm(password, confirm),
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      focusFirstInvalid(
        [['name', 'register-name'], ['email', 'register-email'], ['password', 'register-password'], ['confirm', 'register-confirm']],
        errors,
      );
      return;
    }
    setLoading(true);
    try {
      const { requiresEmailConfirmation } = await register(email.trim(), password, name.trim());
      if (requiresEmailConfirmation) {
        setConfirmationSent(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      if ((err as { code?: string } | null)?.code === 'CONFLICT') {
        setFieldErrors({ email: t('An account with this email already exists. Try signing in instead.') });
        setError('');
        document.getElementById('register-email')?.focus();
        return;
      }
      const mapped = mapApiFieldErrors(err, ['email', 'password'] as const);
      setFieldErrors(mapped);
      setError(hasErrors(mapped) ? '' : getErrorMessage(err, t('Registration failed')));
    } finally {
      setLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <>
        <AuthLogo />
        <div className="flex flex-col items-center text-center my-auto">
          <MailBadge />
          <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight m-0 mb-2">{t('Check Your Email')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[280px]">
            {t('We sent a confirmation link to {email}. Confirm your account, then sign in.', { email })}
          </p>
        </div>
        <Button size="lg" fullWidth onClick={() => navigate('/login')}>{t('Back to Sign In')}</Button>
      </>
    );
  }

  return (
    <>
      <div>
      <AuthHeader
        eyebrow={t('Start your journey')}
        title={t('Create an account')}
        subtitle={t('Takes less than a minute. Enter your details below.')}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-6" noValidate>
        {error && <Banner variant="error">{error}</Banner>}
        <Input
          id="register-name"
          label={t('Full name')}
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }}
          error={fieldErrors.name}
          required
          autoComplete="name"
        />
        <Input
          id="register-email"
          name="email"
          spellCheck={false}
          label={t('Email address')}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: undefined })); }}
          onBlur={() => email && setFieldErrors((f) => ({ ...f, email: validateEmail(email) }))}
          error={fieldErrors.email}
          required
          autoComplete="email"
        />
        <Input
          id="register-password"
          label={t('Password')}
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
          id="register-confirm"
          label={t('Confirm password')}
          type={showConfirm ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setFieldErrors((f) => ({ ...f, confirm: undefined })); }}
          onBlur={() => confirm && setFieldErrors((f) => ({ ...f, confirm: validateConfirm(password, confirm) }))}
          error={fieldErrors.confirm}
          required
          autoComplete="new-password"
          rightSlot={<PasswordToggle shown={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />}
        />
        <div className="mt-2">
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? t('Creating account…') : t('Create account')}
          </Button>
        </div>
      </form>
      </div>

      <AuthFooterLink prompt={t('Already have an account?')} action={t('Log in')} onClick={() => navigate('/login')} />
    </>
  );
}
