'use client';

// Phase 3 — P3-053
// Admin levels list client component.
//
// Scope: Curriculum & Content System — levels only.
//
// Security:
// - All mutations flow through server actions in page.tsx; token is never in client code.
// - Status display is read-only; publish/archive are backend-only operations.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LevelForm } from './level-form';
import type { AdminLevelSummary } from '../../../../lib/api/admin-levels-api';

type LevelsListProps = {
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
    data: {
      title: string;
      code: string | null;
      slug: string | null;
      description: string | null;
    },
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

export function LevelsList({
  levels,
  total,
  page,
  totalPages,
  courseId,
  onCreateLevel,
  onUpdateLevel,
}: LevelsListProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminLevelSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCreate(data: {
    title: string;
    code: string | null;
    slug: string | null;
    description: string | null;
  }) {
    const result = await onCreateLevel(data);
    if (!result.error) {
      setShowCreate(false);
      refresh();
    }
    return result;
  }

  async function handleUpdate(data: {
    title: string;
    code: string | null;
    slug: string | null;
    description: string | null;
  }) {
    if (!editing) return { error: 'No level selected for editing.' };
    const result = await onUpdateLevel(editing.id, data);
    if (!result.error) {
      setEditing(null);
      refresh();
    }
    return result;
  }

  if (showCreate) {
    return (
      <LevelForm
        mode="create"
        onSubmit={handleCreate}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  if (editing) {
    return (
      <LevelForm
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
          + New Level
        </button>
      </div>

      {levels.length === 0 ? (
        <p className="courses-empty">No levels yet. Create the first one.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Code</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Order</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {levels.map((level) => (
              <tr key={level.id}>
                <td className="course-title-cell">
                  <span>{level.title}</span>
                  {level.description && (
                    <small className="course-description">{level.description}</small>
                  )}
                </td>
                <td>
                  {level.code ? (
                    <code>{level.code}</code>
                  ) : (
                    <span className="courses-empty">—</span>
                  )}
                </td>
                <td className="course-slug-cell">
                  {level.slug ? (
                    <code>{level.slug}</code>
                  ) : (
                    <span className="courses-empty">—</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${STATUS_CLASSES[level.status] ?? ''}`}>
                    {STATUS_LABELS[level.status] ?? level.status}
                  </span>
                </td>
                <td>{level.sortOrder}</td>
                <td className="course-date-cell">
                  {new Date(level.updatedAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setEditing(level)}
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
        <nav className="admin-pagination" aria-label="Levels pagination">
          {page > 1 && (
            <a
              href={`?courseId=${encodeURIComponent(courseId)}&page=${page - 1}`}
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
              href={`?courseId=${encodeURIComponent(courseId)}&page=${page + 1}`}
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
