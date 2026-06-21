// P17-068: Admin incidents UI
// Table: title, severity, status, started, resolved.
// Create incident form and update status action.
// Backend is the final authority for all incident data.
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { OperationsLoadingSpinner } from '../../../../components/operations/operations-loading-spinner';
import { OperationsEmptyState } from '../../../../components/operations/operations-empty-state';
import { OperationsErrorCard } from '../../../../components/operations/operations-error-card';

type Incident = {
  readonly id: string;
  readonly title: string;
  readonly severity: string;
  readonly status: string;
  readonly startedAt: string;
  readonly resolvedAt: string | null;
};

type IncidentsResponse = {
  readonly data: readonly Incident[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

const SEVERITY_CLASSES: Record<string, string> = {
  critical: 'ops-badge--error',
  major:    'ops-badge--warning',
  minor:    'ops-badge--info',
  low:      'ops-badge--neutral',
};

const STATUS_CLASSES: Record<string, string> = {
  investigating: 'ops-badge--warning',
  identified:    'ops-badge--info',
  monitoring:    'ops-badge--primary',
  resolved:      'ops-badge--success',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<readonly Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newSeverity, setNewSeverity] = useState('minor');

  const fetchIncidents = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/operations/incidents?page=${p}&limit=20`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const data: IncidentsResponse = await res.json();
      setIncidents(data.data);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents(1);
  }, [fetchIncidents]);

  async function handleUpdateStatus(incidentId: string, newStatus: string) {
    setActionLoading(incidentId);
    try {
      const res = await fetch(`/api/admin/operations/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
      await fetchIncidents(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update incident status.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateIncident(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/operations/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle.trim(), severity: newSeverity }),
      });
      if (!res.ok) throw new Error(`Failed to create incident: ${res.statusText}`);
      setNewTitle('');
      setNewSeverity('minor');
      setShowCreateForm(false);
      await fetchIncidents(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create incident.');
    } finally {
      setCreateLoading(false);
    }
  }

  if (loading) {
    return <OperationsLoadingSpinner message="Loading incidents..." />;
  }

  if (error && incidents.length === 0) {
    return <OperationsErrorCard message={error} onRetry={() => fetchIncidents(page)} />;
  }

  return (
    <div className="ops-incidents">
      <header className="ops-incidents-header">
        <div className="ops-incidents-header-row">
          <div>
            <p className="ops-eyebrow">Operations</p>
            <h1 className="ops-page-title">Incidents</h1>
            <p className="ops-page-meta">{total} incident{total !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="ops-create-btn"
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ New Incident'}
          </button>
        </div>
      </header>

      {error && (
        <div className="ops-inline-error" role="alert">{error}</div>
      )}

      {showCreateForm && (
        <form className="ops-create-form" onSubmit={handleCreateIncident}>
          <h2 className="ops-create-form-title">Create Incident</h2>
          <div className="ops-create-form-fields">
            <div className="ops-form-field">
              <label htmlFor="incident-title" className="ops-form-label">Title</label>
              <input
                id="incident-title"
                className="ops-form-input"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Incident title"
                required
                disabled={createLoading}
              />
            </div>
            <div className="ops-form-field">
              <label htmlFor="incident-severity" className="ops-form-label">Severity</label>
              <select
                id="incident-severity"
                className="ops-form-select"
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value)}
                disabled={createLoading}
              >
                <option value="low">Low</option>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="ops-create-form-actions">
            <button className="ops-submit-btn" type="submit" disabled={createLoading || !newTitle.trim()}>
              {createLoading ? 'Creating...' : 'Create Incident'}
            </button>
            <button className="ops-cancel-btn" type="button" onClick={() => setShowCreateForm(false)} disabled={createLoading}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {incidents.length === 0 ? (
        <OperationsEmptyState message="No incidents found." />
      ) : (
        <div className="ops-table-wrapper" role="region" aria-label="Incidents table">
          <table className="ops-table">
            <caption className="ops-table-caption">{total} incidents</caption>
            <thead>
              <tr>
                <th className="ops-table-th" scope="col">Title</th>
                <th className="ops-table-th" scope="col">Severity</th>
                <th className="ops-table-th" scope="col">Status</th>
                <th className="ops-table-th" scope="col">Started</th>
                <th className="ops-table-th" scope="col">Resolved</th>
                <th className="ops-table-th" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id} className="ops-table-row">
                  <td className="ops-table-td ops-table-td--primary">{incident.title}</td>
                  <td className="ops-table-td">
                    <span className={`ops-badge ${SEVERITY_CLASSES[incident.severity] ?? 'ops-badge--neutral'}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="ops-table-td">
                    <span className={`ops-badge ${STATUS_CLASSES[incident.status] ?? 'ops-badge--neutral'}`}>
                      {incident.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="ops-table-td ops-table-td--date">
                    {new Date(incident.startedAt).toLocaleString()}
                  </td>
                  <td className="ops-table-td ops-table-td--date">
                    {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : '—'}
                  </td>
                  <td className="ops-table-td">
                    <select
                      className="ops-action-select"
                      value={incident.status}
                      onChange={(e) => handleUpdateStatus(incident.id, e.target.value)}
                      disabled={actionLoading === incident.id}
                      aria-label={`Update status for ${incident.title}`}
                    >
                      <option value="investigating">Investigating</option>
                      <option value="identified">Identified</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="ops-pagination" role="navigation" aria-label="Pagination">
          <button className="ops-pagination-btn" type="button" disabled={page <= 1} onClick={() => fetchIncidents(page - 1)}>
            Previous
          </button>
          <span className="ops-pagination-info">Page {page} of {totalPages}</span>
          <button className="ops-pagination-btn" type="button" disabled={page >= totalPages} onClick={() => fetchIncidents(page + 1)}>
            Next
          </button>
        </div>
      )}

      <style>{`
        .ops-incidents { display: flex; flex-direction: column; gap: var(--space-24); }
        .ops-incidents-header { display: flex; flex-direction: column; gap: var(--space-4); }
        .ops-incidents-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-16); flex-wrap: wrap; }

        .ops-eyebrow {
          margin: 0; font-size: 12px; font-weight: var(--weight-semibold);
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);
        }
        .ops-page-title { margin: 0; font-size: 24px; font-weight: var(--weight-bold); color: var(--text-primary); }
        .ops-page-meta { margin: 0; font-size: 14px; color: var(--text-secondary); }

        .ops-inline-error {
          padding: var(--space-12) var(--space-16); background: var(--error-soft);
          border: 1px solid var(--color-error-200); border-radius: var(--radius-md);
          font-size: 13px; color: var(--color-error-700);
        }

        .ops-create-btn {
          height: var(--size-btn-md); padding: 0 var(--space-20);
          border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: var(--text-on-primary);
          font-size: 14px; font-weight: var(--weight-semibold); font-family: inherit;
          cursor: pointer; transition: background var(--duration-fast) var(--ease-standard);
        }
        .ops-create-btn:hover { background: var(--color-primary-600); }
        .ops-create-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

        .ops-create-form {
          padding: var(--space-20); border: 1px solid var(--border);
          border-radius: var(--radius-lg); background: var(--surface);
          display: flex; flex-direction: column; gap: var(--space-16);
        }
        .ops-create-form-title { margin: 0; font-size: 17px; font-weight: var(--weight-semibold); color: var(--text-primary); }
        .ops-create-form-fields { display: flex; gap: var(--space-16); flex-wrap: wrap; }
        .ops-create-form-actions { display: flex; gap: var(--space-8); }

        .ops-form-field { display: flex; flex-direction: column; gap: var(--space-4); flex: 1; min-width: 200px; }
        .ops-form-label { font-size: 12px; font-weight: var(--weight-semibold); color: var(--text-secondary); }
        .ops-form-input {
          height: var(--size-btn-md); padding: 0 var(--space-12); border: 1px solid var(--border);
          border-radius: var(--radius-md); font-size: 14px; font-family: inherit;
          background: var(--surface); color: var(--text-primary);
        }
        .ops-form-input:focus { outline: none; box-shadow: var(--shadow-focus); }
        .ops-form-select {
          height: var(--size-btn-md); padding: 0 var(--space-12); border: 1px solid var(--border);
          border-radius: var(--radius-md); font-size: 14px; font-family: inherit;
          background: var(--surface); color: var(--text-primary); cursor: pointer;
        }
        .ops-form-select:focus { outline: none; box-shadow: var(--shadow-focus); }

        .ops-submit-btn {
          height: var(--size-btn-md); padding: 0 var(--space-20); border: none;
          border-radius: var(--radius-md); background: var(--color-primary-500);
          color: var(--text-on-primary); font-size: 14px; font-weight: var(--weight-semibold);
          font-family: inherit; cursor: pointer;
        }
        .ops-submit-btn:hover:not(:disabled) { background: var(--color-primary-600); }
        .ops-submit-btn:disabled { background: var(--disabled-bg); color: var(--disabled-fg); cursor: not-allowed; }
        .ops-submit-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

        .ops-cancel-btn {
          height: var(--size-btn-md); padding: 0 var(--space-20); border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface); color: var(--text-secondary);
          font-size: 14px; font-weight: var(--weight-medium); font-family: inherit; cursor: pointer;
        }
        .ops-cancel-btn:hover:not(:disabled) { background: var(--state-hover); }
        .ops-cancel-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

        .ops-table-wrapper {
          overflow-x: auto; border: 1px solid var(--border);
          border-radius: var(--radius-lg); background: var(--surface);
        }
        .ops-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ops-table-caption { text-align: start; padding: var(--space-12) var(--space-16); font-size: 12px; color: var(--text-muted); }
        .ops-table-th {
          text-align: start; padding: var(--space-8) var(--space-16);
          font-size: 12px; font-weight: var(--weight-semibold);
          color: var(--text-secondary); border-bottom: 1px solid var(--border);
          white-space: nowrap; background: var(--surface-raised);
        }
        .ops-table-row { transition: background var(--duration-fast) var(--ease-standard); }
        .ops-table-row:hover { background: var(--state-hover); }
        .ops-table-td {
          padding: var(--space-8) var(--space-16); border-bottom: 1px solid var(--border);
          color: var(--text-primary); vertical-align: middle;
        }
        .ops-table-td--primary { font-weight: var(--weight-medium); }
        .ops-table-td--date { white-space: nowrap; color: var(--text-secondary); font-size: 12px; }

        .ops-badge {
          display: inline-flex; padding: 2px var(--space-8); border-radius: var(--radius-sm);
          font-size: 11px; font-weight: var(--weight-semibold); text-transform: capitalize;
        }
        .ops-badge--primary { background: var(--primary-soft); color: var(--color-primary-700); }
        .ops-badge--success { background: var(--success-soft); color: var(--color-success-700); }
        .ops-badge--warning { background: var(--warning-soft); color: var(--color-warning-700); }
        .ops-badge--error   { background: var(--error-soft);   color: var(--color-error-700); }
        .ops-badge--info    { background: var(--info-soft);    color: var(--color-info-700); }
        .ops-badge--neutral { background: var(--neutral-soft); color: var(--text-secondary); }

        .ops-action-select {
          height: var(--size-btn-sm); padding: 0 var(--space-8); border: 1px solid var(--border);
          border-radius: var(--radius-sm); font-size: 12px; font-family: inherit;
          background: var(--surface); color: var(--text-primary); cursor: pointer;
        }
        .ops-action-select:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

        .ops-pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-16); }
        .ops-pagination-btn {
          height: var(--size-btn-sm); padding: 0 var(--space-16); border: 1px solid var(--border);
          border-radius: var(--radius-md); font-size: 13px; font-family: inherit;
          background: var(--surface); color: var(--text-primary); cursor: pointer;
        }
        .ops-pagination-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .ops-pagination-btn:hover:not(:disabled) { background: var(--state-hover); }
        .ops-pagination-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .ops-pagination-info { font-size: 13px; color: var(--text-secondary); }

        @media (max-width: 768px) {
          .ops-table-th, .ops-table-td { padding: var(--space-4) var(--space-8); }
        }
      `}</style>
    </div>
  );
}
