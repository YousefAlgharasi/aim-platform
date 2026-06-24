import { useEffect, useState } from 'react';
import './App.css';
import WebPilot from '../pages/WebPilot';
import AlgorithmTester from '../pages/AlgorithmTester';
import AimDemo from '../pages/AimDemo';
import AdminDashboard from '../pages/AdminDashboard';
import ParentDashboard from '../pages/ParentDashboard';
import AdminNotificationMonitor from '../features/admin-notifications/pages/AdminNotificationMonitor';
import AdminTemplateMonitor from '../features/admin-notifications/pages/AdminTemplateMonitor';
import AdaptiveResult from '../pages/AdaptiveResult';
import { supabase } from '../shared/supabase/client';

function useAuthGuard() {
  const [authState, setAuthState] = useState({ loading: true, session: null });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthState({ loading: false, session: data.session });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({ loading: false, session });
    });

    return () => subscription.unsubscribe();
  }, []);

  return authState;
}

function App() {
  const { loading, session } = useAuthGuard();

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  }, []);

  const { pathname } = window.location;

  // Developer / internal tools — not linked from the student UI
  if (pathname === '/dev' || pathname === '/algorithm-tester') {
    return <AlgorithmTester />;
  }

  if (pathname === '/aim-demo') {
    return <AimDemo />;
  }

  const isAdminRoute =
    pathname === '/admin' ||
    pathname === '/debug' ||
    pathname === '/admin-dashboard' ||
    pathname === '/admin/notifications' ||
    pathname === '/admin/notification-templates';

  const isParentRoute =
    pathname === '/parent' || pathname === '/parent-dashboard';

  if (isAdminRoute || isParentRoute) {
    if (loading) {
      return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
    }
    if (!session) {
      window.location.href = '/';
      return null;
    }
  }

  if (isAdminRoute && pathname === '/admin/notifications') {
    return <AdminNotificationMonitor />;
  }

  if (isAdminRoute && pathname === '/admin/notification-templates') {
    return <AdminTemplateMonitor />;
  }

  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  if (isParentRoute) {
    return <ParentDashboard />;
  }

  if (pathname === '/adaptive-result') {
    return <AdaptiveResult />;
  }

  // All student-facing routes are handled internally by WebPilot
  return <WebPilot />;
}

export default App;
