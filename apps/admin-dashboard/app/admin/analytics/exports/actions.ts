'use server';

import { getAdminToken } from '../../../../lib/api/admin-token';
import {
  requestExport,
  fetchExportStatus,
  type AdminExportJob,
  type ExportType,
} from '../../../../lib/api/admin-analytics-exports-api';

export async function createExportAction(reportRunId: string, exportType: ExportType): Promise<AdminExportJob> {
  const token = await getAdminToken();
  return requestExport(token, reportRunId, exportType);
}

export async function pollExportStatusAction(exportJobId: string): Promise<AdminExportJob> {
  const token = await getAdminToken();
  return fetchExportStatus(token, exportJobId);
}
