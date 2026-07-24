import { getAdminToken } from '../../../core/api/admin-token';
import { AdminApiClientError } from '../../../core/api';
import { fetchAdminActivityLogs } from '../../../core/api/admin-logs-api';
import { ActivityLogClient } from '../../../features/logs';
import { AdminPageHeader, AdminErrorBanner } from '../../../shared/layouts/DashboardLayout';

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
    <section className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        eyebrow="Admin — Activity"
        title="Activity Logs"
        description={logs ? `${logs.total} log entr${logs.total !== 1 ? 'ies' : 'y'}` : undefined}
      />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-sunken)] p-4 text-xs text-[var(--text-secondary)] shadow-xs">
        <strong className="text-[var(--text-primary)] font-semibold">Read-only:</strong> Activity logs are recorded server-side by the backend.
        This view displays safe event metadata only — no raw learner data or AI provider responses.
      </div>

      {fetchError && <AdminErrorBanner message={fetchError} />}

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
