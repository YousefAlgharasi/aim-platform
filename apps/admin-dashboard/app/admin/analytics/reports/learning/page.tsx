import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  fetchAdminReportDefinitions,
  AdminApiClientError,
  type AdminReportDefinition,
} from '../../../../../lib/api/admin-analytics-reports-api';
import { AdminReportPageLayout } from '../../../../../components/analytics';
import { AdminReportRunnerPanel } from '../../../../../components/analytics/admin-report-runner-panel';
import { runLearningReport, pollLearningReportRunStatus } from './actions';

const BASE_PATH = '/admin/analytics/reports/learning';

export default async function AdminLearningReportsPage() {
  const token = await getAdminToken();

  let definitions: readonly AdminReportDefinition[] = [];
  let fetchError: string | null = null;

  try {
    definitions = await fetchAdminReportDefinitions(token, BASE_PATH);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status ?? ''}: ${error.message}`
        : 'Failed to load learning report definitions. Check backend connectivity.';
  }

  return (
    <AdminReportPageLayout
      title="Learning Reports"
      description="Skills, progress, retention, and engagement reports."
      boundaryNote="Report output is assembled by ReportRunnerService only. The UI never computes learning metrics locally."
    >
      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {!fetchError && (
        <AdminReportRunnerPanel
          basePath={BASE_PATH}
          definitions={definitions}
          runReport={runLearningReport}
          pollRunStatus={pollLearningReportRunStatus}
        />
      )}
    </AdminReportPageLayout>
  );
}
