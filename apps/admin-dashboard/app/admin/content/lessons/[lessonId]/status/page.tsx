// P11-028: Admin lesson status workflow page using AIM design system.
// Backend is the sole authority for status transitions.
// Lessons must have at least one skill linked before publishing.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../../../lib/auth';
import { AdminApiClientError, adminApiClient } from '../../../../../../lib/api';
import {
  publishContent,
  archiveContent,
  restoreContent,
  type ContentStatus,
} from '../../../../../../lib/api/admin-content-status-api';
import { fetchLessonSkillLinks } from '../../../../../../lib/api/admin-lesson-skills-api';
import { ContentStatusWorkflow } from '../../../../../../components/content-status-workflow';
import { AdminPageHeader } from '../../../../../../components/layout';
import { AdminApiErrorState } from '../../../../../../components/error-handling';

type Props = { params: Promise<{ lessonId: string }> };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function fetchLesson(token: string, lessonId: string) {
  try {
    const envelope = await adminApiClient.get<{ id: string; title: string; status: string }>(
      `/curriculum/lessons/${encodeURIComponent(lessonId)}`,
      (v) => {
        if (!isObj(v) || typeof (v as Record<string, unknown>).id !== 'string') throw new Error('bad');
        const r = v as Record<string, unknown>;
        return { id: String(r.id), title: String(r.title ?? ''), status: String(r.status ?? 'draft') };
      },
      { headers: { authorization: `Bearer ${token}` } },
    );
    return envelope.data;
  } catch {
    return null;
  }
}

export default async function LessonStatusPage({ params }: Props) {
  const { lessonId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  const [lesson, skillLinks] = await Promise.all([
    fetchLesson(token, lessonId),
    fetchLessonSkillLinks(token, lessonId).catch(() => null),
  ]);

  const skillLinkCount = skillLinks?.total ?? 0;

  async function handleTransition(
    action: 'publish' | 'archive' | 'restore',
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const t = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      if (action === 'publish') await publishContent(t, 'lessons', lessonId);
      else if (action === 'archive') await archiveContent(t, 'lessons', lessonId);
      else await restoreContent(t, 'lessons', lessonId);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Status transition failed.';
      return { error: msg };
    }
  }

  return (
    <section className="aim-status-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/admin/content/lessons" className="admin-breadcrumb-link">Lessons</Link>
        <span aria-hidden="true"> / </span>
        <span>Status</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum — Status Workflow"
        title="Lesson Status"
        description="Lessons must have at least one skill linked before they can be published."
      />

      {lesson ? (
        <ContentStatusWorkflow
          entityId={lessonId}
          entityType="lessons"
          entityTitle={lesson.title}
          currentStatus={lesson.status as ContentStatus}
          skillLinkCount={skillLinkCount}
          onTransition={handleTransition}
        />
      ) : (
        <AdminApiErrorState message="Lesson not found or backend unavailable." />
      )}

      <style>{`
        .aim-status-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }
      `}</style>
    </section>
  );
}
