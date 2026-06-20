// P11-027: Admin skills management page with AIM design system.
// Backend is final authority for skill data and status transitions.

import { cookies } from 'next/headers';
import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../../lib/auth';
import {
  fetchAdminSkills,
  createAdminSkill,
  updateAdminSkill,
  type AdminSkillSummary,
  type AdminSkillListData,
  type CreateSkillPayload,
  type UpdateSkillPayload,
  type SkillStatus,
  type SkillDomain,
} from '../../../../lib/api/admin-skills-api';
import { AdminApiClientError } from '../../../../lib/api';
import {
  AdminTable,
  AdminPagination,
  AdminBadge,
  AdminFilterBar,
  AdminInput,
  AdminSelect,
  AdminIdCell,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../../components/common';
import { AdminPageHeader, AdminEmptyState } from '../../../../components/layout';
import { AdminApiErrorState } from '../../../../components/error-handling';
import { SkillsList } from './skills-list';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const STATUS_OPTIONS: SkillStatus[] = ['draft', 'published', 'archived'];
const DOMAIN_OPTIONS: SkillDomain[] = [
  'grammar', 'vocabulary', 'reading', 'listening',
  'speaking', 'writing', 'pronunciation', 'functional_language',
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  draft: 'neutral',
  published: 'success',
  archived: 'error',
};

const DOMAIN_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'> = {
  grammar: 'info',
  vocabulary: 'primary',
  reading: 'success',
  listening: 'warning',
  speaking: 'neutral',
  writing: 'neutral',
  pronunciation: 'info',
  functional_language: 'warning',
};

type Props = {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    domain?: string;
    q?: string;
  }>;
};

const columns: AdminTableColumn<AdminSkillSummary>[] = [
  {
    key: 'key',
    header: 'Key',
    render: (skill) => (
      <code style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{skill.key}</code>
    ),
  },
  {
    key: 'title',
    header: 'Title',
    render: (skill) => skill.title,
  },
  {
    key: 'domain',
    header: 'Domain',
    render: (skill) => (
      <AdminBadge variant={DOMAIN_VARIANT[skill.domain] ?? 'neutral'}>
        {skill.domain.replace('_', ' ')}
      </AdminBadge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (skill) => (
      <AdminBadge variant={STATUS_VARIANT[skill.status] ?? 'neutral'}>
        {skill.status}
      </AdminBadge>
    ),
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    render: (skill) => <AdminDateCell iso={skill.updatedAt} />,
  },
];

export default async function AdminSkillsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE;
  const limit = parseInt(resolvedParams.limit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT;
  const statusFilter = STATUS_OPTIONS.includes(resolvedParams.status as SkillStatus)
    ? (resolvedParams.status as SkillStatus)
    : undefined;
  const domainFilter = DOMAIN_OPTIONS.includes(resolvedParams.domain as SkillDomain)
    ? (resolvedParams.domain as SkillDomain)
    : undefined;
  const searchQuery = resolvedParams.q?.trim() || undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let data: AdminSkillListData | null = null;
  let fetchError: string | null = null;

  try {
    data = await fetchAdminSkills({
      token,
      page,
      limit,
      status: statusFilter,
      domain: domainFilter,
      q: searchQuery,
    });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load skills.';
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
    <section className="aim-skills-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/content" className="admin-breadcrumb-link">Content</Link>
        <span aria-hidden="true"> / </span>
        <span>Skills</span>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum"
        title="Skills"
        description={data ? `${data.total} skill${data.total !== 1 ? 's' : ''} total` : undefined}
      />

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Skill records, status, and lesson-skill
        links are controlled by backend curriculum APIs. Skills use stable keys
        (e.g. <code>grammar.past_simple.forms</code>). Publish and archive actions
        require backend permission checks. Lesson-skill linking is managed per lesson.
      </div>

      <form action="/admin/content/skills" method="get">
        <AdminFilterBar>
          <AdminInput
            name="q"
            placeholder="Search skills…"
            defaultValue={searchQuery ?? ''}
            aria-label="Search skills"
          />
          <AdminSelect
            name="status"
            defaultValue={statusFilter ?? ''}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </AdminSelect>
          <AdminSelect
            name="domain"
            defaultValue={domainFilter ?? ''}
            aria-label="Filter by domain"
          >
            <option value="">All domains</option>
            {DOMAIN_OPTIONS.map((d) => (
              <option key={d} value={d}>{d.replace('_', ' ')}</option>
            ))}
          </AdminSelect>
          <button type="submit" className="aim-filter-btn">Filter</button>
        </AdminFilterBar>
      </form>

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {data && data.skills.length === 0 && !fetchError && (
        <AdminEmptyState
          title="No skills found"
          description={
            statusFilter || domainFilter || searchQuery
              ? 'Try adjusting your filters or search query.'
              : 'No skills exist yet. Create the first one.'
          }
        />
      )}

      {data && data.skills.length > 0 && (
        <>
          <AdminTable
            columns={columns}
            rows={data.skills}
            getRowKey={(s) => s.id}
            caption="Skills"
          />

          <AdminPagination
            page={data.page}
            totalPages={totalPages}
            buildHref={(p) => {
              const params = new URLSearchParams();
              params.set('page', String(p));
              if (statusFilter) params.set('status', statusFilter);
              if (domainFilter) params.set('domain', domainFilter);
              if (searchQuery) params.set('q', searchQuery);
              return `/admin/content/skills?${params.toString()}`;
            }}
          />
        </>
      )}

      <SkillsList
        skills={data?.skills ?? []}
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        totalPages={totalPages}
        onCreateSkill={handleCreate}
        onUpdateSkill={handleUpdate}
      />

      <style>{`
        .aim-skills-page {
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }
        .aim-filter-btn {
          display: inline-flex;
          align-items: center;
          height: var(--size-btn-md);
          padding: 0 var(--space-20);
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-primary-500);
          color: var(--text-on-primary);
          font-family: inherit;
          font-size: 14px;
          font-weight: var(--weight-semibold);
          cursor: pointer;
          transition: background var(--duration-fast) var(--ease-standard);
        }
        .aim-filter-btn:hover { background: var(--color-primary-600); }
        .aim-filter-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
      `}</style>
    </section>
  );
}
