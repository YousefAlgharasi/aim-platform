// Phase 3 — P3-055
// Admin skills page.
//
// Scope: Curriculum & Content System — skills only.
//
// Security:
// - Token is read from the HTTP-only cookie server-side; never exposed to the browser.
// - Auth state enforcement is handled by the parent layout (admin/layout.tsx).
// - This page renders data from backend only — it makes no authorization decisions.
// - Status transitions (publish, archive) are handled via the status workflow page.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  type AdminSkillListData,
  type CreateSkillPayload,
  type UpdateSkillPayload,
} from '../../../../lib/api/admin-skills-api';
import { AdminApiClientError } from '../../../../lib/api';
import { SkillsList } from './skills-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

export default async function AdminSkillsPage({ searchParams }: Props) {
  const { page: pageParam, limit: limitParam } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminSkillListData | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminSkills(token, page, limit);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load skills. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(
    payload: CreateSkillPayload,
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminSkill(token, payload);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create skill.';
      return { error: msg };
    }
  }

  async function handleUpdate(
    id: string,
    payload: UpdateSkillPayload,
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminSkill(token, id, payload);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update skill.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <span>Skills</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum</p>
        <h1>Skills</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} skill{data.total !== 1 ? 's' : ''} total
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Skill records, status, and lesson-skill
        links are controlled by backend curriculum APIs. Skills use stable keys
        (e.g. <code>grammar.past_simple.forms</code>) — never display labels.
        Publish and archive actions require backend permission checks. Lesson-skill
        linking is managed per lesson.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {data && (
        <SkillsList
          skills={data.skills}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          onCreateSkill={handleCreate}
          onUpdateSkill={handleUpdate}
        />
      )}
    </section>
  );
}
