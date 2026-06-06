import { useEffect } from 'react';
import AlgorithmTester from '../pages/AlgorithmTester';
import AimDemo from '../pages/AimDemo';
import AdaptiveResult from '../pages/AdaptiveResult';
import AdminDashboard from '../pages/AdminDashboard';
import LessonSession from '../pages/LessonSession';
import StudentLogin from '../pages/StudentLogin';

function App() {
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  }, []);

  const { pathname } = window.location;

  if (pathname === '/aim-demo') {
    return <AimDemo />;
  }

  if (
    pathname === '/lesson-session' ||
    pathname === '/aim-session' ||
    pathname === '/web-pilot/session'
  ) {
    return <LessonSession />;
  }

  if (
    pathname === '/adaptive-result' ||
    pathname === '/aim-result' ||
    pathname === '/web-pilot/result'
  ) {
    return <AdaptiveResult />;
  }

  if (
    pathname === '/admin' ||
    pathname === '/debug' ||
    pathname === '/admin-dashboard' ||
    pathname === '/web-pilot/admin'
  ) {
    return <AdminDashboard />;
  }

  if (pathname === '/login' || pathname === '/student-login') {
    return <StudentLogin />;
  }

  return <AlgorithmTester />;
}

export default App;
