// P17-069: Admin maintenance UI
// Table: title, type, status, scheduled start/end.
// Create window form and update status action.
// Backend is the final authority for all maintenance data.
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../../../lib/api/client-api-helpers';

import { OperationsLoadingSpinner } from '../../../../components/operations/operations-loading-spinner';
import { OperationsEmptyState } from '../../../../components/operations/operations-empty-state';
import { OperationsErrorCard } from '../../../../components/operations/operations-error-card';

type MaintenanceWindow = {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly status: string;
  readonly scheduledStart: string;
  readonly scheduledEnd: string;
};

type MaintenanceResponse = {
  readonly data: readonly MaintenanceWindow[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

const TYPE_CLASSES: Record<string, string> = {
  planned:    'ops-badge--info',
  emergency:  'ops-badge--error',
  routine:    'ops-badge--neutral',
  upgrade:    'ops-badge--primary',
};

const STATUS_CLASSES: Record<string, string> = {
  scheduled:   'ops-badge--info',
  in_progress: 'ops-badge--warning',
  completed:   'ops-badge--success',
  cancelled:   'ops-badge--neutral',
};

export default function MaintenancePage() {
  const [windows, setWindows] = useState<readonly MaintenanceWindow[]>([]);
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
  const [newType, setNewType] = useState('planned');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  const fetchWindows = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch('/admin/maintenance-windows');
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const items: MaintenanceWindow[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setWindows(items);
      setTotal(items.length);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance windows.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWindows(1);
  }, [fetchWindows]);

  async function handleUpdateStatus(windowId: string, newStatus: string) {
    setActionLoading(windowId);
    try {
      const res = await backendFetch(`/admin/maintenance-windows/${windowId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
      await fetchWindows(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update maintenance status.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateWindow(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newStart || !newEnd) return;
    setCreateLoading(true);
    try {
      const res = await backendFetch('/admin/maintenance-windows', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          type: newType,
          scheduledStart: newStart,
          scheduledEnd: newEnd,
          affectedServices: [],
        }),
      });
      if (!res.ok) throw new Error(`Failed to create maintenance window: ${res.statusText}`);
      setNewTitle('');
      setNewType('planned');
      setNewStart('');
      setNewEnd('');
      setShowCreateForm(false);
      await fetchWindows(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create maintenance window.');
    } finally {
      setCreateLoading(false);
    }
  }

  if (loading) {
    return <OperationsLoadingSpinner message="Loading maintenance windows..." />;
  }

  if (error && windows.length === 0) {
    return <OperationsErrorCard message={error} onRetry={() => fetchWindows(page)} />;
  }

  return (
    <div className="ops-maintenance">
      <header className="ops-maintenance-header">
        <div className="ops-maintenance-header-row">
          <div>
            <p className="ops-eyebrow">Operations</p>
            <h1 className="ops-page-title">Maintenance</h1>
            <p className="ops-page-meta">{total} window{total !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="ops-create-btn"
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ New Window'}
          </button>
        </div>
      </header>

      {error && (
        <div className="ops-inline-error" role="alert">{error}</div>
      )}

      {showCreateForm && (
        <form className="ops-create-form" onSubmit={handleCreateWindow}>
          <h2 className="ops-create-form-title">Create Maintenance Window</h2>
          <div className="ops-create-form-fields">
            <div className="ops-form-field">
              <label htmlFor="maint-title" className="ops-form-label">Title</label>
              <input
                id="maint-title"
                className="ops-form-input"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Maintenance window title"
                required
                disabled={createLoading}
              />
            </div>
            <div className="ops-form-field">
              <label htmlFor="maint-type" className="ops-form-label">Type</label>
              <select
                id="maint-type"
                className="ops-form-select"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                disabled={createLoading}
              >
                <option value="planned">Planned</option>
                <option value="emergency">Emergency</option>
                <option value="routine">Routine</option>
                <option value="upgrade">Upgrade</option>
              </select>
            </div>
            <div className="ops-form-field">
              <label htmlFor="maint-start" className="ops-form-label">Scheduled Start</label>
              <input
                id="maint-start"
                className="ops-form-input"
                type="datetime-local"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                required
                disabled={createLoading}
              />
            </div>
            <div className="ops-form-field">
              <label htmlFor="maint-end" className="ops-form-label">Scheduled End</label>
              <input
                id="maint-end"
                className="ops-form-input"
                type="datetime-local"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                required
                disabled={createLoading}
              />
            </div>
          </div>
          <div className="ops-create-form-actions">
            <button className="ops-submit-btn" type="submit" disabled={createLoading || !newTitle.trim() || !newStart || !newEnd}>
              {createLoading ? 'Creating...' : 'Create Window'}
            </button>
            <button className="ops-cancel-btn" type="button" onClick={() => setShowCreateForm(false)} disabled={createLoading}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {windows.length === 0 ? (
        <OperationsEmptyState message="No maintenance windows found." />
      ) : (
        <div className="ops-table-wrapper" role="region" aria-label="Maintenance windows table">
          <table className="ops-table">
            <caption className="ops-table-caption">{total} maintenance windows</caption>
            <thead>
              <tr>
                <th className="ops-table-th" scope="col">Title</th>
                <th className="ops-table-th" scope="col">Type</th>
                <th className="ops-table-th" scope="col">Status</th>
                <th className="ops-table-th" scope="col">Scheduled Start</th>
                <th className="ops-table-th" scope="col">Scheduled End</th>
                <th className="ops-table-th" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {windows.map((w) => (
                <tr key={w.id} className="ops-table-row">
                  <td className="ops-table-td ops-table-td--primary">{w.title}</td>
                  <td className="ops-table-td">
                    <span className={`ops-badge ${TYPE_CLASSES[w.type] ?? 'ops-badge--neutral'}`}>
                      {w.type}
                    </span>
                  </td>
                  <td className="ops-table-td">
                    <span className={`ops-badge ${STATUS_CLASSES[w.status] ?? 'ops-badge--neutral'}`}>
                      {w.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="ops-table-td ops-table-td--date">
                    {new Date(w.scheduledStart).toLocaleString()}
                  </td>
                  <td className="ops-table-td ops-table-td--date">
                    {new Date(w.scheduledEnd).toLocaleString()}
                  </td>
                  <td className="ops-table-td">
                    <select
                      className="ops-action-select"
                      value={w.status}
                      onChange={(e) => handleUpdateStatus(w.id, e.target.value)}
                      disabled={actionLoading === w.id}
                      aria-label={`Update status for ${w.title}`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
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
          <button className="ops-pagination-btn" type="button" disabled={page <= 1} onClick={() => fetchWindows(page - 1)}>
            Previous
          </button>
          <span className="ops-pagination-info">Page {page} of {totalPages}</span>
          <button className="ops-pagination-btn" type="button" disabled={page >= totalPages} onClick={() => fetchWindows(page + 1)}>
            Next
          </button>
        </div>
      )}

      <style>{`
        .ops-maintenance { display: flex; flex-direction: column; gap: var(--space-24); }
        .ops-maintenance-header { display: flex; flex-direction: column; gap: var(--space-4); }
        .ops-maintenance-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-16); flex-wrap: wrap; }

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
          .ops-create-form-fields { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
