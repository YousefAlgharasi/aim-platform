'use server';

import { getAdminToken } from '../../../../../lib/api/admin-token';
import {
  runAdminReport,
  fetchAdminReportRunStatus,
  type AdminReportRun,
} from '../../../../../lib/api/admin-analytics-reports-api';

const BASE_PATH = '/admin/analytics/reports/revenue';

export async function runRevenueReport(reportKey: string): Promise<AdminReportRun> {
  const token = await getAdminToken();
  return runAdminReport(token, BASE_PATH, reportKey);
}

export async function pollRevenueReportRunStatus(runId: string): Promise<AdminReportRun> {
  const token = await getAdminToken();
  return fetchAdminReportRunStatus(token, BASE_PATH, runId);
}
