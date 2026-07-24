'use server';

import { getAdminToken } from '../../../../../core/api/admin-token';
import { requireAdminServerActionAuth } from '../../../../../core/auth';
import {
  runAdminReport,
  fetchAdminReportRunStatus,
  type AdminReportRun,
} from '../../../../../features/analytics/api/admin-analytics-reports-api';

const BASE_PATH = '/admin/analytics/reports/assessment';

export async function runAssessmentReport(reportKey: string): Promise<AdminReportRun> {
  await requireAdminServerActionAuth();
  const token = await getAdminToken();
  return runAdminReport(token, BASE_PATH, reportKey);
}

export async function pollAssessmentReportRunStatus(runId: string): Promise<AdminReportRun> {
  await requireAdminServerActionAuth();
  const token = await getAdminToken();
  return fetchAdminReportRunStatus(token, BASE_PATH, runId);
}

