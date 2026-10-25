import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePlacementGate } from '../features/placement/placementApi';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // First-login gate (Flutter parity): students who haven't chosen between the
  // placement test and starting from scratch are sent to the choice screen once.
  const isStudent = !!user?.roles.includes('student');
  const gate = usePlacementGate(isStudent);
  const onPlacementPath = pathname.startsWith('/placement');

  useEffect(() => {
    if (gate.shouldShowGate && !onPlacementPath) {
      navigate('/placement/gate', { replace: true });
    }
  }, [gate.shouldShowGate, onPlacementPath, navigate]);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <TopBar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
