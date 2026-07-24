'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LessonForm } from './lesson-form';
import type { AdminLessonSummary } from '../../../../lib/api/admin-lessons-api';
import { AdminTable, type AdminTableColumn } from '../../../../components/common/admin-table';

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
  lessons, page, totalPages,
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

  const columns: AdminTableColumn<AdminLessonSummary>[] = [
    {
      key: 'lesson',
      header: 'Lesson',
      render: (lesson) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm text-[var(--text-primary)]">{lesson.title}</span>
          {lesson.description && (
            <span className="text-xs text-[var(--text-secondary)] truncate max-w-xs hidden sm:block">
              {lesson.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (lesson) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] capitalize">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: STATUS_DOT[lesson.status] ?? 'var(--text-muted)' }} />
          {lesson.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'skills',
      header: 'Skills',
      width: '100px',
      className: 'hidden sm:table-cell',
      render: (lesson) => {
        if (lesson.status === 'archived') {
          return <span className="text-xs text-[var(--text-muted)]">—</span>;
        }
        if (lesson.status === 'published') {
          return (
            <Link
              href={skillLinkHref(lesson.id, courseId, levelId, chapterId)}
              className="inline-block px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-[color-mix(in_srgb,var(--color-success-500)_12%,transparent)] text-[var(--color-success-700,#15803d)] hover:opacity-80"
            >
              Linked
            </Link>
          );
        }
        return (
          <Link
            href={skillLinkHref(lesson.id, courseId, levelId, chapterId)}
            className="inline-block px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-[color-mix(in_srgb,var(--color-warning-500,#f59e0b)_12%,transparent)] text-[var(--color-warning-700,#a16207)] hover:opacity-80"
            title="Link skills before publishing"
          >
            Link skills
          </Link>
        );
      },
    },
    {
      key: 'sortOrder',
      header: 'Order',
      width: '70px',
      className: 'hidden sm:table-cell text-center',
      render: (lesson) => <span className="text-xs font-semibold text-[var(--text-secondary)]">{lesson.sortOrder}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      width: '110px',
      render: (lesson) => <span className="text-xs text-[var(--text-secondary)]">{fmtDate(lesson.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '70px',
      render: (lesson) => (
        <button
          type="button"
          className="px-2.5 py-1 text-xs font-medium border border-[var(--border)] rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)] cursor-pointer"
          onClick={(e) => { e.stopPropagation(); setEditing(lesson); }}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--color-primary-500)] text-white text-xs font-semibold hover:bg-[var(--color-primary-600)] transition-colors cursor-pointer"
          onClick={() => setShowCreate(true)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
          New Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1.5 py-10 px-5 text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)]">No lessons found</p>
          <p className="text-xs text-[var(--text-muted)]">
            {statusFilter || searchQuery ? 'Try adjusting your filters.' : 'Create the first lesson for this chapter.'}
          </p>
        </div>
      ) : (
        <AdminTable
          columns={columns}
          rows={lessons}
          getRowKey={(l) => l.id}
        />
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3.5 py-1" aria-label="Lessons pagination">
          {page > 1 && (
            <Link href={buildHref(page - 1)} className="text-xs font-semibold text-[var(--color-primary-500)] hover:bg-[color-mix(in_srgb,var(--color-primary-500)_8%,transparent)] px-3 py-1.5 rounded-md">
              ← Previous
            </Link>
          )}
          <span className="text-xs text-[var(--text-secondary)]">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={buildHref(page + 1)} className="text-xs font-semibold text-[var(--color-primary-500)] hover:bg-[color-mix(in_srgb,var(--color-primary-500)_8%,transparent)] px-3 py-1.5 rounded-md">
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '—'; }
}
