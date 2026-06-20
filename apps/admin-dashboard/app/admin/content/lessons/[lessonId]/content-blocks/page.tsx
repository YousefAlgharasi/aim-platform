// P11-026: Admin lesson content blocks page using AIM design system.
// Backend is final authority for lesson content blocks.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../../lib/auth';
import { AdminApiClientError } from '../../../../../../lib/api';
import {
  fetchAdminLesson,
  type AdminLessonSummary,
} from '../../../../../../lib/api/admin-lessons-api';
import {
  fetchLessonContentBlocks,
  createLessonContentBlock,
  updateLessonContentBlock,
  deleteLessonContentBlock,
  type AdminContentBlockListData,
  type ContentBlockType,
} from '../../../../../../lib/api/admin-lesson-content-api';
import {
  AdminBadge,
} from '../../../../../../components/common';
import { AdminPageHeader } from '../../../../../../components/layout';
import { AdminApiErrorState, AdminNotFoundState } from '../../../../../../components/error-handling';
import { ContentBlocksList } from './content-blocks-list';

type Props = { params: Promise<{ lessonId: string }> };

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral',
  in_review: 'warning',
  approved: 'info',
  published: 'success',
  archived: 'error',
};

export default async function LessonContentBlocksPage({ params }: Props) {
  const { lessonId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let lesson: AdminLessonSummary | null = null;
  let lessonError: string | null = null;

  try {
    lesson = await fetchAdminLesson(token, lessonId);
  } catch (error) {
    if (error instanceof AdminApiClientError && error.status === 404) {
      return (
        <section className="aim-content-blocks-page">
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
    lessonError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load lesson.';
  }

  let blocksData: AdminContentBlockListData | null = null;
  let blocksError: string | null = null;

  if (lesson && !lessonError) {
    try {
      blocksData = await fetchLessonContentBlocks(token, lessonId);
    } catch (error) {
      blocksError =
        error instanceof AdminApiClientError
          ? `Backend error ${error.status}: ${error.message}`
          : 'Failed to load content blocks.';
    }
  }

  async function handleCreate(formData: {
    type: ContentBlockType;
    title: string;
    content: string;
    sortOrder?: number;
  }): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createLessonContentBlock(token, lessonId, formData);
      return {};
    } catch (err) {
      return {
        error:
          err instanceof AdminApiClientError
            ? `Backend error ${err.status}: ${err.message}`
            : 'Failed to create content block.',
      };
    }
  }

  async function handleUpdate(
    blockId: string,
    formData: { title?: string; content?: string; sortOrder?: number },
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateLessonContentBlock(token, lessonId, blockId, formData);
      return {};
    } catch (err) {
      return {
        error:
          err instanceof AdminApiClientError
            ? `Backend error ${err.status}: ${err.message}`
            : 'Failed to update content block.',
      };
    }
  }

  async function handleDelete(blockId: string): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await deleteLessonContentBlock(token, lessonId, blockId);
      return {};
    } catch (err) {
      return {
        error:
          err instanceof AdminApiClientError
            ? `Backend error ${err.status}: ${err.message}`
            : 'Failed to delete content block.',
      };
    }
  }

  return (
    <section className="aim-content-blocks-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/admin/content/lessons" className="admin-breadcrumb-link">Lessons</Link>
        <span aria-hidden="true"> / </span>
        {lesson && (
          <>
            <Link
              href={`/admin/content/lessons/${encodeURIComponent(lessonId)}`}
              className="admin-breadcrumb-link"
            >
              {lesson.title}
            </Link>
            <span aria-hidden="true"> / </span>
          </>
        )}
        <span>Content Blocks</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum"
        title="Content Blocks"
        description={
          lesson
            ? `${blocksData?.total ?? 0} block${(blocksData?.total ?? 0) !== 1 ? 's' : ''} in "${lesson.title}"`
            : undefined
        }
      />

      {lesson && (
        <div className="aim-content-blocks-lesson-info">
          <span><strong>Lesson:</strong> {lesson.title}</span>
          <AdminBadge variant={STATUS_VARIANT[lesson.status] ?? 'neutral'}>
            {lesson.status.replace('_', ' ')}
          </AdminBadge>
          <span className="aim-content-blocks-meta">
            Order: {lesson.sortOrder} · Updated: {new Date(lesson.updatedAt).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Content blocks are managed by backend
        curriculum APIs. Block ordering and content validation are enforced
        server-side.
      </div>

      {lessonError && <AdminApiErrorState message={lessonError} />}
      {blocksError && <AdminApiErrorState message={blocksError} />}

      {blocksData && (
        <ContentBlocksList
          blocks={blocksData.blocks}
          total={blocksData.total}
          lessonId={lessonId}
          onCreateBlock={handleCreate}
          onUpdateBlock={handleUpdate}
          onDeleteBlock={handleDelete}
        />
      )}

      <style>{`
        .aim-content-blocks-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }
        .aim-content-blocks-lesson-info {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          padding: var(--space-12) var(--space-16);
          background: var(--surface-secondary);
          border-radius: var(--radius-md);
          font-size: 14px;
        }
        .aim-content-blocks-meta {
          color: var(--text-muted);
          font-size: 13px;
        }
      `}</style>
    </section>
  );
}
