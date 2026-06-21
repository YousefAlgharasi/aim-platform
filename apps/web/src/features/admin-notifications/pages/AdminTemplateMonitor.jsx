// P13-067: Admin notification template read-only UI.
//
// Lets admins inspect active/inactive notification templates. This page
// never edits, activates, or deactivates a template — it only displays
// what the backend's template store returns.

import { useEffect, useState } from 'react';
import { getTemplates, getTemplate } from '../api/adminNotificationsApiClient';

function Badge({ children, tone = 'blue' }) {
  return <span className={`admin-dashboard-badge admin-dashboard-badge--${tone}`}>{children}</span>;
}

function statusTone(status) {
  return status === 'active' ? 'green' : 'amber';
}

function AdminTemplateMonitor() {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getTemplates()
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : [];
        setTemplates(items);
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
  }, []);

  async function handleSelect(templateId) {
    setSelectedId(templateId);
    setDetailError('');
    setSelectedTemplate(null);
    try {
      const data = await getTemplate(templateId);
      setSelectedTemplate(data);
    } catch (err) {
      setDetailError(err.message);
    }
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <p>AIM Operations</p>
          <h1>Notification templates</h1>
          <span>Read-only template inspection. No edit, activate, or deactivate actions are available here.</span>
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
            <p>List</p>
            <h2>Templates</h2>
          </div>
          <Badge tone={templates.length > 0 ? 'green' : 'amber'}>{templates.length}</Badge>
        </div>

        {status === 'loading' && <p>Loading templates...</p>}
        {status === 'empty' && <p className="admin-dashboard-empty">No templates found.</p>}
        {status === 'ready' && (
          <div className="admin-dashboard-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Category</th>
                  <th>Channel</th>
                  <th>Locale</th>
                  <th>Status</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.key}</td>
                    <td>{template.category}</td>
                    <td>{template.channel}</td>
                    <td>{template.locale}</td>
                    <td>
                      <Badge tone={statusTone(template.status)}>{template.status}</Badge>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleSelect(template.id)}
                        aria-label={`View template detail: ${template.key}`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedId && (
        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-panel__header">
            <div>
              <p>Detail</p>
              <h2>{selectedTemplate?.key || selectedId}</h2>
            </div>
          </div>

          {detailError && (
            <section className="admin-dashboard-error" role="alert">
              {detailError}
            </section>
          )}

          {selectedTemplate && (
            <dl>
              <dt>Title template</dt>
              <dd>{selectedTemplate.title_template}</dd>
              <dt>Body template</dt>
              <dd>{selectedTemplate.body_template}</dd>
              <dt>Channel</dt>
              <dd>{selectedTemplate.channel}</dd>
              <dt>Locale</dt>
              <dd>{selectedTemplate.locale}</dd>
              <dt>Status</dt>
              <dd>{selectedTemplate.status}</dd>
            </dl>
          )}
        </section>
      )}
    </main>
  );
}

export default AdminTemplateMonitor;
