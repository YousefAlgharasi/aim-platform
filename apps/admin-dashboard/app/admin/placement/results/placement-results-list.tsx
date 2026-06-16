'use client';

// Phase 4 — P4-059
// AdminPlacementResultsList — client component.
//
// Scope: Placement Test phase only — admin inspection of placement outcomes.
//
// Security rules:
// - All data is fetched server-side (page.tsx) and passed as props.
// - No placement scoring, raw mastery values, or CEFR thresholds are computed here.
// - estimatedLevel is displayed as-is from the backend; never recalculated.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.

import { useRouter } from 'next/navigation';
import type {
  AdminPlacementResultSummary,
  SkillSignal,
} from '../../../../lib/api/admin-placement-results-api';

type AdminPlacementResultsListProps = {
  readonly results: AdminPlacementResultSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterLevel: string;
};

const LEVEL_BADGE_CLASSES: Record<string, string> = {
  A1: 'status-draft',
  A2: 'status-draft',
  B1: 'status-published',
  B2: 'status-published',
  C1: 'domain-reading',
  C2: 'domain-reading',
};

const SIGNAL_BADGE_CLASSES: Record<SkillSignal, string> = {
  strong: 'status-published',
  developing: 'status-draft',
  emerging: 'domain-grammar',
};

function buildFilterHref(overrides: Record<string, string>, current: { level: string }) {
  const params = new URLSearchParams();
  if (current.level) params.set('level', current.level);
  Object.entries(overrides).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
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

export function AdminPlacementResultsList({
  results,
  total,
  page,
  totalPages,
  filterLevel,
}: AdminPlacementResultsListProps) {
  const router = useRouter();

  const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div>
      {/* Toolbar */}
      <div className="qb-toolbar">
        <div className="qb-filters">
          <select
            value={filterLevel}
            onChange={(e) =>
              router.push(buildFilterHref({ level: e.target.value }, { level: filterLevel }))
            }
            aria-label="Filter by estimated level"
          >
            <option value="">All Levels</option>
            {CEFR_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results table */}
      {results.length === 0 ? (
        <p className="courses-empty">No placement results match the current filters.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Result ID</th>
              <th>Student ID</th>
              <th>
                Estimated Level
                <span
                  className="admin-boundary-note"
                  style={{ display: 'inline', marginLeft: 8, fontSize: '0.75rem' }}
                  title="Assigned by backend only — never recalculated here"
                >
                  (backend-assigned)
                </span>
              </th>
              <th>Initial Path</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.resultId}>
                <td>
                  <code className="qb-tag" title={r.resultId}>
                    {truncateId(r.resultId)}
                  </code>
                </td>
                <td>
                  <code className="qb-tag" title={r.studentId}>
                    {truncateId(r.studentId)}
                  </code>
                </td>
                <td>
                  <span
                    className={`status-badge ${LEVEL_BADGE_CLASSES[r.estimatedLevel] ?? 'status-draft'}`}
                  >
                    {r.estimatedLevel}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${r.initialPathReady ? 'status-published' : 'status-draft'}`}
                  >
                    {r.initialPathReady ? 'Ready' : 'Pending'}
                  </span>
                </td>
                <td className="course-date-cell">{formatDate(r.completedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Placement results pagination">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="pagination-link">
              ← Previous
            </a>
          )}
          <span className="pagination-info">
            Page {page} of {totalPages} ({total} total)
          </span>
          {page < totalPages && (
            <a href={`?page=${page + 1}`} className="pagination-link">
              Next →
            </a>
          )}
        </nav>
      )}
    </div>
  );
}
