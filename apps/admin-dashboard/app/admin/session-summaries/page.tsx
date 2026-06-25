import { getAdminToken } from '../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../lib/api';
import { fetchAdminSessionSummaries } from '../../../lib/api/admin-logs-api';
import { SessionSummaryClient } from './session-summary-client';

type Props = {
  searchParams: Promise<{ page?: string; studentId?: string }>;
};

export default async function AdminSessionSummariesPage({ searchParams }: Props) {
  const { page: pageParam, studentId } = await searchParams;
  const page = parseInt(pageParam ?? '1', 10) || 1;
  const token = await getAdminToken();

  let summaries = null;
  let fetchError: string | null = null;

  try {
    summaries = await fetchAdminSessionSummaries(token, page, 20, studentId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load session summaries.';
  }

  return (
    <section className="admin-curriculum-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Sessions</p>
        <h1>Session Summaries</h1>
        {summaries && (
          <p className="admin-page-meta">{summaries.total} session{summaries.total !== 1 ? 's' : ''}</p>
        )}
      </header>

      <div className="admin-boundary-note">
        <strong>Read-only:</strong> Session summaries are generated server-side.
        This view displays safe metadata only.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {summaries && (
        <SessionSummaryClient
          summaries={summaries.data as { id: string; studentId: string; startedAt: string; endedAt: string | null; feedbackSummary: string | null }[]}
          total={summaries.total}
          page={summaries.page}
          totalPages={Math.ceil(summaries.total / summaries.limit)}
          filterStudentId={studentId ?? ''}
        />
      )}
    </section>
  );
}
