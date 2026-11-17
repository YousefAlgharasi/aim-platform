'use client';

import { useRouter } from 'next/navigation';
import {
  AdminTable,
  AdminBadge,
  AdminPagination,
  AdminIdCell,
  AdminDateCell,
  AdminFilterBar,
  AdminSelect,
} from '../../../shared/components/Misc';
import type { AdminTableColumn } from '../../../shared/components/Misc';
import type { AdminPlacementResultSummary, SkillSignal } from '../../../core/api/admin-placement-results-api';

type Props = {
  readonly results: readonly AdminPlacementResultSummary[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly filterLevel: string;
};

// Matches the placement_results.estimated_level CHECK constraint (backend-owned).
const ESTIMATED_LEVELS = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced'];

const LEVEL_VARIANT: Record<string, 'info' | 'primary' | 'success'> = {
  beginner: 'info',
  elementary: 'info',
  intermediate: 'primary',
  upper_intermediate: 'primary',
  advanced: 'success',
};

function formatLevelLabel(level: string): string {
  return level
    .split('_')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

const SIGNAL_VARIANT: Record<SkillSignal, 'success' | 'primary' | 'warning'> = {
  strong: 'success',
  developing: 'primary',
  emerging: 'warning',
};

const SIX_SKILLS: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'grammar', label: 'Grammar' },
  { code: 'vocabulary', label: 'Vocabulary' },
  { code: 'reading', label: 'Reading' },
  { code: 'listening', label: 'Listening' },
  { code: 'writing', label: 'Writing' },
  { code: 'speaking', label: 'Speaking' },
];

function percentFor(row: AdminPlacementResultSummary, code: string): number | null {
  return row.skillScores.find((s) => s.skillCode === code)?.percent ?? null;
}

const skillColumns: AdminTableColumn<AdminPlacementResultSummary>[] = SIX_SKILLS.map(({ code, label }) => ({
  key: `score-${code}`,
  header: label,
  render: (row: AdminPlacementResultSummary) => {
    const p = percentFor(row, code);
    return p === null ? <span style={{ color: 'var(--text-muted)' }}>—</span> : <span>{p}%</span>;
  },
}));

const columns: AdminTableColumn<AdminPlacementResultSummary>[] = [
  {
    key: 'studentName',
    header: 'Student',
    render: (row) =>
      row.studentName ? (
        <span>{row.studentName}</span>
      ) : (
        <AdminIdCell id={row.studentId} />
      ),
  },
  {
    key: 'estimatedLevel',
    header: 'Estimated Level',
    render: (row) => (
      <AdminBadge variant={LEVEL_VARIANT[row.estimatedLevel] ?? 'neutral'}>
        {formatLevelLabel(row.estimatedLevel)}
      </AdminBadge>
    ),
  },
  {
    key: 'overallPercent',
    header: 'Overall (6 skills)',
    render: (row) =>
      row.overallPercent === null ? (
        <span style={{ color: 'var(--text-muted)' }}>—</span>
      ) : (
        <strong>{row.overallPercent}%</strong>
      ),
  },
  ...skillColumns,
  {
    key: 'initialPathReady',
    header: 'Initial Path',
    render: (row) => (
      <AdminBadge variant={row.initialPathReady ? 'success' : 'warning'}>
        {row.initialPathReady ? 'Ready' : 'Pending'}
      </AdminBadge>
    ),
  },
  {
    key: 'completedAt',
    header: 'Completed',
    render: (row) => <AdminDateCell date={row.completedAt} />,
  },
];

export function AdminPlacementResultsList({
  results,
  total,
  page,
  totalPages,
  filterLevel,
}: Props) {
  const router = useRouter();

  const setLevel = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set('level', value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <AdminFilterBar
        label="Filter placement results"
        selectFilters={[
          {
            key: 'level',
            value: filterLevel,
            onChange: (val) => setLevel(val),
            placeholder: 'All Levels',
            options: ESTIMATED_LEVELS.map((l) => ({ label: formatLevelLabel(l), value: l })),
          },
        ]}
        onClearAll={filterLevel ? () => setLevel('') : undefined}
      />

      {results.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          No placement results match the current filters.
        </p>
      ) : (
        <>
          <AdminTable
            columns={columns}
            rows={results as AdminPlacementResultSummary[]}
            getRowKey={(row) => row.resultId}
            caption={`${total} placement results — estimated level is backend-assigned`}
          />
          {totalPages > 1 && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => {
                const params = new URLSearchParams();
                if (filterLevel) params.set('level', filterLevel);
                params.set('page', String(p));
                return `?${params.toString()}`;
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
