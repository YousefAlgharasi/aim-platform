// P11-028: Admin course status workflow page using AIM design system.
// Backend is the sole authority for status transitions.

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
import { AdminPageHeader } from '../../../../../../components/layout';
import { AdminApiErrorState } from '../../../../../../components/error-handling';

type Props = { params: Promise<{ courseId: string }> };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function fetchCourse(token: string, courseId: string) {
  try {
    const envelope = await adminApiClient.get<{ id: string; title: string; status: string }>(
      `/curriculum/courses/${encodeURIComponent(courseId)}`,
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
    <section className="aim-status-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/admin/content/courses" className="admin-breadcrumb-link">Courses</Link>
        <span aria-hidden="true"> / </span>
        <span>Status</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum — Status Workflow"
        title="Course Status"
      />

      {course ? (
        <ContentStatusWorkflow
          entityId={courseId}
          entityType="courses"
          entityTitle={course.title}
          currentStatus={course.status as ContentStatus}
          onTransition={handleTransition}
        />
      ) : (
        <AdminApiErrorState message="Course not found or backend unavailable." />
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
