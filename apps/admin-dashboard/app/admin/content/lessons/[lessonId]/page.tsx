// P11-025: Admin lesson editor page using AIM design system.
// Backend is final authority for lesson data and status transitions.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../core/auth';
import { AdminApiClientError } from '../../../../../core/api';
import {
  fetchAdminLesson,
  updateAdminLesson,
  fetchTranslations,
  saveTranslations,
  deleteTranslation,
  type AdminLessonSummary,
  type TranslationInput,
  type TranslationsLoadResult,
} from '../../../../../features/content';
import { LessonEditorForm } from '../../../../../features/content';
import { AdminPageHeader } from '../../../../../shared/layouts/DashboardLayout';
import { AdminApiErrorState, AdminNotFoundState } from '../../../../../shared/components/error-handling';

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
            <Link href="/admin/content/courses" className="admin-breadcrumb-link">Courses</Link>
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
    translations: Readonly<Record<string, TranslationInput>>;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      const { translations, ...lessonData } = formData;
      await updateAdminLesson(token, lessonId, lessonData);
      if (Object.keys(translations).length > 0) {
        const { failures } = await saveTranslations('lessons', token, lessonId, translations);
        if (failures.length > 0) {
          const detail = failures.map((f) => `${f.locale}: ${f.message}`).join('; ');
          return { error: `The lesson was saved, but some translations were not (${detail}). Fix them and save again.` };
        }
      }
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update lesson.';
      return { error: msg };
    }
  }

  async function loadTranslationsAction(id: string): Promise<TranslationsLoadResult> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      return { data: await fetchTranslations('lessons', token, id) };
    } catch (err) {
      return {
        error: err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to load translations.',
      };
    }
  }

  async function removeTranslationAction(id: string, locale: string): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await deleteTranslation('lessons', token, id, locale);
      return {};
    } catch (err) {
      return {
        error: err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to remove translation.',
      };
    }
  }

  return (
    <section className="aim-lesson-editor-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/admin/content/courses" className="admin-breadcrumb-link">Courses</Link>
        <span aria-hidden="true"> / </span>
        <span>{lesson?.title ?? lessonId}</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum"
        title={lesson ? `Edit: ${lesson.title}` : 'Lesson Editor'}
        description={lesson ? `Status: ${lesson.status.replace('_', ' ')} · Order: ${lesson.sortOrder}` : undefined}
      />

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {lesson && (
        <LessonEditorForm
          lesson={lesson}
          onUpdate={handleUpdate}
          loadTranslations={loadTranslationsAction}
          onRemoveTranslation={removeTranslationAction}
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
