// P13-066: Admin notification monitor UI.
//
// Read-only operations visibility into notification delivery/audit state.
// This page never triggers a send, retry, cancel, or preference change —
// it only reflects whatever the backend audit/delivery records return.

import { useEffect, useState } from 'react';
import { getAuditLogs, getDeliveryAttempts } from '../api/adminNotificationsApiClient';

function formatDate(value) {
  if (!value) return 'None';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`admin-dashboard-badge admin-dashboard-badge--${tone}`}>{children}</span>;
}

function AdminNotificationMonitor() {
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [eventIdLookup, setEventIdLookup] = useState('');
  const [attempts, setAttempts] = useState(null);
  const [attemptsError, setAttemptsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError('');
    getAuditLogs({ eventType: eventTypeFilter || undefined, userId: userIdFilter || undefined })
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : [];
        setLogs(items);
        setStatus(items.length > 0 ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [eventTypeFilter, userIdFilter]);

  async function handleLookupAttempts(e) {
    e.preventDefault();
    setAttemptsError('');
    setAttempts(null);
    if (!eventIdLookup) return;
    try {
      const data = await getDeliveryAttempts(eventIdLookup);
      setAttempts(Array.isArray(data) ? data : []);
    } catch (err) {
      setAttemptsError(err.message);
    }
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <p>AIM Operations</p>
          <h1>Notification monitor</h1>
          <span>Read-only delivery and audit visibility. No mutation actions are available here.</span>
        </div>
        <div className="admin-dashboard-header__badges">
          <Badge tone={error ? 'red' : status === 'ready' ? 'green' : 'amber'}>{status}</Badge>
        </div>
      </header>

      {error && (
        <section className="admin-dashboard-error" role="alert">
          {error}
        </section>
      )}

      <section className="admin-dashboard-panel">
        <div className="admin-dashboard-panel__header">
          <div>
            <p>Filters</p>
            <h2>Audit logs</h2>
          </div>
          <Badge tone={logs.length > 0 ? 'green' : 'amber'}>{logs.length}</Badge>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}
        >
          <label>
            Event type
            <input
              type="text"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              placeholder="notification_sent"
            />
          </label>
          <label>
            User ID
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="user uuid"
            />
          </label>
        </form>

        {status === 'loading' && <p>Loading audit logs...</p>}
        {status === 'empty' && <p className="admin-dashboard-empty">No audit log entries found.</p>}
        {status === 'ready' && (
          <div className="admin-dashboard-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Entity ID</th>
                  <th>User</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td>{log.event_type}</td>
                    <td>{log.resource_type}</td>
                    <td>{log.resource_id}</td>
                    <td>{log.user_id}</td>
                    <td>{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-dashboard-panel">
        <div className="admin-dashboard-panel__header">
          <div>
            <p>Lookup</p>
            <h2>Delivery attempts</h2>
          </div>
        </div>
        <form onSubmit={handleLookupAttempts} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <label>
            Event ID
            <input
              type="text"
              value={eventIdLookup}
              onChange={(e) => setEventIdLookup(e.target.value)}
              placeholder="notification event uuid"
              aria-label="Notification event ID"
            />
          </label>
          <button type="submit">View attempts</button>
        </form>

        {attemptsError && (
          <section className="admin-dashboard-error" role="alert">
            {attemptsError}
          </section>
        )}

        {attempts && attempts.length === 0 && (
          <p className="admin-dashboard-empty">No delivery attempts found for this event.</p>
        )}

        {attempts && attempts.length > 0 && (
          <div className="admin-dashboard-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Attempted at</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt, index) => (
                  <tr key={attempt.id || index}>
                    <td>{attempt.channel}</td>
                    <td>{attempt.status}</td>
                    <td>{formatDate(attempt.attempted_at || attempt.created_at)}</td>
                    <td>{attempt.error_message || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminNotificationMonitor;
