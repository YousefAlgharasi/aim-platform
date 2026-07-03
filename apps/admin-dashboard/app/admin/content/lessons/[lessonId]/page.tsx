// P11-025: Admin lesson editor page using AIM design system.
// Backend is final authority for lesson data and status transitions.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../lib/auth';
import { AdminApiClientError } from '../../../../../lib/api';
import {
  fetchAdminLesson,
  updateAdminLesson,
  type AdminLessonSummary,
} from '../../../../../lib/api/admin-lessons-api';
import { AdminPageHeader } from '../../../../../components/layout';
import { AdminApiErrorState, AdminNotFoundState } from '../../../../../components/error-handling';
import { LessonEditorForm } from './lesson-editor-form';

type Props = { params: Promise<{ lessonId: string }> };

export default async function AdminLessonEditorPage({ params }: Props) {
  const { lessonId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let lesson: AdminLessonSummary | null = null;
  let fetchError: string | null = null;

  try {
    lesson = await fetchAdminLesson(token, lessonId);
  } catch (error) {
    if (error instanceof AdminApiClientError && error.status === 404) {
      return (
        <section className="aim-lesson-editor-page">
          <nav className="admin-breadcrumb" aria-label="Breadcrumb">
            <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
            <span aria-hidden="true"> / </span>
            <Link href="/admin/content/lessons" className="admin-breadcrumb-link">Lessons</Link>
            <span aria-hidden="true"> / </span>
            <span>Not Found</span>
          </nav>
          <AdminNotFoundState message={`Lesson ${lessonId} not found.`} />
        </section>
      );
    }
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load lesson.';
  }

  async function handleUpdate(formData: {
    title: string;
    description: string;
    sortOrder?: number;
    systemPrompt?: string | null;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminLesson(token, lessonId, formData);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update lesson.';
      return { error: msg };
    }
  }

  return (
    <section className="aim-lesson-editor-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/admin/content/lessons" className="admin-breadcrumb-link">Lessons</Link>
        <span aria-hidden="true"> / </span>
        <span>{lesson?.title ?? lessonId}</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum"
        title={lesson ? `Edit: ${lesson.title}` : 'Lesson Editor'}
        description={lesson ? `Status: ${lesson.status.replace('_', ' ')} · Order: ${lesson.sortOrder}` : undefined}
      />

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Status changes (publish, archive) and
        skill linking are controlled by backend APIs. A lesson cannot be published
        until it is linked to at least one skill.
      </div>

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {lesson && (
        <LessonEditorForm
          lesson={lesson}
          onUpdate={handleUpdate}
        />
      )}

      <style>{`
        .aim-lesson-editor-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }
      `}</style>
    </section>
  );
}
