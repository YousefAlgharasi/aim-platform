import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { AuthLogo, AuthHeader, AuthFooterLink, MailBadge, PasswordToggle } from '../../components/auth/AuthParts';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { requiresEmailConfirmation } = await register(email, password, name);
      if (requiresEmailConfirmation) {
        setConfirmationSent(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
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
          <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight m-0 mb-2">Check Your Email</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[280px]">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>. Confirm your account, then sign in.
          </p>
        </div>
        <Button size="lg" fullWidth onClick={() => navigate('/login')}>Back to Sign In</Button>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        eyebrow="Start your journey"
        title="Create an account"
        subtitle="Takes less than a minute. Enter your details below."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 my-4">
        {error && <Banner variant="error">{error}</Banner>}
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          rightSlot={<PasswordToggle shown={showPass} onToggle={() => setShowPass(!showPass)} />}
        />
        <Input
          label="Confirm password"
          type={showConfirm ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          rightSlot={<PasswordToggle shown={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />}
        />
        <div className="mt-2">
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </div>
      </form>

      <AuthFooterLink prompt="Already have an account?" action="Log in" onClick={() => navigate('/login')} />
    </>
  );
}
