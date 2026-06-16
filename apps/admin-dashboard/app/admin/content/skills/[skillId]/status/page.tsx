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

type Props = { params: Promise<{ skillId: string }> };

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

async function fetchEntity(token: string, id: string) {
  try {
    const envelope = await adminApiClient.get<{ id: string; title: string; status: string }>(
      `/curriculum/skills/${encodeURIComponent(id)}`,
      (v) => {
        if (!isObj(v) || typeof (v as Record<string,unknown>).id !== 'string') throw new Error('bad');
        const r = v as Record<string, unknown>;
        return { id: String(r.id), title: String(r.title ?? r.key ?? ''), status: String(r.status ?? 'draft') };
      },
      { headers: { authorization: `Bearer ${token}` } },
    );
    return envelope.data;
  } catch {
    return null;
  }
}

export default async function SkillStatusPage({ params }: Props) {
  const { skillId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  const entity = await fetchEntity(token, skillId);

  async function handleTransition(
    action: 'publish' | 'archive' | 'restore',
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const t = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      if (action === 'publish') await publishContent(t, 'skills', skillId);
      else if (action === 'archive') await archiveContent(t, 'skills', skillId);
      else await restoreContent(t, 'skills', skillId);
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
        <Link href="/admin/content/skills">Skills</Link>
        <span aria-hidden="true">/</span>
        <span>Status</span>
      </nav>
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum — Status Workflow</p>
        <h1>Skill Status</h1>
      </header>
      {entity ? (
        <ContentStatusWorkflow
          entityId={skillId}
          entityType="skills"
          entityTitle={entity.title}
          currentStatus={entity.status as ContentStatus}
          onTransition={handleTransition}
        />
      ) : (
        <p className="admin-error-banner" role="alert">Skill not found or backend unavailable.</p>
      )}
    </section>
  );
}
