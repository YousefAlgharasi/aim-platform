'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CourseForm } from './course-form';
import type { AdminCourseSummary } from '../../../../lib/api/admin-courses-api';

type CoursesListProps = {
  readonly courses: AdminCourseSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly onCreateCourse: (data: {
    title: string;
    slug: string | null;
    description: string | null;
  }) => Promise<{ error?: string }>;
  readonly onUpdateCourse: (
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

export function CoursesList({
  courses,
  total,
  page,
  totalPages,
  onCreateCourse,
  onUpdateCourse,
}: CoursesListProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminCourseSummary | null>(null);
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleCreate(data: {
    title: string;
    slug: string | null;
    description: string | null;
  }) {
    const result = await onCreateCourse(data);
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
    if (!editing) return {};
    const result = await onUpdateCourse(editing.id, data);
    if (!result.error) {
      setEditing(null);
      refresh();
    }
    return result;
  }

  if (showCreate) {
    return (
      <CourseForm
        mode="create"
        onSubmit={handleCreate}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  if (editing) {
    return (
      <CourseForm
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
          + New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="courses-empty">No courses yet. Create the first one.</p>
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
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="course-title-cell">
                  <span>{course.title}</span>
                  {course.description && (
                    <small className="course-description">{course.description}</small>
                  )}
                </td>
                <td className="course-slug-cell">
                  {course.slug ? (
                    <code>{course.slug}</code>
                  ) : (
                    <span className="courses-empty">—</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${STATUS_CLASSES[course.status] ?? ''}`}>
                    {STATUS_LABELS[course.status] ?? course.status}
                  </span>
                </td>
                <td>{course.sortOrder}</td>
                <td className="course-date-cell">
                  {new Date(course.updatedAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => setEditing(course)}
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
        <nav className="admin-pagination" aria-label="Courses pagination">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="pagination-link">
              ← Previous
            </a>
          )}
          <span className="pagination-info">
            Page {page} of {totalPages} ({total} total)
          </span>
          {page < totalPages && (
            <a href={`?page=${page + 1}`} className="pagination-link">
              Next →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}
