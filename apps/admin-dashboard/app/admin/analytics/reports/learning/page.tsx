import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
  type AdminReportDefinition,
} from '../../../../../lib/api/admin-analytics-reports-api';
import { ReportRunnerPanel } from '../../_components/report-runner-panel';
import { runLearningReport, pollLearningReportRunStatus } from './actions';

const BASE_PATH = '/admin/analytics/reports/learning';

export default async function AdminLearningReportsPage() {
  const token = await getAdminToken();

  let definitions: readonly AdminReportDefinition[] = [];
  let fetchError: string | null = null;

  try {
    definitions = await fetchAdminReportDefinitions(token, BASE_PATH);
  } catch {
    fetchError = 'Could not load learning report definitions. The report definitions may not be configured yet.';
  }

  return (
    <section className="lr-page">
      <div className="lr-header">
        <div>
          <p className="lr-eyebrow">Analytics</p>
          <h1 className="lr-title">Learning Reports</h1>
          <p className="lr-subtitle">Skills, progress, retention, and engagement reports.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {!fetchError && (
        <ReportRunnerPanel
          definitions={definitions}
          runReport={runLearningReport}
          pollRunStatus={pollLearningReportRunStatus}
        />
      )}

      <style>{`
        .lr-page { display: flex; flex-direction: column; gap: 20px; }
        .lr-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .lr-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .lr-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .lr-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
