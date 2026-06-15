'use client';

// Phase 3 — P3-057
// Admin lessons list client component.
//
// Scope: Curriculum & Content System — lessons only.
//
// Security:
// - All mutations flow through server actions in page.tsx; token is never in client code.
// - Status display is read-only; publish/archive are backend-only operations.
//
// Lesson-skill rule (P3-006):
// - Every lesson must be linked to one or more skills before it can be published.
// - This component surfaces a per-row "Manage Skills" action so admins can
//   navigate to skill linking for each lesson without leaving the lessons table.
// - Backend enforces the rule at publish time; this UI makes the requirement visible.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LessonForm } from './lesson-form';
import type { AdminLessonSummary } from '../../../../lib/api/admin-lessons-api';

type LessonsListProps = {
  readonly lessons: AdminLessonSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly courseId: string;
  readonly levelId: string;
  readonly chapterId: string;
  readonly onCreateLesson: (data: {
    title: string;
    description: string;
  }) => Promise<{ error?: string }>;
  readonly onUpdateLesson: (
    id: string,
    data: { title: string; description: string },
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

function buildQuery(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}

function skillLinkHref(lessonId: string, courseId: string, levelId: string, chapterId: string): string {
  return `/admin/content/lessons/skills?lessonId=${encodeURIComponent(lessonId)}&courseId=${encodeURIComponent(courseId)}&levelId=${encodeURIComponent(levelId)}&chapterId=${encodeURIComponent(chapterId)}`;
}

function SkillLinkCell({
  lesson,
  courseId,
  levelId,
  chapterId,
}: {
  lesson: AdminLessonSummary;
  courseId: string;
  levelId: string;
  chapterId: string;
}) {
  if (lesson.status === 'archived') {
    return <span className="admin-muted">—</span>;
  }

  const href = skillLinkHref(lesson.id, courseId, levelId, chapterId);

  if (lesson.status === 'published') {
    return (
      <a href={href} className="admin-skill-link-badge admin-skill-link-badge--ok">
        Linked ✓
      </a>
    );
  }

  return (
    <a
      href={href}
      className="admin-skill-link-badge admin-skill-link-badge--required"
      title="Every lesson must be linked to at least one skill before it can be published."
    >
      Link skills ⚠
    </a>
  );
}

export function LessonsList({
  lessons,
  total,
  page,
  totalPages,
  courseId,
  levelId,
  chapterId,
  onCreateLesson,
  onUpdateLesson,
}: LessonsListProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminLessonSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCreate(data: { title: string; description: string }) {
    const result = await onCreateLesson(data);
    if (!result.error) {
      setShowCreate(false);
      refresh();
    }
    return result;
  }

  async function handleUpdate(data: { title: string; description: string }) {
    if (!editing) return { error: 'No lesson selected for editing.' };
    const result = await onUpdateLesson(editing.id, data);
    if (!result.error) {
      setEditing(null);
      refresh();
    }
    return result;
  }

  if (showCreate) {
    return <LessonForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />;
  }

  if (editing) {
    return (
      <LessonForm
        mode="edit"
        initial={editing}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const baseQuery = { courseId, levelId, chapterId };

  return (
    <div>
      <div className="courses-toolbar">
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          + New Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <p className="courses-empty">No lessons yet. Create the first one.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Skills</th>
              <th>Order</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id}>
                <td className="course-title-cell">
                  <span>{lesson.title}</span>
                </td>
                <td className="course-description">{lesson.description}</td>
                <td>
                  <span className={`status-badge ${STATUS_CLASSES[lesson.status] ?? ''}`}>
                    {STATUS_LABELS[lesson.status] ?? lesson.status}
                  </span>
                </td>
                <td>
                  <SkillLinkCell
                    lesson={lesson}
                    courseId={courseId}
                    levelId={levelId}
                    chapterId={chapterId}
                  />
                </td>
                <td>{lesson.sortOrder}</td>
                <td className="course-date-cell">
                  {new Date(lesson.updatedAt).toLocaleDateString()}
                </td>
                <td>
                  <button className="btn-secondary btn-sm" onClick={() => setEditing(lesson)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Lessons pagination">
          {page > 1 && (
            <a href={`?${buildQuery({ ...baseQuery, page: page - 1 })}`} className="pagination-link">
              ← Previous
            </a>
          )}
          <span className="pagination-info">
            Page {page} of {totalPages} ({total} total)
          </span>
          {page < totalPages && (
            <a href={`?${buildQuery({ ...baseQuery, page: page + 1 })}`} className="pagination-link">
              Next →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}
