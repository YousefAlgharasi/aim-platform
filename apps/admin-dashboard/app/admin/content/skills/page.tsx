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
  type SkillStatus,
  type SkillDomain,
} from '../../../../lib/api/admin-skills-api';
import { AdminApiClientError } from '../../../../lib/api';
import { SkillsList } from './skills-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const STATUS_OPTIONS: SkillStatus[] = ['draft', 'published', 'archived'];
const DOMAIN_OPTIONS: SkillDomain[] = [
  'grammar', 'vocabulary', 'reading', 'listening',
  'speaking', 'writing', 'pronunciation', 'functional_language',
];

type Props = {
  searchParams: Promise<{
    page?: string; limit?: string; status?: string; domain?: string; q?: string;
  }>;
};

export default async function AdminSkillsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(resolvedParams.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const statusFilter = STATUS_OPTIONS.includes(resolvedParams.status as SkillStatus)
    ? (resolvedParams.status as SkillStatus) : undefined;
  const domainFilter = DOMAIN_OPTIONS.includes(resolvedParams.domain as SkillDomain)
    ? (resolvedParams.domain as SkillDomain) : undefined;
  const searchQuery = resolvedParams.q?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminSkillListData | null = null;
  let fetchError: string | null = null;
  try {
    data = await fetchAdminSkills({ token, page, limit, status: statusFilter, domain: domainFilter, q: searchQuery });
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status}: ${error.message}` : 'Failed to load skills.';
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  async function handleCreate(payload: CreateSkillPayload): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try { await createAdminSkill(t, payload); return {}; }
    catch (err) { return { error: err instanceof AdminApiClientError ? `Backend error ${err.status}: ${err.message}` : 'Failed to create skill.' }; }
  }

  async function handleUpdate(id: string, payload: UpdateSkillPayload): Promise<{ error?: string }> {
    'use server';
    const cs = await cookies();
    const t = cs.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';
    try { await updateAdminSkill(t, id, payload); return {}; }
    catch (err) { return { error: err instanceof AdminApiClientError ? `Backend error ${err.status}: ${err.message}` : 'Failed to update skill.' }; }
  }

  return (
    <section className="cp-page">
      <nav className="cp-breadcrumb">
        <Link href="/admin/content" className="cp-breadcrumb-link">Content</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="cp-breadcrumb-current">Skills</span>
      </nav>

      <div className="cp-header">
        <div>
          <p className="cp-eyebrow">Curriculum</p>
          <h1 className="cp-title">Skills</h1>
          {data && <p className="cp-subtitle">{data.total} skill{data.total !== 1 ? 's' : ''} total</p>}
        </div>
      </div>

      {/* Filters */}
      <form action="/admin/content/skills" method="get" className="cp-filters">
        <div className="cp-search-wrap">
          <svg className="cp-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input name="q" type="text" defaultValue={searchQuery ?? ''} placeholder="Search skills…" className="cp-search" />
        </div>
        <select name="status" defaultValue={statusFilter ?? ''} className="cp-select">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="domain" defaultValue={domainFilter ?? ''} className="cp-select">
          <option value="">All domains</option>
          {DOMAIN_OPTIONS.map((d) => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
        </select>
        <button type="submit" className="cp-filter-btn">Filter</button>
        {(statusFilter || domainFilter || searchQuery) && (
          <Link href="/admin/content/skills" className="cp-clear">Clear</Link>
        )}
      </form>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {data && (
        <SkillsList
          skills={data.skills}
          total={data.total}
          page={data.page}
          totalPages={totalPages}
          statusFilter={statusFilter}
          domainFilter={domainFilter}
          searchQuery={searchQuery}
          onCreateSkill={handleCreate}
          onUpdateSkill={handleUpdate}
        />
      )}

      <style>{`
        .cp-page { display: flex; flex-direction: column; gap: 20px; }
        .cp-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .cp-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .cp-breadcrumb-link:hover { text-decoration: underline; }
        .cp-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .cp-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .cp-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .cp-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .cp-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .cp-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .cp-search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 300px; }
        .cp-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .cp-search {
          width: 100%; height: 38px; padding: 0 12px 0 34px;
          border: 1px solid var(--border); border-radius: var(--radius-md);
          background: var(--surface); color: var(--text-primary); font-size: 13px; font-family: inherit;
        }
        .cp-search:focus { outline: none; border-color: var(--color-primary-500); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent); }
        .cp-select {
          height: 38px; padding: 0 10px; border: 1px solid var(--border);
          border-radius: var(--radius-md); background: var(--surface);
          color: var(--text-primary); font-size: 13px; font-family: inherit; min-width: 130px;
        }
        .cp-filter-btn {
          height: 38px; padding: 0 16px; border: none; border-radius: var(--radius-md);
          background: var(--color-primary-500); color: white;
          font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer;
        }
        .cp-filter-btn:hover { background: var(--color-primary-600); }
        .cp-clear { font-size: 13px; color: var(--text-link); text-decoration: none; padding: 0 4px; }
        .cp-clear:hover { text-decoration: underline; }
        @media (max-width: 640px) {
          .cp-filters { flex-direction: column; }
          .cp-search-wrap { max-width: none; }
        }
      `}</style>
    </section>
  );
}
