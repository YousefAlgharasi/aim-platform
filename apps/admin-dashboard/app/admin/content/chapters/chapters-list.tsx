'use client';

// Phase 3 — P3-054
// Admin chapters list client component.
//
// Scope: Curriculum & Content System — chapters only.
//
// Security:
// - All mutations flow through server actions in page.tsx; token is never in client code.
// - Status display is read-only; publish/archive are backend-only operations.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChapterForm } from './chapter-form';
import type { AdminChapterSummary } from '../../../../lib/api/admin-chapters-api';

type ChaptersListProps = {
  readonly chapters: AdminChapterSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly levelId: string;
  readonly courseId: string;
  readonly onCreateChapter: (data: {
    title: string;
    slug: string | null;
    description: string | null;
  }) => Promise<{ error?: string }>;
  readonly onUpdateChapter: (
    id: string,
    data: { title: string; slug: string | null; description: string | null },
  ) => Promise<{ error?: string }>;
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

const STATUS_CLASSES: Record<string, string> = {
  draft: 'status-draft',
  in_review: 'status-review',
  approved: 'status-approved',
  published: 'status-published',
  archived: 'status-archived',
};

export function ChaptersList({
  chapters,
  total,
  page,
  totalPages,
  levelId,
  courseId,
  onCreateChapter,
  onUpdateChapter,
}: ChaptersListProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminChapterSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleCreate(data: {
    title: string;
    slug: string | null;
    description: string | null;
  }) {
    const result = await onCreateChapter(data);
    if (!result.error) {
      setShowCreate(false);
      refresh();
    }
    return result;
  }

  async function handleUpdate(data: {
    title: string;
    slug: string | null;
    description: string | null;
  }) {
    if (!editing) return { error: 'No chapter selected.' };
    const result = await onUpdateChapter(editing.id, data);
    if (!result.error) {
      setEditing(null);
      refresh();
    }
    return result;
  }

  if (showCreate) {
    return (
      <ChapterForm
        mode="create"
        onSubmit={handleCreate}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  if (editing) {
    return (
      <ChapterForm
        mode="edit"
        initial={editing}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div>
      <div className="courses-toolbar">
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Chapter
        </button>
      </div>

      {chapters.length === 0 ? (
        <p className="courses-empty">No chapters yet. Create the first one.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Order</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => (
              <tr key={chapter.id}>
                <td className="course-title-cell">
                  <span>{chapter.title}</span>
                  {chapter.description && (
                    <small className="course-description">{chapter.description}</small>
                  )}
                </td>
                <td className="course-slug-cell">
                  {chapter.slug ? (
                    <code>{chapter.slug}</code>
                  ) : (
                    <span className="courses-empty">—</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${STATUS_CLASSES[chapter.status] ?? ''}`}>
                    {STATUS_LABELS[chapter.status] ?? chapter.status}
                  </span>
                </td>
                <td>{chapter.sortOrder}</td>
                <td className="course-date-cell">
                  {new Date(chapter.updatedAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setEditing(chapter)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Chapters pagination">
          {page > 1 && (
            <a
              href={`?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(levelId)}&page=${page - 1}`}
              className="pagination-link"
            >
              ← Previous
            </a>
          )}
          <span className="pagination-info">
            Page {page} of {totalPages} ({total} total)
          </span>
          {page < totalPages && (
            <a
              href={`?courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(levelId)}&page=${page + 1}`}
              className="pagination-link"
            >
              Next →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}
