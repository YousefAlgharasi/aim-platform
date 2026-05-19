import AlgorithmTester from '../pages/AlgorithmTester';
import AimDemo from '../pages/AimDemo';

function App() {
  if (window.location.pathname === '/aim-demo') {
    return <AimDemo />;
  }

  return <AlgorithmTester />;
}

export default App;

