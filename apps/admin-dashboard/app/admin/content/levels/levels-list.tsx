'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LevelForm } from './level-form';
import type { AdminLevelSummary } from '../../../../lib/api/admin-levels-api';

type Props = {
  readonly levels: AdminLevelSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly courseId: string;
  readonly onCreateLevel: (data: {
    title: string;
    code: string | null;
    slug: string | null;
    description: string | null;
  }) => Promise<{ error?: string }>;
  readonly onUpdateLevel: (
    id: string,
    data: { title: string; code: string | null; slug: string | null; description: string | null },
  ) => Promise<{ error?: string }>;
};

const STATUS_DOT: Record<string, string> = {
  draft: 'var(--text-muted)',
  in_review: 'var(--color-warning-500, #f59e0b)',
  approved: 'var(--color-primary-500)',
  published: 'var(--color-success-500)',
  archived: 'var(--text-muted)',
};

export function LevelsList({
  levels, total, page, totalPages, courseId,
  onCreateLevel, onUpdateLevel,
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminLevelSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() { startTransition(() => router.refresh()); }

  async function handleCreate(data: { title: string; code: string | null; slug: string | null; description: string | null }) {
    const result = await onCreateLevel(data);
    if (!result.error) { setShowCreate(false); refresh(); }
    return result;
  }

  async function handleUpdate(data: { title: string; code: string | null; slug: string | null; description: string | null }) {
    if (!editing) return {};
    const result = await onUpdateLevel(editing.id, data);
    if (!result.error) { setEditing(null); refresh(); }
    return result;
  }

  if (showCreate) return <LevelForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />;
  if (editing) return <LevelForm mode="edit" initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />;

  return (
    <div className="ll-root">
      <div className="ll-toolbar">
        <button type="button" className="ll-create-btn" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
          New Level
        </button>
      </div>

      {levels.length === 0 && (
        <div className="ll-empty">
          <p className="ll-empty-title">No levels yet</p>
          <p className="ll-empty-desc">Create the first level for this course.</p>
        </div>
      )}

      {levels.length > 0 && (
        <div className="ll-table-wrap">
          <table className="ll-table">
            <thead>
              <tr>
                <th className="ll-th">Level</th>
                <th className="ll-th ll-th--code">Code</th>
                <th className="ll-th ll-th--status">Status</th>
                <th className="ll-th ll-th--order">Order</th>
                <th className="ll-th ll-th--date">Updated</th>
                <th className="ll-th ll-th--actions" />
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => (
                <tr key={level.id} className="ll-row">
                  <td className="ll-td">
                    <div className="ll-info">
                      <span className="ll-name">{level.title}</span>
                      {level.slug && <span className="ll-slug">{level.slug}</span>}
                      {level.description && <span className="ll-desc">{level.description}</span>}
                    </div>
                  </td>
                  <td className="ll-td ll-td--code">
                    {level.code ? <code className="ll-code">{level.code}</code> : <span className="ll-muted">—</span>}
                  </td>
                  <td className="ll-td">
                    <span className="ll-status">
                      <span className="ll-status-dot" style={{ background: STATUS_DOT[level.status] ?? 'var(--text-muted)' }} />
                      {level.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="ll-td ll-td--order">{level.sortOrder}</td>
                  <td className="ll-td ll-td--date">{fmtDate(level.updatedAt)}</td>
                  <td className="ll-td ll-td--actions">
                    <button type="button" className="ll-edit-btn" onClick={() => setEditing(level)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="ll-pagination">
          {page > 1 && (
            <Link href={`?courseId=${encodeURIComponent(courseId)}&page=${page - 1}`} className="ll-page-btn">← Previous</Link>
          )}
          <span className="ll-page-info">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`?courseId=${encodeURIComponent(courseId)}&page=${page + 1}`} className="ll-page-btn">Next →</Link>
          )}
        </nav>
      )}

      <style>{`
        .ll-root { display: flex; flex-direction: column; gap: 14px; }
        .ll-toolbar { display: flex; justify-content: flex-end; }
        .ll-create-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px;
          padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .ll-create-btn:hover { background: var(--color-primary-600); }
        .ll-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .ll-table { width: 100%; border-collapse: collapse; min-width: 560px; }
        .ll-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .ll-th--code { width: 80px; }
        .ll-th--status { width: 110px; }
        .ll-th--order { width: 70px; text-align: center; }
        .ll-th--date { width: 110px; }
        .ll-th--actions { width: 70px; }
        .ll-row { transition: background 0.1s; }
        .ll-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .ll-row:not(:last-child) .ll-td { border-bottom: 1px solid var(--border); }
        .ll-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .ll-td--code { font-size: 13px; }
        .ll-td--order { text-align: center; font-weight: 600; color: var(--text-secondary); font-size: 13px; }
        .ll-td--date { font-size: 12px; color: var(--text-secondary); }
        .ll-td--actions { text-align: right; }
        .ll-info { display: flex; flex-direction: column; gap: 2px; }
        .ll-name { font-weight: 600; color: var(--text-primary); }
        .ll-slug { font-size: 12px; font-family: var(--font-mono, monospace); color: var(--text-muted); }
        .ll-desc { font-size: 12px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 300px; }
        .ll-code { font-size: 12px; font-family: var(--font-mono, monospace); background: var(--surface-sunken); padding: 2px 6px; border-radius: 4px; color: var(--text-secondary); }
        .ll-muted { color: var(--text-muted); }
        .ll-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .ll-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ll-edit-btn {
          background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 4px 12px; font-size: 12px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
        }
        .ll-edit-btn:hover { background: var(--surface-sunken); color: var(--text-primary); }
        .ll-pagination { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0; }
        .ll-page-btn { font-size: 13px; font-weight: 600; color: var(--color-primary-500); text-decoration: none; padding: 6px 12px; border-radius: var(--radius-sm); }
        .ll-page-btn:hover { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .ll-page-info { font-size: 13px; color: var(--text-secondary); }
        .ll-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .ll-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .ll-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .ll-th--code, .ll-td--code, .ll-th--order, .ll-td--order { display: none; }
          .ll-desc { display: none; }
        }
      `}</style>
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '—'; }
}
