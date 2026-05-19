import StatusPanel from '../features/status/StatusPanel';
import './App.css';

function App() {
  return (
    <main className="app-shell">
      <section className="app-shell__intro" aria-labelledby="app-title">
        <p className="app-shell__mark">AIM</p>
        <h1 id="app-title">Adaptive Intelligence Module</h1>
        <p>
          A focused operator view for checking that the learning API is ready
          before local development work begins.
        </p>
      </section>

      <StatusPanel />
    </main>
  );
}

export default App;

