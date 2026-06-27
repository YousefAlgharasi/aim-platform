'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LessonForm } from './lesson-form';
import type { AdminLessonSummary } from '../../../../lib/api/admin-lessons-api';

type Props = {
  readonly lessons: AdminLessonSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly courseId: string;
  readonly levelId: string;
  readonly chapterId: string;
  readonly statusFilter?: string;
  readonly searchQuery?: string;
  readonly onCreateLesson: (data: { title: string; description: string }) => Promise<{ error?: string }>;
  readonly onUpdateLesson: (id: string, data: { title: string; description: string }) => Promise<{ error?: string }>;
};

const STATUS_DOT: Record<string, string> = {
  draft: 'var(--text-muted)',
  in_review: 'var(--color-warning-500, #f59e0b)',
  approved: 'var(--color-primary-500)',
  published: 'var(--color-success-500)',
  archived: 'var(--text-muted)',
};

function skillLinkHref(lessonId: string, courseId: string, levelId: string, chapterId: string): string {
  return `/admin/content/lessons/skills?lessonId=${encodeURIComponent(lessonId)}&courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(levelId)}&chapterId=${encodeURIComponent(chapterId)}`;
}

export function LessonsList({
  lessons, total, page, totalPages,
  courseId, levelId, chapterId, statusFilter, searchQuery,
  onCreateLesson, onUpdateLesson,
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminLessonSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() { startTransition(() => router.refresh()); }

  async function handleCreate(data: { title: string; description: string }) {
    const result = await onCreateLesson(data);
    if (!result.error) { setShowCreate(false); refresh(); }
    return result;
  }

  async function handleUpdate(data: { title: string; description: string }) {
    if (!editing) return {};
    const result = await onUpdateLesson(editing.id, data);
    if (!result.error) { setEditing(null); refresh(); }
    return result;
  }

  if (showCreate) return <LessonForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />;
  if (editing) return <LessonForm mode="edit" initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />;

  function buildHref(p: number) {
    const params = new URLSearchParams();
    params.set('courseId', courseId);
    params.set('levelId', levelId);
    params.set('chapterId', chapterId);
    params.set('page', String(p));
    if (statusFilter) params.set('status', statusFilter);
    if (searchQuery) params.set('q', searchQuery);
    return `/admin/content/lessons?${params.toString()}`;
  }

  return (
    <div className="ll-root">
      <div className="ll-toolbar">
        <button type="button" className="ll-create-btn" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
          New Lesson
        </button>
      </div>

      {lessons.length === 0 && (
        <div className="ll-empty">
          <p className="ll-empty-title">No lessons found</p>
          <p className="ll-empty-desc">{statusFilter || searchQuery ? 'Try adjusting your filters.' : 'Create the first lesson for this chapter.'}</p>
        </div>
      )}

      {lessons.length > 0 && (
        <div className="ll-table-wrap">
          <table className="ll-table">
            <thead>
              <tr>
                <th className="ll-th">Lesson</th>
                <th className="ll-th ll-th--status">Status</th>
                <th className="ll-th ll-th--skills">Skills</th>
                <th className="ll-th ll-th--order">Order</th>
                <th className="ll-th ll-th--date">Updated</th>
                <th className="ll-th ll-th--actions" />
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="ll-row">
                  <td className="ll-td">
                    <div className="ll-info">
                      <span className="ll-name">{lesson.title}</span>
                      {lesson.description && <span className="ll-desc">{lesson.description}</span>}
                    </div>
                  </td>
                  <td className="ll-td">
                    <span className="ll-status">
                      <span className="ll-status-dot" style={{ background: STATUS_DOT[lesson.status] ?? 'var(--text-muted)' }} />
                      {lesson.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="ll-td ll-td--skills">
                    {lesson.status === 'archived' ? (
                      <span className="ll-muted">—</span>
                    ) : lesson.status === 'published' ? (
                      <a href={skillLinkHref(lesson.id, courseId, levelId, chapterId)} className="ll-skill-badge ll-skill-badge--ok">Linked</a>
                    ) : (
                      <a href={skillLinkHref(lesson.id, courseId, levelId, chapterId)} className="ll-skill-badge ll-skill-badge--warn" title="Link skills before publishing">Link skills</a>
                    )}
                  </td>
                  <td className="ll-td ll-td--order">{lesson.sortOrder}</td>
                  <td className="ll-td ll-td--date">{fmtDate(lesson.updatedAt)}</td>
                  <td className="ll-td ll-td--actions">
                    <button type="button" className="ll-edit-btn" onClick={() => setEditing(lesson)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="ll-pagination">
          {page > 1 && <Link href={buildHref(page - 1)} className="ll-page-btn">← Previous</Link>}
          <span className="ll-page-info">Page {page} of {totalPages}</span>
          {page < totalPages && <Link href={buildHref(page + 1)} className="ll-page-btn">Next →</Link>}
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
        .ll-th--status { width: 110px; }
        .ll-th--skills { width: 100px; }
        .ll-th--order { width: 70px; text-align: center; }
        .ll-th--date { width: 110px; }
        .ll-th--actions { width: 70px; }
        .ll-row { transition: background 0.1s; }
        .ll-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .ll-row:not(:last-child) .ll-td { border-bottom: 1px solid var(--border); }
        .ll-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .ll-td--order { text-align: center; font-weight: 600; color: var(--text-secondary); font-size: 13px; }
        .ll-td--date { font-size: 12px; color: var(--text-secondary); }
        .ll-td--actions { text-align: right; }
        .ll-td--skills { font-size: 12px; }
        .ll-info { display: flex; flex-direction: column; gap: 2px; }
        .ll-name { font-weight: 600; color: var(--text-primary); }
        .ll-desc { font-size: 12px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 300px; }
        .ll-muted { color: var(--text-muted); }
        .ll-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: capitalize;
        }
        .ll-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .ll-skill-badge {
          display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm);
          font-size: 11px; font-weight: 600; text-decoration: none;
        }
        .ll-skill-badge--ok { background: color-mix(in srgb, var(--color-success-500) 12%, transparent); color: var(--color-success-700, #15803d); }
        .ll-skill-badge--warn { background: color-mix(in srgb, var(--color-warning-500, #f59e0b) 12%, transparent); color: var(--color-warning-700, #a16207); }
        .ll-skill-badge:hover { opacity: 0.8; }
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
          .ll-th--skills, .ll-td--skills, .ll-th--order, .ll-td--order { display: none; }
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
