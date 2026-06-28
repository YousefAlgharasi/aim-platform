import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
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
  } catch {
    fetchError = 'Could not load user report definitions. The report definitions may not be configured yet.';
  }

  return (
    <section className="ur-page">
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
        .ur-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ur-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ur-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ur-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
