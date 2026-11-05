import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppShellSkeleton } from '../components/common/Skeleton';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, sessionExpired } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppShellSkeleton />;
  }

  if (!user) {
    return (
      <Navigate
        to={sessionExpired ? '/session-expired' : location.pathname === '/' ? '/welcome' : '/login'}
        state={{ returnTo: location.pathname }}
        replace
      />
    );
  }

  return <>{children}</>;
}
