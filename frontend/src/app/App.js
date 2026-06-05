import AlgorithmTester from '../pages/AlgorithmTester';
import AimDemo from '../pages/AimDemo';
import WebPilot from '../pages/WebPilot';
import './App.css';

function App() {
  if (window.location.pathname === '/aim-demo') {
    return <AimDemo />;
  }

  if (window.location.pathname === '/algorithm-tester') {
    return <AlgorithmTester />;
  }

  return <WebPilot />;
}

export default App;

