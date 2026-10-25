import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { AuthLogo } from '../../components/auth/AuthParts';

export function SessionExpiredPage() {
  const navigate = useNavigate();
  return (
    <>
      <AuthLogo />
      <div className="my-auto text-center flex flex-col items-center gap-2">
        <h1 className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight m-0">Session expired</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[280px]">
          Your session has expired. Please sign in again to continue.
        </p>
      </div>
      <Button size="lg" fullWidth onClick={() => navigate('/login')}>Sign in</Button>
    </>
  );
}
