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
  type ObjectiveStatus,
} from '../../../../lib/api/admin-objectives-api';
import { AdminApiClientError } from '../../../../lib/api';
import { ObjectivesList } from './objectives-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const STATUS_OPTIONS: ObjectiveStatus[] = ['draft', 'published', 'archived'];

type Props = {
  searchParams: Promise<{ page?: string; limit?: string; status?: string; q?: string }>;
};

export default async function AdminObjectivesPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(resolvedParams.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const statusFilter = STATUS_OPTIONS.includes(resolvedParams.status as ObjectiveStatus)
    ? (resolvedParams.status as ObjectiveStatus) : undefined;
  const searchQuery = resolvedParams.q?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminObjectiveListData | null = null;
  let fetchError: string | null = null;
  try {
    data = await fetchAdminObjectives(token, page, limit, statusFilter);
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status}: ${error.message}` : 'Failed to load objectives.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(payload: CreateObjectivePayload): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try { await createAdminObjective(t, payload); return {}; }
    catch (err) { return { error: err instanceof AdminApiClientError ? `Backend error ${err.status}: ${err.message}` : 'Failed to create objective.' }; }
  }

  async function handleUpdate(id: string, payload: UpdateObjectivePayload): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try { await updateAdminObjective(t, id, payload); return {}; }
    catch (err) { return { error: err instanceof AdminApiClientError ? `Backend error ${err.status}: ${err.message}` : 'Failed to update objective.' }; }
  }

  return (
    <section className="ob-page">
      <nav className="ob-breadcrumb">
        <Link href="/admin/content" className="ob-breadcrumb-link">Content</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="ob-breadcrumb-current">Objectives</span>
      </nav>

      <div className="ob-header">
        <div>
          <p className="ob-eyebrow">Curriculum</p>
          <h1 className="ob-title">Objectives</h1>
          {data && <p className="ob-subtitle">{data.total} objective{data.total !== 1 ? 's' : ''} total</p>}
        </div>
      </div>

      <form action="/admin/content/objectives" method="get" className="ob-filters">
        <div className="ob-search-wrap">
          <svg className="ob-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input name="q" type="text" defaultValue={searchQuery ?? ''} placeholder="Search objectives…" className="ob-search" />
        </div>
        <select name="status" defaultValue={statusFilter ?? ''} className="ob-select">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="ob-filter-btn">Filter</button>
        {(statusFilter || searchQuery) && (
          <Link href="/admin/content/objectives" className="ob-clear">Clear</Link>
        )}
      </form>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {data && (
        <ObjectivesList
          objectives={data.objectives}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onCreateObjective={handleCreate}
          onUpdateObjective={handleUpdate}
        />
      )}

      <style>{`
        .ob-page { display: flex; flex-direction: column; gap: 20px; }
        .ob-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .ob-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .ob-breadcrumb-link:hover { text-decoration: underline; }
        .ob-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .ob-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ob-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ob-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ob-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .ob-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .ob-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
        .ob-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .ob-search {
          width: 100%; height: 38px; padding: 0 12px 0 34px;
          border: 1px solid var(--border); border-radius: var(--radius-md);
          background: var(--surface); color: var(--text-primary); font-size: 13px; font-family: inherit;
        }
        .ob-search:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .ob-select {
          height: 38px; padding: 0 10px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-primary); font-size: 13px; font-family: inherit; min-width: 130px;
        }
        .ob-filter-btn {
          height: 38px; padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .ob-filter-btn:hover { background: var(--color-primary-600); }
        .ob-clear { font-size: 13px; color: var(--text-link); text-decoration: none; padding: 0 4px; }
        .ob-clear:hover { text-decoration: underline; }
        @media (max-width: 640px) {
          .ob-filters { flex-direction: column; }
          .ob-search-wrap { max-width: none; }
        }
      `}</style>
    </section>
  );
}
