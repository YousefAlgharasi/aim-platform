import Link from 'next/link';
import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
  AdminApiClientError,
  type AdminReportDefinition,
} from '../../../../../lib/api/admin-analytics-reports-api';
import { ReportRunnerPanel } from '../../_components/report-runner-panel';
import { runRevenueReport, pollRevenueReportRunStatus } from './actions';

const BASE_PATH = '/admin/analytics/reports/revenue';

export default async function AdminRevenueReportsPage() {
  const token = await getAdminToken();

  let definitions: readonly AdminReportDefinition[] = [];
  let fetchError: string | null = null;

  try {
    definitions = await fetchAdminReportDefinitions(token, BASE_PATH);
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status ?? ''}: ${error.message}`
      : 'Failed to load revenue report definitions.';
  }

  return (
    <section className="rv-page">
      <nav className="rv-breadcrumb">
        <Link href="/admin/analytics" className="rv-breadcrumb-link">Analytics</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="rv-breadcrumb-current">Revenue Reports</span>
      </nav>

      <div className="rv-header">
        <div>
          <p className="rv-eyebrow">Analytics</p>
          <h1 className="rv-title">Revenue Reports</h1>
          <p className="rv-subtitle">Revenue reports from safe billing aggregates.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {!fetchError && (
        <ReportRunnerPanel
          definitions={definitions}
          runReport={runRevenueReport}
          pollRunStatus={pollRevenueReportRunStatus}
        />
      )}

      <style>{`
        .rv-page { display: flex; flex-direction: column; gap: 20px; }
        .rv-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .rv-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .rv-breadcrumb-link:hover { text-decoration: underline; }
        .rv-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .rv-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .rv-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .rv-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .rv-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
