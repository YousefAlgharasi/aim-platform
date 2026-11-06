import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppShellSkeleton, PlacementPageSkeleton } from '../components/common/Skeleton';
import { cacheSetupDone, fetchSetupStatus, isSetupDoneCached, setupPending } from '../features/start/setupStatus';

/**
 * Keeps students out of the app shell until the /start flow (3 questions, then the
 * start-from-zero / placement choice) is finished and, if they chose the placement test, until it is completed. Non-students pass straight through.
 */
export function SetupGuard({ children, area = 'app' }: { children: ReactNode; area?: 'app' | 'placement' }) {
  const { user } = useAuth();
  const userId = user?.id;
  const isStudent = !!user?.roles.includes('student');
  const [state, setState] = useState<'checking' | 'ready' | 'start' | 'placement'>(
    !isStudent || (userId && isSetupDoneCached(userId)) ? 'ready' : 'checking',
  );

  useEffect(() => {
    if (!userId || !isStudent || isSetupDoneCached(userId)) { setState('ready'); return; }
    let alive = true;
    setState('checking');
    fetchSetupStatus().then((s) => {
      if (!alive) return;
      if (s.needsPlan || s.needsChoice) { setState('start'); return; }
      // The app is locked until the chosen placement test is completed; the placement area itself stays open.
      if (s.needsPlacement && area === 'app') { setState('placement'); return; }
      if (!setupPending(s)) cacheSetupDone(userId);
      setState('ready');
    });
    return () => { alive = false; };
  }, [userId, isStudent, area]);

  // Same loader the app shows while the session loads, so the check and the page's own loading read as one.
  if (state === 'checking') return area === 'placement' ? <PlacementPageSkeleton /> : <AppShellSkeleton />;
  if (state === 'start') return <Navigate to="/start" replace />;
  if (state === 'placement') return <Navigate to="/placement" replace />;
  return <>{children}</>;
}
