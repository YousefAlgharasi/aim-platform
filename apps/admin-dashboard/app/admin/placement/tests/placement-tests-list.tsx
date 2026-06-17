'use client';

// Phase 4 — P4-054 / P4-058
// AdminPlacementTestsList — client component.
//
// Scope: Placement Test phase only — admin view of placement test definitions.
//
// Security rules:
// - All data is fetched server-side (page.tsx) and passed as props — never fetched here.
// - status is displayed as-is from the backend; never computed by this component.
// - estimatedMinutes and totalSections come from the backend only.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// P4-058: Added "Status →" link column to navigate to draft/published status control per test.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  AdminPlacementTestSummary,
  PlacementTestStatus,
} from '../../../../lib/api/admin-placement-tests-api';

type AdminPlacementTestsListProps = {
  readonly tests: AdminPlacementTestSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterStatus: string;
};

const STATUS_BADGE_CLASSES: Record<PlacementTestStatus, string> = {
  published: 'status-published',
  draft: 'status-draft',
  archived: 'status-archived',
};

const STATUS_LABELS: Record<PlacementTestStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};

function buildFilterHref(
  overrides: Record<string, string>,
  current: { status: string },
): string {
  const params = new URLSearchParams();
  if (current.status) params.set('status', current.status);
  Object.entries(overrides).forEach(([k, v]) =>
    v ? params.set(k, v) : params.delete(k),
  );
  params.set('page', '1');
  return `?${params.toString()}`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function truncateId(id: string): string {
  return id ? `…${id.slice(-8)}` : '—';
}

export function AdminPlacementTestsList({
  tests,
  total,
  page,
  totalPages,
  filterStatus,
}: AdminPlacementTestsListProps) {
  const router = useRouter();

  const STATUSES: PlacementTestStatus[] = ['draft', 'published', 'archived'];

  return (
    <div>
      {/* Status filter */}
      <div className="admin-filter-row" role="group" aria-label="Filter by status">
        <button
          className={`filter-btn${!filterStatus ? ' active' : ''}`}
          onClick={() => router.push('?page=1')}
        >
          All ({total})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`filter-btn${filterStatus === s ? ' active' : ''}`}
            onClick={() => router.push(buildFilterHref({ status: s }, { status: filterStatus }))}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Tests table */}
      {tests.length === 0 ? (
        <p className="admin-empty-state">
          {filterStatus
            ? `No placement tests with status "${filterStatus}".`
            : 'No placement tests found.'}
        </p>
      ) : (
        <table className="admin-table" aria-label="Placement tests">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Status</th>
              <th scope="col">Sections</th>
              <th scope="col">Est. Minutes</th>
              <th scope="col">Created</th>
              <th scope="col">ID</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.id}>
                <td className="admin-table-primary">{test.title}</td>
                <td>
                  <span
                    className={`status-badge ${STATUS_BADGE_CLASSES[test.status] ?? 'status-draft'}`}
                  >
                    {STATUS_LABELS[test.status] ?? test.status}
                  </span>
                </td>
                <td>{test.totalSections}</td>
                <td>{test.estimatedMinutes} min</td>
                <td>{formatDate(test.createdAt)}</td>
                <td className="admin-table-mono">{truncateId(test.id)}</td>
                <td>
                  {test.status !== 'archived' && (
                    <Link
                      href={`/admin/placement/tests/${test.id}/status`}
                      className="admin-table-link"
                    >
                      Status →
                    </Link>
                  )}
                  {test.status === 'archived' && (
                    <span className="admin-table-none">Archived</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Pagination">
          <button
            className="btn-secondary"
            disabled={page <= 1}
            onClick={() =>
              router.push(
                buildFilterHref({ page: String(page - 1) }, { status: filterStatus }),
              )
            }
          >
            ← Previous
          </button>
          <span className="admin-pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={page >= totalPages}
            onClick={() =>
              router.push(
                buildFilterHref({ page: String(page + 1) }, { status: filterStatus }),
              )
            }
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
