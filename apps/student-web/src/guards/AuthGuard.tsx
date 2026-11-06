import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppShellSkeleton, FlowPageSkeleton, PlacementPageSkeleton } from '../components/common/Skeleton';

interface AuthGuardProps {
  children: ReactNode;
  /** Which loader to show while the session loads: the app shell (default) or a full-screen flow page. */
  loader?: 'app' | 'flow' | 'placement';
}

export function AuthGuard({ children, loader = 'app' }: AuthGuardProps) {
  const { user, loading, sessionExpired } = useAuth();
  const location = useLocation();

  if (loading) {
    return loader === 'flow' ? <FlowPageSkeleton /> : loader === 'placement' ? <PlacementPageSkeleton /> : <AppShellSkeleton />;
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
