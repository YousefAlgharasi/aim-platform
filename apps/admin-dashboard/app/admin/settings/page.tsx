import { cookies } from 'next/headers';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../../lib/auth';
import {
  fetchAdminRoles,
  type AdminRole,
} from '../../../lib/api/admin-roles-api';
import { AdminApiClientError } from '../../../lib/api';
import { AdminPageHeader } from '../../../components/layout';
import {
  AdminTable,
  AdminStatusBadge,
  AdminBadge,
  AdminDateCell,
  type AdminTableColumn,
} from '../../../components/common';
import { AdminApiErrorState } from '../../../components/error-handling';
import { AdminEmptyState } from '../../../components/layout';
import { AdminCard } from '../../../components/common';

const columns: AdminTableColumn<AdminRole>[] = [
  {
    key: 'name',
    header: 'Role',
    render: (role) => (
      <span style={{ fontWeight: 'var(--weight-medium)' as unknown as number }}>
        {role.name}
      </span>
    ),
  },
  {
    key: 'key',
    header: 'Key',
    width: '160px',
    render: (role) => (
      <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{role.key}</code>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    render: (role) =>
      role.description ?? <span style={{ color: 'var(--text-muted)' }}>—</span>,
  },
  {
    key: 'isSystem',
    header: 'Type',
    width: '100px',
    render: (role) => (
      <AdminBadge variant={role.isSystem ? 'neutral' : 'primary'}>
        {role.isSystem ? 'System' : 'Custom'}
      </AdminBadge>
    ),
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    width: '130px',
    render: (role) => <AdminDateCell iso={role.updatedAt} />,
  },
];

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE)?.value.trim() ?? '';

  let roles: AdminRole[] = [];
  let fetchError: string | null = null;

  try {
    const data = await fetchAdminRoles(token);
    roles = data.roles;
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load settings. Check backend connectivity.';
  }

  return (
    <section>
      <AdminPageHeader
        eyebrow="Administration"
        title="Settings"
        description="System roles and configuration managed by the backend."
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-24)' }}>
        Role changes and permission management are enforced by the Backend API.
        Environment values exposed to the browser are non-secret only.
      </p>

      <h3 style={{
        fontSize: 16,
        fontWeight: 'var(--weight-semibold)' as unknown as number,
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-16)',
      }}>
        Roles &amp; Permissions
      </h3>

      {fetchError && <AdminApiErrorState message={fetchError} />}

      {!fetchError && roles.length === 0 && (
        <AdminEmptyState
          title="No roles configured"
          description="Roles are defined and managed by the backend."
        />
      )}

      {roles.length > 0 && (
        <AdminTable<AdminRole>
          columns={columns}
          rows={roles}
          getRowKey={(r) => r.id}
          caption="System roles"
        />
      )}
    </section>
  );
}
