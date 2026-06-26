'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type {
  AdminObjectiveSummary,
  CreateObjectivePayload,
  UpdateObjectivePayload,
} from '../../../../lib/api/admin-objectives-api';

type Props = {
  readonly objectives: AdminObjectiveSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly statusFilter?: string;
  readonly searchQuery?: string;
  readonly onCreateObjective: (payload: CreateObjectivePayload) => Promise<{ error?: string }>;
  readonly onUpdateObjective: (id: string, payload: UpdateObjectivePayload) => Promise<{ error?: string }>;
};

const STATUS_DOT: Record<string, string> = {
  draft: 'var(--text-muted)',
  published: 'var(--color-success-500)',
  archived: 'var(--text-muted)',
};

export function ObjectivesList({
  objectives, total, page, totalPages, statusFilter, searchQuery,
  onCreateObjective, onUpdateObjective,
}: Props) {
  const router = useRouter();
  const [formMode, setFormMode] = useState<'idle' | 'create' | 'edit'>('idle');
  const [editing, setEditing] = useState<AdminObjectiveSummary | null>(null);
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setFormMode('create'); setEditing(null);
    setTitle(''); setKey(''); setDescription('');
    setError(null); setFieldErrors({});
  }

  function openEdit(obj: AdminObjectiveSummary) {
    setFormMode('edit'); setEditing(obj);
    setTitle(obj.title); setKey(obj.key ?? ''); setDescription(obj.description ?? '');
    setError(null); setFieldErrors({});
  }

  function closeForm() { setFormMode('idle'); setEditing(null); setError(null); setFieldErrors({}); }

  function refresh() { startTransition(() => router.refresh()); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    startTransition(async () => {
      const payload = {
        title: title.trim(),
        key: key.trim() || null,
        description: description.trim() || null,
      };
      let result: { error?: string };
      if (formMode === 'create') {
        result = await onCreateObjective(payload);
      } else if (editing) {
        result = await onUpdateObjective(editing.id, payload);
      } else return;

      if (result.error) { setError(result.error); }
      else { closeForm(); refresh(); }
    });
  }

  function buildHref(p: number) {
    const params = new URLSearchParams();
    params.set('page', String(p));
    if (statusFilter) params.set('status', statusFilter);
    if (searchQuery) params.set('q', searchQuery);
    return `/admin/content/objectives?${params.toString()}`;
  }

  if (formMode !== 'idle') {
    return (
      <div className="ol-card">
        <div className="ol-card-header">
          <h2 className="ol-card-title">{formMode === 'create' ? 'New Objective' : 'Edit Objective'}</h2>
          <button type="button" className="ol-close" onClick={closeForm} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {error && <div className="admin-error-banner" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="ol-form">
          <div className="ol-field">
            <label htmlFor="obj-title" className="ol-label">Title <span className="ol-req">*</span></label>
            <input id="obj-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Understand past simple sentence structure" disabled={isPending} maxLength={255}
              className={`ol-input ${fieldErrors.title ? 'ol-input--error' : ''}`} />
            {fieldErrors.title && <span className="ol-error">{fieldErrors.title}</span>}
          </div>
          <div className="ol-field">
            <label htmlFor="obj-key" className="ol-label">Key</label>
            <input id="obj-key" type="text" value={key} onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. grammar.past_simple.understand_structure" disabled={isPending} maxLength={255}
              className="ol-input ol-input--mono" />
            <span className="ol-hint">Stable dot-delimited identifier. Leave blank to let backend assign.</span>
          </div>
          <div className="ol-field">
            <label htmlFor="obj-desc" className="ol-label">Description</label>
            <textarea id="obj-desc" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="What the learner will be able to do after meeting this objective." disabled={isPending}
              rows={3} maxLength={2000} className="ol-textarea" />
          </div>
          <div className="ol-actions">
            <button type="submit" disabled={isPending} className="ol-submit">
              {isPending ? 'Saving…' : formMode === 'create' ? 'Create Objective' : 'Save Changes'}
            </button>
            <button type="button" onClick={closeForm} disabled={isPending} className="ol-cancel">Cancel</button>
          </div>
        </form>

        <style>{`
          .ol-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; max-width: 560px; }
          .ol-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .ol-card-title { margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary); }
          .ol-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); }
          .ol-close:hover { color: var(--text-primary); }
          .ol-form { display: flex; flex-direction: column; gap: 16px; }
          .ol-field { display: flex; flex-direction: column; gap: 4px; }
          .ol-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
          .ol-req { color: var(--color-error-500); }
          .ol-input, .ol-textarea {
            padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
            background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit;
          }
          .ol-input { height: 38px; }
          .ol-input--mono { font-family: monospace; font-size: 13px; }
          .ol-textarea { resize: vertical; min-height: 72px; }
          .ol-input:focus, .ol-textarea:focus {
            outline: none; border-color: var(--color-primary-500);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
          }
          .ol-input--error { border-color: var(--color-error-500); }
          .ol-error { font-size: 12px; color: var(--color-error-500); font-weight: 500; }
          .ol-hint { font-size: 12px; color: var(--text-muted); }
          .ol-actions { display: flex; gap: 8px; margin-top: 4px; }
          .ol-submit {
            height: 38px; padding: 0 18px; border: none; border-radius: var(--radius-md);
            background: var(--color-primary-500); color: white;
            font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
          }
          .ol-submit:hover:not(:disabled) { background: var(--color-primary-600); }
          .ol-submit:disabled { opacity: 0.5; cursor: not-allowed; }
          .ol-cancel {
            height: 38px; padding: 0 18px; border: 1px solid var(--border);
            border-radius: var(--radius-md); background: var(--surface);
            color: var(--text-secondary); font-size: 13px; font-weight: 500;
            font-family: inherit; cursor: pointer;
          }
          .ol-cancel:hover { background: var(--surface-sunken); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ol-root">
      <div className="ol-toolbar">
        <button type="button" className="ol-create-btn" onClick={openCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
          New Objective
        </button>
      </div>

      {objectives.length === 0 && (
        <div className="ol-empty">
          <p className="ol-empty-title">No objectives found</p>
          <p className="ol-empty-desc">{statusFilter || searchQuery ? 'Try adjusting your filters.' : 'Create the first objective.'}</p>
        </div>
      )}

      {objectives.length > 0 && (
        <div className="ol-table-wrap">
          <table className="ol-table">
            <thead>
              <tr>
                <th className="ol-th">Objective</th>
                <th className="ol-th ol-th--key">Key</th>
                <th className="ol-th ol-th--status">Status</th>
                <th className="ol-th ol-th--date">Updated</th>
                <th className="ol-th ol-th--actions" />
              </tr>
            </thead>
            <tbody>
              {objectives.map((obj) => (
                <tr key={obj.id} className="ol-row">
                  <td className="ol-td">
                    <div className="ol-info">
                      <span className="ol-name">{obj.title}</span>
                      {obj.description && <span className="ol-desc">{obj.description}</span>}
                    </div>
                  </td>
                  <td className="ol-td ol-td--key">
                    {obj.key ? <code className="ol-key">{obj.key}</code> : <span className="ol-muted">--</span>}
                  </td>
                  <td className="ol-td">
                    <span className="ol-status">
                      <span className="ol-status-dot" style={{ background: STATUS_DOT[obj.status] ?? 'var(--text-muted)' }} />
                      {obj.status}
                    </span>
                  </td>
                  <td className="ol-td ol-td--date">{fmtDate(obj.updatedAt)}</td>
                  <td className="ol-td ol-td--actions">
                    <button type="button" className="ol-edit-btn" onClick={() => openEdit(obj)} disabled={obj.status === 'archived'}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="ol-pagination">
          {page > 1 && <Link href={buildHref(page - 1)} className="ol-page-btn">← Previous</Link>}
          <span className="ol-page-info">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={buildHref(page + 1)} className="ol-page-btn">Next →</Link>}
        </nav>
      )}

      <style>{`
        .ol-root { display: flex; flex-direction: column; gap: 14px; }
        .ol-toolbar { display: flex; justify-content: flex-end; }
        .ol-create-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px;
          padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .ol-create-btn:hover { background: var(--color-primary-600); }
        .ol-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .ol-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .ol-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .ol-th--key { width: 200px; }
        .ol-th--status { width: 110px; }
        .ol-th--date { width: 110px; }
        .ol-th--actions { width: 70px; }
        .ol-row { transition: background 0.1s; }
        .ol-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .ol-row:not(:last-child) .ol-td { border-bottom: 1px solid var(--border); }
        .ol-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .ol-td--key { font-size: 12px; }
        .ol-td--date { font-size: 12px; color: var(--text-secondary); }
        .ol-td--actions { text-align: right; }
        .ol-info { display: flex; flex-direction: column; gap: 2px; }
        .ol-name { font-weight: 600; color: var(--text-primary); }
        .ol-desc { font-size: 12px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 300px; }
        .ol-key {
          font-family: monospace; font-size: 11px; padding: 2px 6px;
          background: var(--surface-sunken); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-secondary); word-break: break-all;
        }
        .ol-muted { color: var(--text-muted); }
        .ol-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .ol-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ol-edit-btn {
          background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 4px 12px; font-size: 12px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
        }
        .ol-edit-btn:hover { background: var(--surface-sunken); color: var(--text-primary); }
        .ol-edit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ol-pagination { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0; }
        .ol-page-btn { font-size: 13px; font-weight: 600; color: var(--color-primary-500); text-decoration: none; padding: 6px 12px; border-radius: var(--radius-sm); }
        .ol-page-btn:hover { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .ol-page-info { font-size: 13px; color: var(--text-secondary); }
        .ol-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .ol-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .ol-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .ol-th--key, .ol-td--key, .ol-th--date, .ol-td--date { display: none; }
          .ol-desc { display: none; }
        }
      `}</style>
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '--';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '--'; }
}
