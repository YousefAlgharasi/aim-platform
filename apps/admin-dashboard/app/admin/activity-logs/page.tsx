import { getAdminToken } from '../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../lib/api';
import { fetchAdminActivityLogs } from '../../../lib/api/admin-logs-api';
import { ActivityLogClient } from './activity-log-client';

type Props = {
  searchParams: Promise<{ page?: string; userId?: string; eventType?: string }>;
};

export default async function AdminActivityLogsPage({ searchParams }: Props) {
  const { page: pageParam, userId, eventType } = await searchParams;
  const page = parseInt(pageParam ?? '1', 10) || 1;
  const token = await getAdminToken();

  let logs = null;
  let fetchError: string | null = null;

  try {
    logs = await fetchAdminActivityLogs(token, page, 20, {
      ...(userId ? { userId } : {}),
      ...(eventType ? { eventType } : {}),
    });
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load activity logs.';
  }

  return (
    <section className="admin-curriculum-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Activity</p>
        <h1>Activity Logs</h1>
        {logs && (
          <p className="admin-page-meta">{logs.total} log entr{logs.total !== 1 ? 'ies' : 'y'}</p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Read-only:</strong> Activity logs are recorded server-side by the backend.
        This view displays safe event metadata only — no raw learner data or AI provider responses.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {logs && (
        <ActivityLogClient
          logs={logs.data as { id: string; userId: string; eventType: string; createdAt: string }[]}
          total={logs.total}
          page={logs.page}
          totalPages={Math.ceil(logs.total / logs.limit)}
          filterUserId={userId ?? ''}
          filterEventType={eventType ?? ''}
        />
      )}
    </section>
  );
}
