// P15-060: shared admin analytics report-runner API client (read-only triggers)
// Report output is assembled entirely by ReportRunnerService on the backend.
// This client only lists definitions, triggers runs, and polls run status.
import { adminApiClient } from './admin-api-client';

export type AdminReportDefinition = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly category: string;
  readonly allowedRoles: readonly string[];
  readonly parametersSchema: Record<string, unknown>;
};

export type AdminReportRunStatus = 'queued' | 'running' | 'completed' | 'failed';

export type AdminReportRun = {
  readonly id: string;
  readonly reportDefinitionId: string;
  readonly status: AdminReportRunStatus;
  readonly resultRef: string | null;
  readonly errorMessage: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly createdAt: string;
};

function decodeReportDefinition(v: unknown): AdminReportDefinition {
  const o = v as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    key: String(o.key ?? ''),
    name: String(o.name ?? ''),
    description: typeof o.description === 'string' ? o.description : null,
    category: String(o.category ?? ''),
    allowedRoles: Array.isArray(o.allowedRoles) ? o.allowedRoles.map(String) : [],
    parametersSchema:
      typeof o.parametersSchema === 'object' && o.parametersSchema !== null
        ? (o.parametersSchema as Record<string, unknown>)
        : {},
  };
}

function decodeReportDefinitionList(v: unknown): readonly AdminReportDefinition[] {
  if (!Array.isArray(v)) return [];
  return v.map(decodeReportDefinition);
}

function decodeReportRunStatus(v: unknown): AdminReportRunStatus {
  return v === 'queued' || v === 'running' || v === 'completed' || v === 'failed' ? v : 'queued';
}

function decodeReportRun(v: unknown): AdminReportRun {
  const o = v as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    reportDefinitionId: String(o.reportDefinitionId ?? ''),
    status: decodeReportRunStatus(o.status),
    resultRef: typeof o.resultRef === 'string' ? o.resultRef : null,
    errorMessage: typeof o.errorMessage === 'string' ? o.errorMessage : null,
    startedAt: typeof o.startedAt === 'string' ? o.startedAt : null,
    completedAt: typeof o.completedAt === 'string' ? o.completedAt : null,
    createdAt: String(o.createdAt ?? ''),
  };
}

export async function fetchAdminReportDefinitions(
  token: string,
  basePath: string,
): Promise<readonly AdminReportDefinition[]> {
  const envelope = await adminApiClient.get(basePath, decodeReportDefinitionList, {
    headers: { authorization: `Bearer ${token}` },
  });
  return envelope.data;
}

export async function runAdminReport(
  token: string,
  basePath: string,
  reportKey: string,
  parameters: Record<string, unknown> = {},
): Promise<AdminReportRun> {
  const envelope = await adminApiClient.post(`${basePath}/${reportKey}/run`, decodeReportRun, {
    headers: { authorization: `Bearer ${token}` },
    body: { parameters },
  });
  return envelope.data;
}

export async function fetchAdminReportRunStatus(
  token: string,
  basePath: string,
  runId: string,
): Promise<AdminReportRun> {
  const envelope = await adminApiClient.get(`${basePath}/runs/${runId}`, decodeReportRun, {
    headers: { authorization: `Bearer ${token}` },
  });
  return envelope.data;
}

export { AdminApiClientError } from './admin-api-client-error';
