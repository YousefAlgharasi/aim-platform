import { getAdminToken } from '../../../lib/api/admin-token';
import { AdminApiClientError } from '../../../lib/api';
import {
  fetchEnrollmentReport,
  fetchAssessmentReport,
  fetchActiveUsersReport,
  type AdminEnrollmentReport,
  type AdminAssessmentReport,
  type AdminActiveUsersReport,
} from '../../../lib/api/admin-reports-api';
import { ReportsClient } from './reports-client';

export default async function AdminReportsPage() {
  const token = await getAdminToken();

  let enrollment: AdminEnrollmentReport | null = null;
  let assessment: AdminAssessmentReport | null = null;
  let activeUsers: AdminActiveUsersReport | null = null;
  let fetchError: string | null = null;

  try {
    [enrollment, assessment, activeUsers] = await Promise.all([
      fetchEnrollmentReport(token),
      fetchAssessmentReport(token),
      fetchActiveUsersReport(token),
    ]);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load reports.';
  }

  return (
    <section className="admin-curriculum-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Reports</p>
        <h1>Operational Reports</h1>
      </header>

      {/* admin-boundary-note */}
      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> All report metrics (counts, averages, active users)
        are computed by the backend only. This view displays backend-approved summaries.
        Full analytics dashboards are planned for Phase 15.
      </div>

      {fetchError && (
        <p className="admin-error-banner" role="alert">{fetchError}</p>
      )}

      {enrollment && assessment && activeUsers && (
        <ReportsClient
          enrollment={enrollment}
          assessment={assessment}
          activeUsers={activeUsers}
        />
      )}
    </section>
  );
}
