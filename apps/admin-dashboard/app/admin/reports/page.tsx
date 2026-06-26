import Link from 'next/link';
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
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status}: ${error.message}` : 'Failed to load reports.';
  }

  return (
    <section className="rp-page">
      <nav className="rp-breadcrumb">
        <span className="rp-breadcrumb-current">Reports</span>
      </nav>

      <div className="rp-header">
        <div>
          <p className="rp-eyebrow">Reports</p>
          <h1 className="rp-title">Operational Reports</h1>
          <p className="rp-subtitle">Backend-computed enrollment, assessment, and user activity summaries.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {enrollment && assessment && activeUsers && (
        <ReportsClient
          enrollment={enrollment}
          assessment={assessment}
          activeUsers={activeUsers}
        />
      )}

      <style>{`
        .rp-page { display: flex; flex-direction: column; gap: 20px; }
        .rp-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .rp-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .rp-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .rp-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .rp-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .rp-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
