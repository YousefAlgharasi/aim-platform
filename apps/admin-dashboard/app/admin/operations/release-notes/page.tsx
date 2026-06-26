// P17-070: Admin release notes UI
// Table: version, title, audience, status, created.
// Actions: create draft, publish, archive.
// Backend is the final authority for all release note data.
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { backendFetch } from '../../../../lib/api/client-api-helpers';

import { OperationsLoadingSpinner } from '../../../../components/operations/operations-loading-spinner';
import { OperationsEmptyState } from '../../../../components/operations/operations-empty-state';
import { OperationsErrorCard } from '../../../../components/operations/operations-error-card';

type ReleaseNote = {
  readonly id: string;
  readonly version: string;
  readonly title: string;
  readonly audience: string;
  readonly status: string;
  readonly createdAt: string;
};

type ReleaseNotesResponse = {
  readonly data: readonly ReleaseNote[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

const STATUS_CLASSES: Record<string, string> = {
  draft:     'ops-badge--warning',
  published: 'ops-badge--success',
  archived:  'ops-badge--neutral',
};

const AUDIENCE_CLASSES: Record<string, string> = {
  all:      'ops-badge--primary',
  internal: 'ops-badge--info',
  students: 'ops-badge--neutral',
  admins:   'ops-badge--neutral',
};

export default function ReleaseNotesPage() {
  const [notes, setNotes] = useState<readonly ReleaseNote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Create form state
  const [newVersion, setNewVersion] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAudience, setNewAudience] = useState('all');
  const [newContent, setNewContent] = useState('');

  const fetchNotes = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch('/admin/release-notes');
      if (!res.ok) throw new Error(`Backend error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      const items: ReleaseNote[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      setNotes(items);
      setTotal(items.length);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load release notes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(1);
  }, [fetchNotes]);

  async function handleStatusAction(noteId: string, newStatus: string) {
    setActionLoading(noteId);
    try {
      const action = newStatus === 'published' ? 'publish' : 'archive';
      const res = await backendFetch(`/admin/release-notes/${noteId}/${action}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
      await fetchNotes(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update release note status.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!newVersion.trim() || !newTitle.trim()) return;
    setCreateLoading(true);
    try {
      const res = await backendFetch('/admin/release-notes', {
        method: 'POST',
        body: JSON.stringify({
          version: newVersion.trim(),
          title: newTitle.trim(),
          audience: newAudience,
          body: newContent.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Failed to create release note: ${res.statusText}`);
      setNewVersion('');
      setNewTitle('');
      setNewAudience('all');
      setNewContent('');
      setShowCreateForm(false);
      await fetchNotes(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create release note.');
    } finally {
      setCreateLoading(false);
    }
  }

  if (loading) {
    return <OperationsLoadingSpinner message="Loading release notes..." />;
  }

  if (error && notes.length === 0) {
    return <OperationsErrorCard message={error} onRetry={() => fetchNotes(page)} />;
  }

  return (
    <div className="ops-releases">
      <header className="ops-releases-header">
        <div className="ops-releases-header-row">
          <div>
            <p className="ops-eyebrow">Operations</p>
            <h1 className="ops-page-title">Release Notes</h1>
            <p className="ops-page-meta">{total} release note{total !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="ops-create-btn"
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ New Draft'}
          </button>
        </div>
      </header>

      {error && (
        <div className="ops-inline-error" role="alert">{error}</div>
      )}

      {showCreateForm && (
        <form className="ops-create-form" onSubmit={handleCreateDraft}>
          <h2 className="ops-create-form-title">Create Release Note Draft</h2>
          <div className="ops-create-form-fields">
            <div className="ops-form-field">
              <label htmlFor="rn-version" className="ops-form-label">Version</label>
              <input
                id="rn-version"
                className="ops-form-input"
                type="text"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="e.g. 2.1.0"
                required
                disabled={createLoading}
              />
            </div>
            <div className="ops-form-field">
              <label htmlFor="rn-title" className="ops-form-label">Title</label>
              <input
                id="rn-title"
                className="ops-form-input"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Release title"
                required
                disabled={createLoading}
              />
            </div>
            <div className="ops-form-field">
              <label htmlFor="rn-audience" className="ops-form-label">Audience</label>
              <select
                id="rn-audience"
                className="ops-form-select"
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value)}
                disabled={createLoading}
              >
                <option value="all">All</option>
                <option value="internal">Internal</option>
                <option value="students">Students</option>
                <option value="admins">Admins</option>
              </select>
            </div>
          </div>
          <div className="ops-form-field">
            <label htmlFor="rn-content" className="ops-form-label">Content</label>
            <textarea
              id="rn-content"
              className="ops-form-textarea"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Release note content (markdown supported)"
              rows={4}
              disabled={createLoading}
            />
          </div>
          <div className="ops-create-form-actions">
            <button className="ops-submit-btn" type="submit" disabled={createLoading || !newVersion.trim() || !newTitle.trim()}>
              {createLoading ? 'Creating...' : 'Create Draft'}
            </button>
            <button className="ops-cancel-btn" type="button" onClick={() => setShowCreateForm(false)} disabled={createLoading}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <OperationsEmptyState message="No release notes found." />
      ) : (
        <div className="ops-table-wrapper" role="region" aria-label="Release notes table">
          <table className="ops-table">
            <caption className="ops-table-caption">{total} release notes</caption>
            <thead>
              <tr>
                <th className="ops-table-th" scope="col">Version</th>
                <th className="ops-table-th" scope="col">Title</th>
                <th className="ops-table-th" scope="col">Audience</th>
                <th className="ops-table-th" scope="col">Status</th>
                <th className="ops-table-th" scope="col">Created</th>
                <th className="ops-table-th" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id} className="ops-table-row">
                  <td className="ops-table-td">
                    <span className="ops-version-tag">{note.version}</span>
                  </td>
                  <td className="ops-table-td ops-table-td--primary">{note.title}</td>
                  <td className="ops-table-td">
                    <span className={`ops-badge ${AUDIENCE_CLASSES[note.audience] ?? 'ops-badge--neutral'}`}>
                      {note.audience}
                    </span>
                  </td>
                  <td className="ops-table-td">
                    <span className={`ops-badge ${STATUS_CLASSES[note.status] ?? 'ops-badge--neutral'}`}>
                      {note.status}
                    </span>
                  </td>
                  <td className="ops-table-td ops-table-td--date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </td>
                  <td className="ops-table-td ops-table-td--actions">
                    {note.status === 'draft' && (
                      <button
                        className="ops-action-btn ops-action-btn--publish"
                        type="button"
                        onClick={() => handleStatusAction(note.id, 'published')}
                        disabled={actionLoading === note.id}
                        aria-label={`Publish ${note.title}`}
                      >
                        Publish
                      </button>
                    )}
                    {note.status === 'published' && (
                      <button
                        className="ops-action-btn ops-action-btn--archive"
                        type="button"
                        onClick={() => handleStatusAction(note.id, 'archived')}
                        disabled={actionLoading === note.id}
                        aria-label={`Archive ${note.title}`}
                      >
                        Archive
                      </button>
                    )}
                    {note.status === 'archived' && (
                      <span className="ops-text-muted">Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="ops-pagination" role="navigation" aria-label="Pagination">
          <button className="ops-pagination-btn" type="button" disabled={page <= 1} onClick={() => fetchNotes(page - 1)}>
            Previous
          </button>
          <span className="ops-pagination-info">Page {page} of {totalPages}</span>
          <button className="ops-pagination-btn" type="button" disabled={page >= totalPages} onClick={() => fetchNotes(page + 1)}>
            Next
          </button>
        </div>
      )}

      <style>{`
        .ops-releases { display: flex; flex-direction: column; gap: var(--space-24); }
        .ops-releases-header { display: flex; flex-direction: column; gap: var(--space-4); }
        .ops-releases-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-16); flex-wrap: wrap; }

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
        .ops-form-textarea {
          padding: var(--space-12); border: 1px solid var(--border);
          border-radius: var(--radius-md); font-size: 14px; font-family: inherit;
          background: var(--surface); color: var(--text-primary); resize: vertical;
        }
        .ops-form-textarea:focus { outline: none; box-shadow: var(--shadow-focus); }

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
        .ops-table-td--actions { white-space: nowrap; }
        .ops-text-muted { color: var(--text-muted); font-size: 12px; }

        .ops-version-tag {
          display: inline-flex; padding: 2px var(--space-8);
          background: var(--neutral-soft); border-radius: var(--radius-sm);
          font-size: 12px; font-weight: var(--weight-semibold); font-family: monospace;
          color: var(--text-primary);
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

        .ops-action-btn {
          height: var(--size-btn-sm); padding: 0 var(--space-12); border: 1px solid var(--border);
          border-radius: var(--radius-sm); font-size: 12px; font-weight: var(--weight-medium);
          font-family: inherit; cursor: pointer;
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .ops-action-btn:disabled { cursor: not-allowed; opacity: 0.5; }
        .ops-action-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

        .ops-action-btn--publish {
          background: var(--success-soft); color: var(--color-success-700); border-color: var(--color-success-200);
        }
        .ops-action-btn--publish:hover:not(:disabled) { background: var(--color-success-100); }

        .ops-action-btn--archive {
          background: var(--surface); color: var(--text-secondary);
        }
        .ops-action-btn--archive:hover:not(:disabled) { background: var(--state-hover); }

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
