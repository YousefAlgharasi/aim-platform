// Phase 3 — P3-060
// Admin course status workflow page.
//
// Calls backend POST /curriculum/courses/:id/publish|archive|restore.
// Backend enforces: curriculum.content.publish / archive / restore permissions.
// This page does not implement authorization logic — backend is authoritative.

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
import { ContentStatusWorkflow } from '../../../../../../components/content-status-workflow';

type Props = { params: Promise<{ courseId: string }> };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function fetchCourse(token: string, courseId: string) {
  try {
    const envelope = await adminApiClient.get<{ id: string; title: string; status: string }>(
      `/curriculum/courses/${encodeURIComponent(courseId)}`,
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

export default async function CourseStatusPage({ params }: Props) {
  const { courseId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  const course = await fetchCourse(token, courseId);

  async function handleTransition(
    action: 'publish' | 'archive' | 'restore',
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const t = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      if (action === 'publish') await publishContent(t, 'courses', courseId);
      else if (action === 'archive') await archiveContent(t, 'courses', courseId);
      else await restoreContent(t, 'courses', courseId);
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
        <Link href="/admin/content/courses">Courses</Link>
        <span aria-hidden="true">/</span>
        <span>Status</span>
      </nav>
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum — Status Workflow</p>
        <h1>Course Status</h1>
      </header>
      {course ? (
        <ContentStatusWorkflow
          entityId={courseId}
          entityType="courses"
          entityTitle={course.title}
          currentStatus={course.status as ContentStatus}
          onTransition={handleTransition}
        />
      ) : (
        <p className="admin-error-banner" role="alert">Course not found or backend unavailable.</p>
      )}
    </section>
  );
}
