import Link from 'next/link';
import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
  AdminApiClientError,
  type AdminReportDefinition,
} from '../../../../../lib/api/admin-analytics-reports-api';
import { ReportRunnerPanel } from '../../_components/report-runner-panel';
import { runUserReport, pollUserReportRunStatus } from './actions';

const BASE_PATH = '/admin/analytics/reports/users';

export default async function AdminUserReportsPage() {
  const token = await getAdminToken();

  let definitions: readonly AdminReportDefinition[] = [];
  let fetchError: string | null = null;

  try {
    definitions = await fetchAdminReportDefinitions(token, BASE_PATH);
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status ?? ''}: ${error.message}`
      : 'Failed to load user report definitions.';
  }

  return (
    <section className="ur-page">
      <nav className="ur-breadcrumb">
        <Link href="/admin/analytics" className="ur-breadcrumb-link">Analytics</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="ur-breadcrumb-current">User Reports</span>
      </nav>

      <div className="ur-header">
        <div>
          <p className="ur-eyebrow">Analytics</p>
          <h1 className="ur-title">User Reports</h1>
          <p className="ur-subtitle">User growth, activation, and role distribution reports.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {!fetchError && (
        <ReportRunnerPanel
          definitions={definitions}
          runReport={runUserReport}
          pollRunStatus={pollUserReportRunStatus}
        />
      )}

      <style>{`
        .ur-page { display: flex; flex-direction: column; gap: 20px; }
        .ur-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .ur-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .ur-breadcrumb-link:hover { text-decoration: underline; }
        .ur-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .ur-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ur-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ur-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ur-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
