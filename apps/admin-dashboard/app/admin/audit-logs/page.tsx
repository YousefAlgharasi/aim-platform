import { getAdminToken } from '../../../core/api/admin-token';
import { AdminApiClientError } from '../../../core/api';
import { fetchAdminAuditLogs } from '../../../core/api/admin-logs-api';
import { AuditLogClient } from '../../../features/logs';

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
        <h1>Admin Actions Log</h1>
        {logs && (
          <p className="admin-page-meta">{logs.total} log entr{logs.total !== 1 ? 'ies' : 'y'}</p>
        )}
      </header>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {logs && (
        <AuditLogClient
          logs={logs.data as { id: string; userId: string; userName: string | null; action: string; entityType: string | null; entityId: string | null; category: string; createdAt: string }[]}
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
