'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CourseForm } from '../components/course-form';
import { ContentStatusWorkflow } from '../components/content-status-workflow';
import { CurriculumTree, type CurriculumTreeActions } from '../components/curriculum-tree';
import type { ContentStatus } from '../api/admin-content-status-api';
import type { AdminCourseSummary } from '../api/admin-courses-api';

type Props = {
  readonly courses: AdminCourseSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly statusFilter?: string;
  readonly searchQuery?: string;
  readonly onCreateCourse: (data: {
    title: string;
    slug: string | null;
    description: string | null;
  }) => Promise<{ error?: string }>;
  readonly onUpdateCourse: (
    id: string,
    data: { title: string; slug: string | null; description: string | null },
  ) => Promise<{ error?: string }>;
  readonly onTransitionCourse: (
    id: string,
    action: 'publish' | 'archive' | 'restore',
  ) => Promise<{ error?: string }>;
  readonly curriculumActions: CurriculumTreeActions;
};

const STATUS_DOT: Record<string, string> = {
  draft: 'var(--text-muted)',
  in_review: 'var(--color-warning-500, #f59e0b)',
  approved: 'var(--color-primary-500)',
  published: 'var(--color-success-500)',
  archived: 'var(--text-muted)',
};

type DetailTab = 'details' | 'curriculum' | 'status';

export function CoursesList({
  courses,
  total,
  page,
  totalPages,
  statusFilter,
  searchQuery,
  onCreateCourse,
  onUpdateCourse,
  onTransitionCourse,
  curriculumActions,
}: Props) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<AdminCourseSummary | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('details');
  const [, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleCreate(data: { title: string; slug: string | null; description: string | null }) {
    const result = await onCreateCourse(data);
    if (!result.error) { setShowCreate(false); refresh(); }
    return result;
  }

  async function handleUpdate(data: { title: string; slug: string | null; description: string | null }) {
    if (!selected) return {};
    const result = await onUpdateCourse(selected.id, data);
    if (!result.error) { setSelected(null); refresh(); }
    return result;
  }

  async function handleTransition(action: 'publish' | 'archive' | 'restore') {
    if (!selected) return { error: 'No course selected.' };
    const result = await onTransitionCourse(selected.id, action);
    if (!result.error) refresh();
    return result;
  }

  function openCourse(course: AdminCourseSummary, tab: DetailTab) {
    setSelected(course);
    setActiveTab(tab);
  }

  if (showCreate) {
    return <CourseForm mode="create" onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />;
  }

  if (selected) {
    return (
      <div className="cl-detail">
        <div className="cl-detail-header">
          <button type="button" className="cl-back-btn" onClick={() => setSelected(null)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
            Back to courses
          </button>
        </div>
        <div className="cl-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'details'}
            className={`cl-tab ${activeTab === 'details' ? 'cl-tab--active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'curriculum'}
            className={`cl-tab ${activeTab === 'curriculum' ? 'cl-tab--active' : ''}`}
            onClick={() => setActiveTab('curriculum')}
          >
            Curriculum
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'status'}
            className={`cl-tab ${activeTab === 'status' ? 'cl-tab--active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            Status
          </button>
        </div>
        {activeTab === 'details' && (
          <CourseForm mode="edit" initial={selected} onSubmit={handleUpdate} onCancel={() => setSelected(null)} />
        )}
        {activeTab === 'curriculum' && (
          <CurriculumTree courseId={selected.id} courseTitle={selected.title} actions={curriculumActions} />
        )}
        {activeTab === 'status' && (
          <ContentStatusWorkflow
            entityId={selected.id}
            entityType="courses"
            entityTitle={selected.title}
            currentStatus={selected.status as ContentStatus}
            onTransition={handleTransition}
          />
        )}
        <style>{`
          .cl-detail { display: flex; flex-direction: column; gap: 16px; }
          .cl-detail-header { display: flex; }
          .cl-back-btn {
            display: inline-flex; align-items: center; gap: 6px;
            background: none; border: none; color: var(--text-link);
            font-size: 13px; font-weight: 600; cursor: pointer; padding: 4px 0; font-family: inherit;
          }
          .cl-back-btn:hover { text-decoration: underline; }
          .cl-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); }
          .cl-tab {
            padding: 8px 16px; border: none; background: none; cursor: pointer;
            font-size: 13px; font-weight: 600; color: var(--text-muted); font-family: inherit;
            border-bottom: 2px solid transparent; margin-bottom: -1px;
          }
          .cl-tab:hover { color: var(--text-primary); }
          .cl-tab--active { color: var(--color-primary-500); border-bottom-color: var(--color-primary-500); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cl-root">
      {/* New course button */}
      <div className="cl-toolbar">
        <button type="button" className="cl-create-btn" onClick={() => setShowCreate(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
          New Course
        </button>
      </div>

      {/* Table */}
      {courses.length > 0 && (
        <div className="cl-table-wrap">
          <table className="cl-table">
            <thead>
              <tr>
                <th className="cl-th">Course</th>
                <th className="cl-th cl-th--status">Status</th>
                <th className="cl-th cl-th--order">Order</th>
                <th className="cl-th cl-th--date">Updated</th>
                <th className="cl-th cl-th--actions" />
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="cl-row">
                  <td className="cl-td">
                    <button type="button" className="cl-course-link" onClick={() => openCourse(course, 'details')}>
                      <div className="cl-course-info">
                        <span className="cl-course-title">{course.title}</span>
                        {course.slug && <span className="cl-course-slug">{course.slug}</span>}
                        {course.description && <span className="cl-course-desc">{course.description}</span>}
                      </div>
                    </button>
                  </td>
                  <td className="cl-td">
                    <span className="cl-status">
                      <span className="cl-status-dot" style={{ background: STATUS_DOT[course.status] ?? 'var(--text-muted)' }} />
                      {course.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="cl-td cl-td--order">{course.sortOrder}</td>
                  <td className="cl-td cl-td--date">{fmtDate(course.updatedAt)}</td>
                  <td className="cl-td cl-td--actions">
                    <button type="button" className="cl-edit-btn" onClick={() => openCourse(course, 'curriculum')}>
                      Curriculum
                    </button>
                    <button type="button" className="cl-edit-btn" onClick={() => openCourse(course, 'status')}>
                      Status
                    </button>
                    <button type="button" className="cl-edit-btn" onClick={() => openCourse(course, 'details')}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="cl-pagination">
          {page > 1 && (
            <Link href={buildHref(page - 1, statusFilter, searchQuery)} className="cl-page-btn">← Previous</Link>
          )}
          <span className="cl-page-info">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={buildHref(page + 1, statusFilter, searchQuery)} className="cl-page-btn">Next →</Link>
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
        .cl-create-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }

        .cl-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .cl-table { width: 100%; border-collapse: collapse; min-width: 580px; }
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
        .cl-row:hover { background: var(--state-hover, color-mix(in srgb, var(--color-primary-500) 3%, transparent)); }
        .cl-row:not(:last-child) .cl-td { border-bottom: 1px solid var(--border); }
        .cl-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); vertical-align: top; }
        .cl-td--order { text-align: center; font-weight: 600; color: var(--text-secondary); font-size: 13px; }
        .cl-td--date { font-size: 12px; color: var(--text-secondary); }
        .cl-td--actions { text-align: right; display: flex; gap: 6px; justify-content: flex-end; }

        .cl-course-link {
          text-decoration: none; color: inherit; display: block; width: 100%;
          background: none; border: none; padding: 0; margin: 0; text-align: left;
          font-family: inherit; cursor: pointer;
        }
        .cl-course-info { display: flex; flex-direction: column; gap: 2px; }
        .cl-course-title { font-weight: 600; color: var(--text-primary); }
        .cl-course-link:hover .cl-course-title { color: var(--color-primary-500); }
        .cl-course-slug {
          font-size: 12px; font-family: var(--font-mono, monospace);
          color: var(--text-muted);
        }
        .cl-course-desc {
          font-size: 12px; color: var(--text-secondary);
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
          max-width: 360px;
        }

        .cl-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: var(--text-secondary);
          text-transform: capitalize;
        }
        .cl-status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        .cl-edit-btn {
          background: none; border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 4px 12px; font-size: 12px; font-weight: 500; color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
        }
        .cl-edit-btn:hover { background: var(--surface-sunken); color: var(--text-primary); }

        .cl-pagination {
          display: flex; align-items: center; justify-content: center; gap: 14px; padding: 4px 0;
        }
        .cl-page-btn {
          font-size: 13px; font-weight: 600; color: var(--color-primary-500);
          text-decoration: none; padding: 6px 12px; border-radius: var(--radius-sm);
        }
        .cl-page-btn:hover { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
        .cl-page-info { font-size: 13px; color: var(--text-secondary); }

        @media (max-width: 640px) {
          .cl-course-desc { display: none; }
          .cl-th--order, .cl-td--order { display: none; }
        }
      `}</style>
    </div>
  );
}

function buildHref(page: number, status?: string, q?: string): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  return `/admin/content/courses?${params.toString()}`;
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(iso));
  } catch { return '—'; }
}
