import AlgorithmTester from '../pages/AlgorithmTester';
import AimDemo from '../pages/AimDemo';
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

  return <AlgorithmTester />;
}

export default App;

