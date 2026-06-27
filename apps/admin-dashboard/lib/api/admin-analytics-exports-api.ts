import { adminApiClient } from './admin-api-client';

export type ExportType = 'csv' | 'json' | 'pdf';
export type ExportStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type AdminExportJob = {
  readonly id: string;
  readonly reportRunId: string;
  readonly exportType: ExportType;
  readonly status: ExportStatus;
  readonly requestedByUserId: string;
  readonly fileRef: string | null;
  readonly errorMessage: string | null;
  readonly createdAt: string;
  readonly completedAt: string | null;
};

function decodeExportJob(v: unknown): AdminExportJob {
  const o = v as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    reportRunId: String(o.reportRunId ?? ''),
    exportType: (o.exportType ?? 'csv') as ExportType,
    status: (o.status ?? 'queued') as ExportStatus,
    requestedByUserId: String(o.requestedByUserId ?? ''),
    fileRef: typeof o.fileRef === 'string' ? o.fileRef : null,
    errorMessage: typeof o.errorMessage === 'string' ? o.errorMessage : null,
    createdAt: String(o.createdAt ?? ''),
    completedAt: typeof o.completedAt === 'string' ? o.completedAt : null,
  };
}

export async function requestExport(
  token: string,
  reportRunId: string,
  exportType: ExportType,
): Promise<AdminExportJob> {
  const envelope = await adminApiClient.post('/analytics/exports', decodeExportJob, {
    headers: { authorization: `Bearer ${token}` },
    body: { reportRunId, exportType },
  });
  return envelope.data;
}

export async function fetchExportStatus(
  token: string,
  exportJobId: string,
): Promise<AdminExportJob> {
  const envelope = await adminApiClient.get(
    `/analytics/exports/${encodeURIComponent(exportJobId)}`,
    decodeExportJob,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}
