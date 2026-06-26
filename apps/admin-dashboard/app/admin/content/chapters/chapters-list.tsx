'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChapterForm } from './chapter-form';
import type { AdminChapterSummary } from '../../../../lib/api/admin-chapters-api';

type Props = {
  readonly chapters: AdminChapterSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly levelId: string;
  readonly courseId: string;
  readonly onCreateChapter: (data: {
    title: string; slug: string | null; description: string | null;
  }) => Promise<{ error?: string }>;
  readonly onUpdateChapter: (
    id: string, data: { title: string; slug: string | null; description: string | null },
  ) => Promise<{ error?: string }>;
};

const STATUS_DOT: Record<string, string> = {
  draft: 'var(--text-muted)',
  in_review: 'var(--color-warning-500, #f59e0b)',
  approved: 'var(--color-primary-500)',
  published: 'var(--color-success-500)',
  archived: 'var(--text-muted)',
};

export function ChaptersList({
  chapters, total, page, totalPages, levelId, courseId,
  onCreateChapter, onUpdateChapter,
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminChapterSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() { startTransition(() => router.refresh()); }

  async function handleCreate(data: { title: string; slug: string | null; description: string | null }) {
    const result = await onCreateChapter(data);
    if (!result.error) { setShowCreate(false); refresh(); }
    return result;
  }

  async function handleUpdate(data: { title: string; slug: string | null; description: string | null }) {
    if (!editing) return {};
    const result = await onUpdateChapter(editing.id, data);
    if (!result.error) { setEditing(null); refresh(); }
    return result;
  }

  if (showCreate) return <ChapterForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />;
  if (editing) return <ChapterForm mode="edit" initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />;

  return (
    <div className="cl-root">
      <div className="cl-toolbar">
        <button type="button" className="cl-create-btn" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
          New Chapter
        </button>
      </div>

      {chapters.length === 0 && (
        <div className="cl-empty">
          <p className="cl-empty-title">No chapters yet</p>
          <p className="cl-empty-desc">Create the first chapter for this level.</p>
        </div>
      )}

      {chapters.length > 0 && (
        <div className="cl-table-wrap">
          <table className="cl-table">
            <thead>
              <tr>
                <th className="cl-th">Chapter</th>
                <th className="cl-th cl-th--status">Status</th>
                <th className="cl-th cl-th--order">Order</th>
                <th className="cl-th cl-th--date">Updated</th>
                <th className="cl-th cl-th--actions" />
              </tr>
            </thead>
            <tbody>
              {chapters.map((ch) => (
                <tr key={ch.id} className="cl-row">
                  <td className="cl-td">
                    <div className="cl-info">
                      <span className="cl-name">{ch.title}</span>
                      {ch.slug && <span className="cl-slug">{ch.slug}</span>}
                      {ch.description && <span className="cl-desc">{ch.description}</span>}
                    </div>
                  </td>
                  <td className="cl-td">
                    <span className="cl-status">
                      <span className="cl-status-dot" style={{ background: STATUS_DOT[ch.status] ?? 'var(--text-muted)' }} />
                      {ch.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="cl-td cl-td--order">{ch.sortOrder}</td>
                  <td className="cl-td cl-td--date">{fmtDate(ch.updatedAt)}</td>
                  <td className="cl-td cl-td--actions">
                    <button type="button" className="cl-edit-btn" onClick={() => setEditing(ch)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="cl-pagination">
          {page > 1 && (
            <Link href={`?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(levelId)}&page=${page - 1}`} className="cl-page-btn">← Previous</Link>
          )}
          <span className="cl-page-info">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(levelId)}&page=${page + 1}`} className="cl-page-btn">Next →</Link>
          )}
        </nav>
      )}

      <style>{`
        .cl-root { display: flex; flex-direction: column; gap: 14px; }
        .cl-toolbar { display: flex; justify-content: flex-end; }
        .cl-create-btn {
          display: inline-flex; align-items: center; gap: 6px; height: 38px;
          padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .cl-create-btn:hover { background: var(--color-primary-600); }
        .cl-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .cl-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .cl-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .cl-th--status { width: 110px; }
        .cl-th--order { width: 70px; text-align: center; }
        .cl-th--date { width: 110px; }
        .cl-th--actions { width: 70px; }
        .cl-row { transition: background 0.1s; }
        .cl-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .cl-row:not(:last-child) .cl-td { border-bottom: 1px solid var(--border); }
        .cl-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .cl-td--order { text-align: center; font-weight: 600; color: var(--text-secondary); font-size: 13px; }
        .cl-td--date { font-size: 12px; color: var(--text-secondary); }
        .cl-td--actions { text-align: right; }
        .cl-info { display: flex; flex-direction: column; gap: 2px; }
        .cl-name { font-weight: 600; color: var(--text-primary); }
        .cl-slug { font-size: 12px; font-family: var(--font-mono, monospace); color: var(--text-muted); }
        .cl-desc { font-size: 12px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 300px; }
        .cl-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .cl-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .cl-edit-btn {
          background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 4px 12px; font-size: 12px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
        }
        .cl-edit-btn:hover { background: var(--surface-sunken); color: var(--text-primary); }
        .cl-pagination { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0; }
        .cl-page-btn { font-size: 13px; font-weight: 600; color: var(--color-primary-500); text-decoration: none; padding: 6px 12px; border-radius: var(--radius-sm); }
        .cl-page-btn:hover { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .cl-page-info { font-size: 13px; color: var(--text-secondary); }
        .cl-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .cl-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .cl-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .cl-th--order, .cl-td--order { display: none; }
          .cl-desc { display: none; }
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
