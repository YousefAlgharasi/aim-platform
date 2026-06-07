import { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, getPilotAdminOverview } from '../shared/api/client';

function formatLabel(value) {
  return String(value || 'None')
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'None';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  return String(value);
}

function formatPercent(value) {
  if (value === null || value === undefined || value === '') {
    return 'None';
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${formatValue(numeric)}%` : formatValue(value);
}

function formatDate(value) {
  if (!value) {
    return 'None';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getTone(value) {
  const text = String(value || '').toLowerCase();

  if (text.includes('error') || text.includes('fail') || text.includes('wrong')) {
    return 'red';
  }

  if (text.includes('increase') || text.includes('successful') || text.includes('complete')) {
    return 'green';
  }

  if (text.includes('review') || text.includes('collect') || text.includes('evidence')) {
    return 'amber';
  }

  return 'blue';
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`admin-dashboard-badge admin-dashboard-badge--${tone}`}>{children}</span>;
}

function Metric({ label, value }) {
  return (
    <section className="admin-dashboard-metric">
      <span>{label}</span>
      <strong>{formatValue(value)}</strong>
    </section>
  );
}

function DataTable({ title, rows, columns, emptyText }) {
  return (
    <section className="admin-dashboard-panel">
      <div className="admin-dashboard-panel__header">
        <div>
          <p>Monitor</p>
          <h2>{title}</h2>
        </div>
        <Badge tone={rows.length > 0 ? 'green' : 'amber'}>{rows.length}</Badge>
      </div>

      {rows.length === 0 ? (
        <p className="admin-dashboard-empty">{emptyText}</p>
      ) : (
        <div className="admin-dashboard-table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id || row.session_id || `${title}-${index}`}>
                  {columns.map((column) => (
                    <td key={`${column.key}-${row.id || row.session_id || index}`}>
                      {column.render ? column.render(row) : formatValue(row[column.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [status, setStatus] = useState('Loading overview');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      setError('');
      setStatus('Loading overview');

      try {
        const data = await getPilotAdminOverview();
        if (!isMounted) {
          return;
        }

        setOverview(data);
        setStatus('Overview loaded');
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.message || 'Could not load admin overview.');
        setStatus('Load failed');
      }
    }

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = overview?.summary || {};
  const students = useMemo(() => overview?.students || [], [overview]);
  const sessions = useMemo(() => overview?.sessions || [], [overview]);
  const masteryChanges = useMemo(() => overview?.mastery_changes || [], [overview]);
  const recommendations = useMemo(() => overview?.recommendations || [], [overview]);
  const outcomes = useMemo(() => overview?.outcomes || [], [overview]);
  const events = useMemo(() => overview?.events || [], [overview]);

  return (
    <main className="admin-dashboard">
      <style>{styles}</style>

      <header className="admin-dashboard-header">
        <div>
          <p>AIM Web Pilot</p>
          <h1>Admin dashboard</h1>
          <span>Students, sessions, mastery movement, recommendations, outcomes, and audit events.</span>
        </div>
        <div className="admin-dashboard-header__badges">
          <Badge tone="blue">{API_BASE_URL}</Badge>
          <Badge tone={error ? 'red' : overview ? 'green' : 'amber'}>{status}</Badge>
        </div>
      </header>

      {error && (
        <section className="admin-dashboard-error" role="alert">
          {error}
        </section>
      )}

      <section className="admin-dashboard-metrics">
        <Metric label="Students" value={summary.students} />
        <Metric label="Sessions" value={summary.sessions} />
        <Metric label="Attempts" value={summary.attempts} />
        <Metric label="Recommendations" value={summary.recommendations} />
        <Metric label="Outcomes" value={summary.outcomes} />
        <Metric label="Audit events" value={summary.audit_events} />
      </section>

      <div className="admin-dashboard-grid">
        <DataTable
          title="Students"
          rows={students}
          emptyText="No pilot students found."
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'id', label: 'Student ID' },
            { key: 'email', label: 'Email' },
            { key: 'latest_mastery', label: 'Mastery', render: (row) => formatPercent(row.latest_mastery) },
            {
              key: 'latest_reliability',
              label: 'Reliability',
              render: (row) => formatValue(row.latest_reliability),
            },
            { key: 'latest_skill_id', label: 'Skill' },
          ]}
        />

        <DataTable
          title="Sessions"
          rows={sessions}
          emptyText="No lesson sessions found."
          columns={[
            { key: 'session_id', label: 'Session' },
            { key: 'student_id', label: 'Student' },
            { key: 'attempt_count', label: 'Attempts' },
            { key: 'accuracy', label: 'Accuracy', render: (row) => formatPercent(row.accuracy) },
            { key: 'latest_attempt_at', label: 'Latest attempt', render: (row) => formatDate(row.latest_attempt_at) },
          ]}
        />

        <DataTable
          title="Mastery changes"
          rows={masteryChanges}
          emptyText="No mastery state updates found."
          columns={[
            { key: 'student_id', label: 'Student' },
            { key: 'skill_id', label: 'Skill' },
            { key: 'mastery', label: 'Mastery', render: (row) => formatPercent(row.mastery) },
            { key: 'retention', label: 'Retention', render: (row) => formatPercent(row.retention) },
            { key: 'current_difficulty', label: 'Difficulty' },
            { key: 'updated_at', label: 'Updated', render: (row) => formatDate(row.updated_at) },
          ]}
        />

        <DataTable
          title="Recommendations"
          rows={recommendations}
          emptyText="No recommendation logs found."
          columns={[
            { key: 'student_id', label: 'Student' },
            {
              key: 'action_type',
              label: 'Action',
              render: (row) => <Badge tone={getTone(row.action_type)}>{formatLabel(row.action_type)}</Badge>,
            },
            { key: 'skill_id', label: 'Skill' },
            { key: 'difficulty', label: 'Difficulty' },
            { key: 'was_followed', label: 'Followed' },
            { key: 'created_at', label: 'Created', render: (row) => formatDate(row.created_at) },
          ]}
        />

        <DataTable
          title="Outcomes"
          rows={outcomes}
          emptyText="No outcome tracking records found."
          columns={[
            { key: 'recommendation_id', label: 'Recommendation' },
            {
              key: 'outcome',
              label: 'Outcome',
              render: (row) => <Badge tone={getTone(row.outcome)}>{formatLabel(row.outcome)}</Badge>,
            },
            { key: 'mastery_delta', label: 'Mastery delta' },
            { key: 'retention_delta', label: 'Retention delta' },
            { key: 'weakness_delta', label: 'Weakness delta' },
          ]}
        />

        <DataTable
          title="Events and errors"
          rows={events}
          emptyText="No audit events found."
          columns={[
            {
              key: 'action',
              label: 'Action',
              render: (row) => <Badge tone={getTone(row.action)}>{formatLabel(row.action)}</Badge>,
            },
            { key: 'entity_type', label: 'Entity' },
            { key: 'entity_id', label: 'Entity ID' },
            { key: 'student_id', label: 'Student' },
            { key: 'created_at', label: 'Created', render: (row) => formatDate(row.created_at) },
          ]}
        />
      </div>
    </main>
  );
}

const styles = `
.admin-dashboard {
  background: #f5f7fb;
  color: #172328;
  min-height: 100vh;
  padding: 28px;
}

.admin-dashboard-header,
.admin-dashboard-error,
.admin-dashboard-metrics,
.admin-dashboard-grid {
  margin-left: auto;
  margin-right: auto;
  max-width: 1360px;
}

.admin-dashboard-header {
  align-items: flex-start;
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 22px;
}

.admin-dashboard-header p,
.admin-dashboard-panel__header p {
  color: #3f6f78;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.admin-dashboard-header h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1;
  margin: 0 0 10px;
}

.admin-dashboard-header span,
.admin-dashboard-empty {
  color: #64748b;
  display: block;
  font-weight: 700;
}

.admin-dashboard-header__badges {
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  max-width: 560px;
}

.admin-dashboard-error,
.admin-dashboard-metric,
.admin-dashboard-panel {
  background: #ffffff;
  border: 1px solid #dbe4ef;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(31, 57, 87, 0.08);
}

.admin-dashboard-error {
  color: #b91c1c;
  font-weight: 800;
  margin-bottom: 16px;
  padding: 14px 16px;
}

.admin-dashboard-metrics {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-bottom: 16px;
}

.admin-dashboard-metric {
  display: grid;
  gap: 8px;
  min-height: 92px;
  padding: 16px;
}

.admin-dashboard-metric span,
.admin-dashboard-table-wrap th {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.admin-dashboard-metric strong {
  font-size: 1.9rem;
  line-height: 1;
}

.admin-dashboard-grid {
  display: grid;
  gap: 16px;
}

.admin-dashboard-panel {
  padding: 20px;
}

.admin-dashboard-panel__header {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 16px;
}

.admin-dashboard-panel__header h2 {
  line-height: 1.2;
  margin: 0;
}

.admin-dashboard-empty {
  margin: 0;
}

.admin-dashboard-table-wrap {
  overflow-x: auto;
}

.admin-dashboard table {
  border-collapse: collapse;
  min-width: 860px;
  width: 100%;
}

.admin-dashboard th,
.admin-dashboard td {
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 10px;
  text-align: left;
  vertical-align: top;
}

.admin-dashboard td {
  color: #172328;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.admin-dashboard tr:last-child td {
  border-bottom: 0;
}

.admin-dashboard-badge {
  border: 1px solid;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.8rem;
  font-weight: 900;
  line-height: 1.1;
  padding: 8px 10px;
  white-space: nowrap;
}

.admin-dashboard-badge--blue {
  background: #eef4ff;
  border-color: #bfdbfe;
  color: #164da8;
}

.admin-dashboard-badge--green {
  background: #ecfdf5;
  border-color: #86efac;
  color: #166534;
}

.admin-dashboard-badge--amber {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}

.admin-dashboard-badge--red {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

@media (max-width: 1120px) {
  .admin-dashboard-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .admin-dashboard {
    padding: 16px;
  }

  .admin-dashboard-header,
  .admin-dashboard-panel__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-dashboard-header__badges {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .admin-dashboard-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`;

export default AdminDashboard;
