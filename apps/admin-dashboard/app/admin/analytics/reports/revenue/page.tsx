import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
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
  } catch {
    fetchError = 'Could not load revenue report definitions. The report definitions may not be configured yet.';
  }

  return (
    <section className="rv-page">
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
        .rv-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .rv-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .rv-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .rv-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
