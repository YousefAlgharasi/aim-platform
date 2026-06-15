// Phase 3 — P3-056
// Admin objectives page.
//
// Scope: Curriculum & Content System — objectives only.
//
// Security:
// - Token is read from the HTTP-only cookie server-side; never exposed to the browser.
// - Auth state enforcement is handled by the parent layout (admin/layout.tsx).
// - This page renders data from backend only — it makes no authorization decisions.
// - Status transitions (publish, archive) are intentionally absent; backend controls those.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminObjectives,
  createAdminObjective,
  updateAdminObjective,
  type AdminObjectiveListData,
  type CreateObjectivePayload,
  type UpdateObjectivePayload,
} from '../../../../lib/api/admin-objectives-api';
import { AdminApiClientError } from '../../../../lib/api';
import { ObjectivesList } from './objectives-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

type Props = {
  searchParams: Promise<{ page?: string; limit?: string }>;
};

export default async function AdminObjectivesPage({ searchParams }: Props) {
  const { page: pageParam, limit: limitParam } = await searchParams;

  const page = parseInt(pageParam ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(limitParam ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminObjectiveListData | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminObjectives(token, page, limit);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load objectives. Check backend connectivity.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(
    payload: CreateObjectivePayload,
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await createAdminObjective(token, payload);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to create objective.';
      return { error: msg };
    }
  }

  async function handleUpdate(
    id: string,
    payload: UpdateObjectivePayload,
  ): Promise<{ error?: string }> {
    'use server';
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try {
      await updateAdminObjective(token, id, payload);
      return {};
    } catch (err) {
      const msg =
        err instanceof AdminApiClientError
          ? `Backend error ${err.status}: ${err.message}`
          : 'Failed to update objective.';
      return { error: msg };
    }
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <span>Objectives</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum</p>
        <h1>Objectives</h1>
        {data && (
          <p className="admin-page-meta">
            {data.total} objective{data.total !== 1 ? 's' : ''} total
          </p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Objective records, status, and skill
        links are controlled by backend curriculum APIs. Publish and archive
        actions require backend permission checks not exposed here. Lesson-objective
        linking is managed per lesson, not here.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {data && (
        <ObjectivesList
          objectives={data.objectives}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          onCreateObjective={handleCreate}
          onUpdateObjective={handleUpdate}
        />
      )}
    </section>
  );
}
