import { useEffect } from 'react';
import './App.css';
import WebPilot from '../pages/WebPilot';
import AlgorithmTester from '../pages/AlgorithmTester';
import AimDemo from '../pages/AimDemo';
import AdminDashboard from '../pages/AdminDashboard';
import ParentDashboard from '../pages/ParentDashboard';
import AdminNotificationMonitor from '../features/admin-notifications/pages/AdminNotificationMonitor';
import AdminTemplateMonitor from '../features/admin-notifications/pages/AdminTemplateMonitor';
import AdaptiveResult from '../pages/AdaptiveResult';

function App() {
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

  if (
    pathname === '/admin' ||
    pathname === '/debug' ||
    pathname === '/admin-dashboard'
  ) {
    return <AdminDashboard />;
  }

  if (pathname === '/parent' || pathname === '/parent-dashboard') {
    return <ParentDashboard />;
  }

  if (pathname === '/admin/notifications') {
    return <AdminNotificationMonitor />;
  }

  if (pathname === '/admin/notification-templates') {
    return <AdminTemplateMonitor />;
  }

  if (pathname === '/adaptive-result') {
    return <AdaptiveResult />;
  }

  // All student-facing routes are handled internally by WebPilot
  return <WebPilot />;
}

export default App;
