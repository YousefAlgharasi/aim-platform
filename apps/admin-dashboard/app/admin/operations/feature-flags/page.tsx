// P17-071: Admin feature flags UI
// Table: key, name, enabled, rollout %, owner.
// Actions: create flag, toggle enabled, update rollout %.
// Backend is the final authority for all feature flag data.
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../../../lib/api/client-api-helpers';

import { OperationsLoadingSpinner } from '../../../../components/operations/operations-loading-spinner';
import { OperationsEmptyState } from '../../../../components/operations/operations-empty-state';
import { OperationsErrorCard } from '../../../../components/operations/operations-error-card';

type FeatureFlag = {
  readonly id: string;
  readonly flagKey: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly rolloutPercentage: number;
  readonly ownerId: string | null;
  readonly description: string | null;
};

type FeatureFlagsResponse = {
  readonly data: readonly FeatureFlag[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<readonly FeatureFlag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Create form state
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newRollout, setNewRollout] = useState(0);

  // Inline rollout editing
  const [editingRollout, setEditingRollout] = useState<string | null>(null);
  const [editRolloutValue, setEditRolloutValue] = useState(0);

  const fetchFlags = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch('/admin/feature-flags');
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const items: FeatureFlag[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setFlags(items);
      setTotal(items.length);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags(1);
  }, [fetchFlags]);

  async function handleToggleEnabled(flagId: string, currentEnabled: boolean) {
    setActionLoading(flagId);
    try {
      const res = await backendFetch(`/admin/feature-flags/${flagId}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (!res.ok) throw new Error(`Failed to toggle flag: ${res.statusText}`);
      await fetchFlags(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle feature flag.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUpdateRollout(flagId: string) {
    setActionLoading(flagId);
    try {
      const res = await backendFetch(`/admin/feature-flags/${flagId}`, {
        method: 'PATCH',
        body: JSON.stringify({ rolloutPercentage: editRolloutValue }),
      });
      if (!res.ok) throw new Error(`Failed to update rollout: ${res.statusText}`);
      setEditingRollout(null);
      await fetchFlags(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rollout percentage.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey.trim() || !newName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await backendFetch('/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({
          flagKey: newKey.trim(),
          name: newName.trim(),
          description: newOwner.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error(`Failed to create feature flag: ${res.statusText}`);
      setNewKey('');
      setNewName('');
      setNewOwner('');
      setNewRollout(0);
      setShowCreateForm(false);
      await fetchFlags(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feature flag.');
    } finally {
      setCreateLoading(false);
    }
  }

  function startEditRollout(flag: FeatureFlag) {
    setEditingRollout(flag.id);
    setEditRolloutValue(flag.rolloutPercentage);
  }

  if (loading) {
    return <OperationsLoadingSpinner message="Loading feature flags..." />;
  }

  if (error && flags.length === 0) {
    return <OperationsErrorCard message={error} onRetry={() => fetchFlags(page)} />;
  }

  return (
    <div className="ops-flags">
      <header className="ops-flags-header">
        <div className="ops-flags-header-row">
          <div>
            <p className="ops-eyebrow">Operations</p>
            <h1 className="ops-page-title">Feature Flags</h1>
            <p className="ops-page-meta">{total} flag{total !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="ops-create-btn"
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ New Flag'}
          </button>
        </div>
      </header>

      {error && (
        <div className="ops-inline-error" role="alert">{error}</div>
      )}

      {showCreateForm && (
        <form className="ops-create-form" onSubmit={handleCreateFlag}>
          <h2 className="ops-create-form-title">Create Feature Flag</h2>
          <div className="ops-create-form-fields">
            <div className="ops-form-field">
              <label htmlFor="ff-key" className="ops-form-label">Key</label>
              <input
                id="ff-key"
                className="ops-form-input ops-form-input--mono"
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. enable_new_dashboard"
                required
                disabled={createLoading}
              />
            </div>
            <div className="ops-form-field">
              <label htmlFor="ff-name" className="ops-form-label">Name</label>
              <input
                id="ff-name"
                className="ops-form-input"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Display name"
                required
                disabled={createLoading}
              />
            </div>
            <div className="ops-form-field">
              <label htmlFor="ff-owner" className="ops-form-label">Description</label>
              <input
                id="ff-owner"
                className="ops-form-input"
                type="text"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Flag description"
                disabled={createLoading}
              />
            </div>
            <div className="ops-form-field">
              <label htmlFor="ff-rollout" className="ops-form-label">Rollout %</label>
              <input
                id="ff-rollout"
                className="ops-form-input"
                type="number"
                min={0}
                max={100}
                value={newRollout}
                onChange={(e) => setNewRollout(Number(e.target.value))}
                disabled={createLoading}
              />
            </div>
          </div>
          <div className="ops-create-form-actions">
            <button className="ops-submit-btn" type="submit" disabled={createLoading || !newKey.trim() || !newName.trim()}>
              {createLoading ? 'Creating...' : 'Create Flag'}
            </button>
            <button className="ops-cancel-btn" type="button" onClick={() => setShowCreateForm(false)} disabled={createLoading}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {flags.length === 0 ? (
        <OperationsEmptyState message="No feature flags found." />
      ) : (
        <div className="ops-table-wrapper" role="region" aria-label="Feature flags table">
          <table className="ops-table">
            <caption className="ops-table-caption">{total} feature flags</caption>
            <thead>
              <tr>
                <th className="ops-table-th" scope="col">Key</th>
                <th className="ops-table-th" scope="col">Name</th>
                <th className="ops-table-th" scope="col">Enabled</th>
                <th className="ops-table-th" scope="col">Rollout %</th>
                <th className="ops-table-th" scope="col">Owner</th>
                <th className="ops-table-th" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.id} className="ops-table-row">
                  <td className="ops-table-td">
                    <code className="ops-flag-key">{flag.flagKey}</code>
                  </td>
                  <td className="ops-table-td ops-table-td--primary">{flag.name}</td>
                  <td className="ops-table-td">
                    <span className={`ops-badge ${flag.enabled ? 'ops-badge--success' : 'ops-badge--neutral'}`}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="ops-table-td">
                    {editingRollout === flag.id ? (
                      <span className="ops-rollout-edit">
                        <input
                          className="ops-rollout-input"
                          type="number"
                          min={0}
                          max={100}
                          value={editRolloutValue}
                          onChange={(e) => setEditRolloutValue(Number(e.target.value))}
                          disabled={actionLoading === flag.id}
                          aria-label={`Rollout percentage for ${flag.name}`}
                        />
                        <button
                          className="ops-action-btn-sm"
                          type="button"
                          onClick={() => handleUpdateRollout(flag.id)}
                          disabled={actionLoading === flag.id}
                        >
                          Save
                        </button>
                        <button
                          className="ops-action-btn-sm ops-action-btn-sm--ghost"
                          type="button"
                          onClick={() => setEditingRollout(null)}
                          disabled={actionLoading === flag.id}
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        className="ops-rollout-display"
                        type="button"
                        onClick={() => startEditRollout(flag)}
                        aria-label={`Edit rollout percentage for ${flag.name}, currently ${flag.rolloutPercentage}%`}
                      >
                        {flag.rolloutPercentage}%
                      </button>
                    )}
                  </td>
                  <td className="ops-table-td">{flag.ownerId || '—'}</td>
                  <td className="ops-table-td">
                    <button
                      className={`ops-toggle-btn ${flag.enabled ? 'ops-toggle-btn--on' : 'ops-toggle-btn--off'}`}
                      type="button"
                      onClick={() => handleToggleEnabled(flag.id, flag.enabled)}
                      disabled={actionLoading === flag.id}
                      aria-label={`${flag.enabled ? 'Disable' : 'Enable'} ${flag.name}`}
                    >
                      {flag.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="ops-pagination" role="navigation" aria-label="Pagination">
          <button className="ops-pagination-btn" type="button" disabled={page <= 1} onClick={() => fetchFlags(page - 1)}>
            Previous
          </button>
          <span className="ops-pagination-info">Page {page} of {totalPages}</span>
          <button className="ops-pagination-btn" type="button" disabled={page >= totalPages} onClick={() => fetchFlags(page + 1)}>
            Next
          </button>
        </div>
      )}

      <style>{`
        .ops-flags { display: flex; flex-direction: column; gap: var(--space-24); }
        .ops-flags-header { display: flex; flex-direction: column; gap: var(--space-4); }
        .ops-flags-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-16); flex-wrap: wrap; }

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

        .ops-form-field { display: flex; flex-direction: column; gap: var(--space-4); flex: 1; min-width: 180px; }
        .ops-form-label { font-size: 12px; font-weight: var(--weight-semibold); color: var(--text-secondary); }
        .ops-form-input {
          height: var(--size-btn-md); padding: 0 var(--space-12); border: 1px solid var(--border);
          border-radius: var(--radius-md); font-size: 14px; font-family: inherit;
          background: var(--surface); color: var(--text-primary);
        }
        .ops-form-input--mono { font-family: monospace; }
        .ops-form-input:focus { outline: none; box-shadow: var(--shadow-focus); }

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

        .ops-flag-key {
          display: inline-flex; padding: 2px var(--space-8);
          background: var(--neutral-soft); border-radius: var(--radius-sm);
          font-size: 12px; color: var(--text-primary);
        }

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

        .ops-toggle-btn {
          height: var(--size-btn-sm); padding: 0 var(--space-12); border: 1px solid var(--border);
          border-radius: var(--radius-sm); font-size: 12px; font-weight: var(--weight-medium);
          font-family: inherit; cursor: pointer;
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .ops-toggle-btn--on {
          background: var(--error-soft); color: var(--color-error-700); border-color: var(--color-error-200);
        }
        .ops-toggle-btn--on:hover:not(:disabled) { background: var(--color-error-100); }
        .ops-toggle-btn--off {
          background: var(--success-soft); color: var(--color-success-700); border-color: var(--color-success-200);
        }
        .ops-toggle-btn--off:hover:not(:disabled) { background: var(--color-success-100); }
        .ops-toggle-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .ops-toggle-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

        .ops-rollout-display {
          background: none; border: none; padding: 2px var(--space-4);
          font-size: 13px; font-family: inherit; color: var(--color-primary-600);
          cursor: pointer; text-decoration: underline; text-decoration-style: dotted;
        }
        .ops-rollout-display:hover { color: var(--color-primary-700); }
        .ops-rollout-display:focus-visible { outline: none; box-shadow: var(--shadow-focus); border-radius: var(--radius-sm); }

        .ops-rollout-edit { display: inline-flex; align-items: center; gap: var(--space-4); }
        .ops-rollout-input {
          width: 64px; height: var(--size-btn-sm); padding: 0 var(--space-8);
          border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 12px; font-family: inherit;
          background: var(--surface); color: var(--text-primary);
        }
        .ops-rollout-input:focus { outline: none; box-shadow: var(--shadow-focus); }

        .ops-action-btn-sm {
          height: var(--size-btn-sm); padding: 0 var(--space-8);
          border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 11px; font-weight: var(--weight-medium); font-family: inherit;
          background: var(--color-primary-500); color: var(--text-on-primary); cursor: pointer;
        }
        .ops-action-btn-sm:hover:not(:disabled) { background: var(--color-primary-600); }
        .ops-action-btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }
        .ops-action-btn-sm:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
        .ops-action-btn-sm--ghost {
          background: var(--surface); color: var(--text-secondary); border-color: var(--border);
        }
        .ops-action-btn-sm--ghost:hover:not(:disabled) { background: var(--state-hover); }

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
