import { useEffect } from 'react';
import './App.css';
import WebPilot from '../pages/WebPilot';
import AlgorithmTester from '../pages/AlgorithmTester';
import AimDemo from '../pages/AimDemo';
import AdminDashboard from '../pages/AdminDashboard';
import ParentDashboard from '../pages/ParentDashboard';

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

  // All student-facing routes are handled internally by WebPilot
  return <WebPilot />;
}

export default App;
