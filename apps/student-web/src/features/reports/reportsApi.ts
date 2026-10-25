import { apiClient } from '../../api/client';

// Backend: services/backend-api/src/features/analytics/student-analytics-summary.controller.ts
//          analytics.entities.ts (ReportDefinition, ReportRun, ReportRunResultData)

export interface ReportDefinition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  allowedRoles: string[];
  parametersSchema: Record<string, unknown>;
  isActive: boolean;
}

export interface ReportSection {
  title: string;
  type: 'metrics' | 'events_summary' | 'table' | string;
  data: Record<string, unknown>[];
}

export interface ReportRunResultData {
  reportKey: string;
  reportName: string;
  category: string;
  generatedAt: string;
  parameters: Record<string, unknown>;
  sections: ReportSection[];
}

export interface ReportRun {
  id: string;
  reportDefinitionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  resultData: ReportRunResultData | null;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export function fetchReportDefinitions(): Promise<ReportDefinition[]> {
  return apiClient.get<ReportDefinition[]>('/student/analytics/summary');
}

export function runReport(reportKey: string): Promise<ReportRun> {
  // RunReportDto: { parameters?: object } — no student-facing parameters exist yet.
  return apiClient.post<ReportRun>(`/student/analytics/summary/${encodeURIComponent(reportKey)}/run`, {});
}

export function fetchReportRun(runId: string): Promise<ReportRun> {
  return apiClient.get<ReportRun>(`/student/analytics/summary/runs/${encodeURIComponent(runId)}`);
}
