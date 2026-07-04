// P18-078: Create Admin AI Audit UI
// Read-only listing of recent AI Teacher audit log rows (requests,
// safety events, prompt/config changes, cost events). Renders only the
// safe metadata recorded server-side at write time — never raw provider
// payloads, secrets, or API keys.

import { useEffect, useState } from 'react';
import { listRecentAuditLogs } from '../api';
import './AdminAiPages.css';

function formatDetails(details) {
  if (details === null || details === undefined) return '—';
  if (typeof details === 'string') return details;
  try {
    return JSON.stringify(details);
  } catch {
    return '—';
  }
}

function AdminAiAudit() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  function fetchAuditLogs() {
    setStatus('loading');
    listRecentAuditLogs()
      .then((result) => {
        const items = result?.logs || result || [];
        setLogs(items);
        setStatus(items.length > 0 ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (err.status === 403) {
          setStatus('forbidden');
        } else {
          setError(err.message);
          setStatus('error');
        }
      });
  }

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (status === 'loading') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--loading" role="status">
        جاري تحميل سجل التدقيق...
      </p>
    );
  }

  if (status === 'forbidden') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--forbidden" role="alert">
        ليس لديك صلاحية الوصول إلى سجل التدقيق.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--error" role="alert">
        {error || 'حدث خطأ أثناء تحميل سجل التدقيق.'}
      </p>
    );
  }

  return (
    <div className="admin-ai-page">
      <h2 className="admin-ai-page__title">سجل التدقيق</h2>

      <section className="admin-ai-page__section">
        {status === 'empty' || logs.length === 0 ? (
          <p className="admin-ai-page__status admin-ai-page__status--empty" role="status">
            لا توجد سجلات تدقيق حتى الآن.
          </p>
        ) : (
          <table className="admin-ai-table" aria-label="سجلات التدقيق">
            <thead>
              <tr>
                <th>الإجراء</th>
                <th>نوع المورد</th>
                <th>معرف المورد</th>
                <th>الفاعل</th>
                <th>تفاصيل</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.action}</td>
                  <td>{log.resource_type}</td>
                  <td>{log.resource_id || '—'}</td>
                  <td>{log.actor_id || '—'}</td>
                  <td>{formatDetails(log.details)}</td>
                  <td>{log.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminAiAudit;
