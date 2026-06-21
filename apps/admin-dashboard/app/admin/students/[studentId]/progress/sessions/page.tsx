import Link from 'next/link';
import { getAdminToken } from '../../../../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../../../../lib/api';
import { fetchAdminSessionSummaries } from '../../../../../../lib/api/admin-logs-api';
import { SessionSummaryClient } from './session-summary-client';

type Props = {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function SessionSummaryPage({ params, searchParams }: Props) {
  const { studentId } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? '1', 10) || 1;
  const token = await getAdminToken();

  let sessions = null;
  let fetchError: string | null = null;

  try {
    sessions = await fetchAdminSessionSummaries(token, page, 20, studentId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load session summaries.';
  }

  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/students">Students</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/students/${studentId}/progress`}>{studentId}</Link>
        <span aria-hidden="true">/</span>
        <span>Sessions</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Session History</p>
        <h1>Learning Sessions</h1>
        {sessions && (
          <p className="admin-page-meta">{sessions.total} session{sessions.total !== 1 ? 's' : ''}</p>
        )}
      </header>

      {/* admin-boundary-note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> Session data and feedback summaries are
        backend-managed. This view is read-only.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {sessions && (
        <SessionSummaryClient
          sessions={sessions.data as { id: string; studentId: string; startedAt: string; endedAt: string | null; feedbackSummary: string | null }[]}
          total={sessions.total}
          page={sessions.page}
          totalPages={Math.ceil(sessions.total / sessions.limit)}
        />
      )}
    </section>
  );
}
