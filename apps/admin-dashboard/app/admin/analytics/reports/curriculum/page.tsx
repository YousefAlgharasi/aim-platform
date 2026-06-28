import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
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
  } catch {
    fetchError = 'Could not load curriculum report definitions. The report definitions may not be configured yet.';
  }

  return (
    <section className="cr-page">
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
        .cr-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .cr-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .cr-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .cr-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
