import Link from 'next/link';
import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
  AdminApiClientError,
  type AdminReportDefinition,
} from '../../../../../lib/api/admin-analytics-reports-api';
import { ReportRunnerPanel } from '../../_components/report-runner-panel';
import { runCurriculumReport, pollCurriculumReportRunStatus } from './actions';

const BASE_PATH = '/admin/analytics/reports/curriculum';

export default async function AdminCurriculumReportsPage() {
  const token = await getAdminToken();

  let definitions: readonly AdminReportDefinition[] = [];
  let fetchError: string | null = null;

  try {
    definitions = await fetchAdminReportDefinitions(token, BASE_PATH);
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status ?? ''}: ${error.message}`
      : 'Failed to load curriculum report definitions.';
  }

  return (
    <section className="cr-page">
      <nav className="cr-breadcrumb">
        <Link href="/admin/analytics" className="cr-breadcrumb-link">Analytics</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="cr-breadcrumb-current">Curriculum Reports</span>
      </nav>

      <div className="cr-header">
        <div>
          <p className="cr-eyebrow">Analytics</p>
          <h1 className="cr-title">Curriculum Reports</h1>
          <p className="cr-subtitle">Curriculum coverage and content usage reports.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {!fetchError && (
        <ReportRunnerPanel
          definitions={definitions}
          runReport={runCurriculumReport}
          pollRunStatus={pollCurriculumReportRunStatus}
        />
      )}

      <style>{`
        .cr-page { display: flex; flex-direction: column; gap: 20px; }
        .cr-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .cr-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .cr-breadcrumb-link:hover { text-decoration: underline; }
        .cr-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .cr-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .cr-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .cr-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .cr-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
