'use client';

import {
  AdminCard,
  AdminTable,
  AdminBadge,
  AdminIdCell,
  AdminDateCell,
} from '../../../../../../components/common';
import type { AdminTableColumn } from '../../../../../../components/common';
import type {
  AdminWeaknessItem,
  AdminRecommendationItem,
} from '../../../../../../lib/api/admin-aim-data-api';

type Props = {
  readonly weaknesses: readonly AdminWeaknessItem[];
  readonly recommendations: readonly AdminRecommendationItem[];
};

const SEVERITY_VARIANT: Record<string, 'error' | 'warning' | 'info' | 'neutral'> = {
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const weaknessColumns: AdminTableColumn<AdminWeaknessItem>[] = [
  {
    key: 'skillId',
    header: 'Skill ID',
    render: (row) => <AdminIdCell id={row.skillId} />,
  },
  {
    key: 'skillKey',
    header: 'Skill Key',
    render: (row) => <code style={{ fontSize: '13px' }}>{row.skillKey}</code>,
  },
  {
    key: 'severity',
    header: 'Severity',
    render: (row) => (
      <AdminBadge variant={SEVERITY_VARIANT[row.severity] ?? 'neutral'}>
        {row.severity}
      </AdminBadge>
    ),
  },
  {
    key: 'detectedAt',
    header: 'Detected',
    render: (row) => <AdminDateCell date={row.detectedAt} />,
  },
];

const recommendationColumns: AdminTableColumn<AdminRecommendationItem>[] = [
  {
    key: 'type',
    header: 'Type',
    render: (row) => (
      <AdminBadge variant="info">{row.type.replace(/_/g, ' ')}</AdminBadge>
    ),
  },
  {
    key: 'entityId',
    header: 'Entity ID',
    render: (row) => <AdminIdCell id={row.entityId} />,
  },
  {
    key: 'reason',
    header: 'Reason',
    render: (row) => <span style={{ fontSize: '13px' }}>{row.reason}</span>,
  },
  {
    key: 'generatedAt',
    header: 'Generated',
    render: (row) => <AdminDateCell date={row.generatedAt} />,
  },
];

export function WeaknessesRecommendationsClient({ weaknesses, recommendations }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <AdminCard
        title="Weaknesses"
        description={`${weaknesses.length} weakness${weaknesses.length !== 1 ? 'es' : ''} detected by AIM Engine`}
      >
        {weaknesses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No weaknesses detected.</p>
        ) : (
          <AdminTable
            columns={weaknessColumns}
            rows={weaknesses as AdminWeaknessItem[]}
            getRowKey={(row) => row.skillId}
            caption="Student weaknesses (AIM Engine output)"
          />
        )}
      </AdminCard>

      <AdminCard
        title="Recommendations"
        description={`${recommendations.length} recommendation${recommendations.length !== 1 ? 's' : ''} from AIM Engine`}
      >
        {recommendations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No recommendations generated.</p>
        ) : (
          <AdminTable
            columns={recommendationColumns}
            rows={recommendations as AdminRecommendationItem[]}
            getRowKey={(row) => `${row.type}-${row.entityId}`}
            caption="AIM Engine recommendations"
          />
        )}
      </AdminCard>
    </div>
  );
}
