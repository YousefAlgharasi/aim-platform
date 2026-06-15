// Phase 3 — P3-060
// Admin lesson status workflow page.
//
// Critical rule: lesson publish is blocked until ≥1 skill is linked.
// This page fetches both lesson metadata and skill-link count before rendering.
// Backend enforces the constraint at publish time — UI surfaces it early.

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

type Props = { params: Promise<{ lessonId: string }> };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function fetchLesson(token: string, lessonId: string) {
  try {
    const envelope = await adminApiClient.get<{ id: string; title: string; status: string }>(
      `/curriculum/lessons/${encodeURIComponent(lessonId)}`,
      (v) => {
        if (!isObj(v) || typeof (v as Record<string,unknown>).id !== 'string') throw new Error('bad');
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
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <Link href="/admin/content/lessons">Lessons</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/content/lessons/${lessonId}/skills`}>Skill Links</Link>
        <span aria-hidden="true">/</span>
        <span>Status</span>
      </nav>
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum — Status Workflow</p>
        <h1>Lesson Status</h1>
        <p className="admin-page-meta">
          Lessons must have ≥1 skill linked before they can be published.
        </p>
      </header>
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
        <p className="admin-error-banner" role="alert">Lesson not found or backend unavailable.</p>
      )}
    </section>
  );
}
