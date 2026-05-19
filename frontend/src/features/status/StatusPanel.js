import { useEffect, useState } from 'react';
import { API_BASE_URL, getHealthStatus } from '../../shared/api/client';
import './StatusPanel.css';

const initialState = {
  loading: true,
  status: 'checking',
  error: null,
};

function StatusPanel() {
  const [health, setHealth] = useState(initialState);

  useEffect(() => {
    let isMounted = true;

    getHealthStatus()
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setHealth({
          loading: false,
          status: data.status || 'unknown',
          error: null,
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        setHealth({
          loading: false,
          status: 'offline',
          error: error.message,
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isOnline = health.status === 'ok';
  const statusLabel = health.loading
    ? 'Checking'
    : isOnline
      ? 'Online'
      : 'Needs attention';

  return (
    <section className="status-panel" aria-label="Backend status">
      <div className="status-panel__header">
        <p className="status-panel__eyebrow">Backend</p>
        <div className={`status-panel__badge ${isOnline ? 'is-online' : ''}`}>
          <span className="status-panel__dot" aria-hidden="true" />
          {statusLabel}
        </div>
      </div>

      <div className="status-panel__body">
        <h2>API Health</h2>
        <p>{health.error || `Connected to ${API_BASE_URL}`}</p>
      </div>

      <dl className="status-panel__metrics">
        <div>
          <dt>Service</dt>
          <dd>AIM Backend</dd>
        </div>
        <div>
          <dt>Endpoint</dt>
          <dd>/health</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{health.status}</dd>
        </div>
      </dl>
    </section>
  );
}

export default StatusPanel;

