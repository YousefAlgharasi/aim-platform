'use client';

import {
  AdminTable,
  AdminBadge,
  AdminIdCell,
  AdminDateCell,
} from '../../../../../../components/common';
import type { AdminTableColumn } from '../../../../../../components/common';
import type { AdminSkillStateItem } from '../../../../../../lib/api/admin-aim-data-api';

type Props = {
  readonly skills: readonly AdminSkillStateItem[];
};

const STATE_VARIANT: Record<string, 'success' | 'warning' | 'neutral' | 'info'> = {
  mastered: 'success',
  learning: 'info',
  struggling: 'warning',
  not_started: 'neutral',
};

const columns: AdminTableColumn<AdminSkillStateItem>[] = [
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
    key: 'masteryLevel',
    header: 'Mastery Level',
    render: (row) => (
      <span style={{ fontWeight: 'var(--weight-semibold)' }}>{row.masteryLevel}</span>
    ),
  },
  {
    key: 'state',
    header: 'State',
    render: (row) => (
      <AdminBadge variant={STATE_VARIANT[row.state] ?? 'neutral'}>
        {row.state.replace(/_/g, ' ')}
      </AdminBadge>
    ),
  },
  {
    key: 'lastUpdatedAt',
    header: 'Last Updated',
    render: (row) => <AdminDateCell date={row.lastUpdatedAt} />,
  },
];

export function SkillStateClient({ skills }: Props) {
  if (skills.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No skill states recorded for this student.</p>;
  }

  return (
    <AdminTable
      columns={columns}
      rows={skills as AdminSkillStateItem[]}
      getRowKey={(row) => row.skillId}
      caption="Student skill mastery states (backend-computed)"
    />
  );
}
