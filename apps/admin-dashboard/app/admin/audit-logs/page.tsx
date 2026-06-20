import { getAdminToken } from '../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../lib/api';
import { fetchAdminAuditLogs } from '../../../lib/api/admin-logs-api';
import { AuditLogClient } from './audit-log-client';

type Props = {
  searchParams: Promise<{ page?: string; userId?: string; action?: string }>;
};

export default async function AdminAuditLogsPage({ searchParams }: Props) {
  const { page: pageParam, userId, action } = await searchParams;
  const page = parseInt(pageParam ?? '1', 10) || 1;
  const token = await getAdminToken();

  let logs = null;
  let fetchError: string | null = null;

  try {
    logs = await fetchAdminAuditLogs(token, page, 20, {
      ...(userId ? { userId } : {}),
      ...(action ? { action } : {}),
    });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load audit logs.';
  }

  return (
    <section className="admin-curriculum-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Audit</p>
        <h1>AIM Audit Logs</h1>
        {logs && (
          <p className="admin-page-meta">{logs.total} log entr{logs.total !== 1 ? 'ies' : 'y'}</p>
        )}
      </header>

      {/* admin-boundary-note */}
      <div className="admin-boundary-note">
        <strong>Read-only:</strong> Audit logs are written server-side by the backend API.
        This view displays safe metadata only — no raw learner data or AI provider responses.
        Logs are append-only and cannot be edited from this surface.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {logs && (
        <AuditLogClient
          logs={logs.data as { id: string; userId: string; action: string; entityType: string | null; entityId: string | null; createdAt: string }[]}
          total={logs.total}
          page={logs.page}
          totalPages={Math.ceil(logs.total / logs.limit)}
          filterUserId={userId ?? ''}
          filterAction={action ?? ''}
        />
      )}
    </section>
  );
}
