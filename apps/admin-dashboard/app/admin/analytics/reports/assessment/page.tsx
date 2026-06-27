import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
  type AdminReportDefinition,
} from '../../../../../lib/api/admin-analytics-reports-api';
import { ReportRunnerPanel } from '../../_components/report-runner-panel';
import { runAssessmentReport, pollAssessmentReportRunStatus } from './actions';

const BASE_PATH = '/admin/analytics/reports/assessment';

export default async function AdminAssessmentReportsPage() {
  const token = await getAdminToken();

  let definitions: readonly AdminReportDefinition[] = [];
  let fetchError: string | null = null;

  try {
    definitions = await fetchAdminReportDefinitions(token, BASE_PATH);
  } catch {
    fetchError = 'Could not load assessment report definitions. The report definitions may not be configured yet.';
  }

  return (
    <section className="ar-page">
      <div className="ar-header">
        <div>
          <p className="ar-eyebrow">Analytics</p>
          <h1 className="ar-title">Assessment Reports</h1>
          <p className="ar-subtitle">Quizzes, exams, attempts, deadlines, and results.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {!fetchError && (
        <ReportRunnerPanel
          definitions={definitions}
          runReport={runAssessmentReport}
          pollRunStatus={pollAssessmentReportRunStatus}
        />
      )}

      <style>{`
        .ar-page { display: flex; flex-direction: column; gap: 20px; }
        .ar-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ar-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ar-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ar-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
