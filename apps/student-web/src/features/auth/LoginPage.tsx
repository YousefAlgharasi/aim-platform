import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { AuthHeader, AuthFooterLink, PasswordToggle, TextLinkButton } from '../../components/auth/AuthParts';

export function LoginPage() {
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
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthHeader
        eyebrow="Welcome back"
        title={<>Sign in to your<br />account</>}
        subtitle="Happy to see you again. Enter your email and password to continue."
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
        <Input
          label="Password"
          type={showPass ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          rightSlot={<PasswordToggle shown={showPass} onToggle={() => setShowPass(!showPass)} />}
        />

        <div className="text-right">
          <TextLinkButton onClick={() => navigate('/forgot-password')}>Forgot password?</TextLinkButton>
        </div>

        <div className="mt-2">
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>
      </form>

      <AuthFooterLink prompt="Don't have an account?" action="Create account" onClick={() => navigate('/register')} />
    </>
  );
}
