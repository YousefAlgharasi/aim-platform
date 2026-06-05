import AlgorithmTester from '../pages/AlgorithmTester';
import AimDemo from '../pages/AimDemo';
import AdaptiveResult from '../pages/AdaptiveResult';
import LessonSession from '../pages/LessonSession';

function App() {
  if (window.location.pathname === '/aim-demo') {
    return <AimDemo />;
  }

  if (
    window.location.pathname === '/lesson-session' ||
    window.location.pathname === '/aim-session' ||
    window.location.pathname === '/web-pilot/session'
  ) {
    return <LessonSession />;
  }

  if (
    window.location.pathname === '/adaptive-result' ||
    window.location.pathname === '/aim-result' ||
    window.location.pathname === '/web-pilot/result'
  ) {
    return <AdaptiveResult />;
  }

  return <AlgorithmTester />;
}

export default App;