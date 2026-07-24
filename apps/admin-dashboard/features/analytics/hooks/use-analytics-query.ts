'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEnrollmentReport,
  fetchAssessmentReport,
  fetchActiveUsersReport,
  type AdminEnrollmentReport,
  type AdminAssessmentReport,
  type AdminActiveUsersReport,
} from '../admin-reports-api';
import {
  fetchAdminReportDefinitions,
  fetchAdminReportRunStatus,
  runAdminReport,
  type AdminReportDefinition,
  type AdminReportRun,
} from '../admin-analytics-reports-api';
import {
  fetchAdminOverviewDashboard,
  type AdminDashboardWidget,
} from '../admin-analytics-dashboard-api';
import {
  fetchNotificationAuditLogs,
  fetchNotificationTemplates,
  type NotificationAuditLog,
  type NotificationTemplate,
} from '../admin-notification-analytics-api';
import {
  requestExport,
  fetchExportStatus,
  type AdminExportJob,
  type ExportType,
} from '../admin-analytics-exports-api';

export const ANALYTICS_QUERY_KEYS = {
  all: ['analytics'] as const,
  reports: () => [...ANALYTICS_QUERY_KEYS.all, 'reports'] as const,
  enrollment: (range?: { from?: string; to?: string }) =>
    [...ANALYTICS_QUERY_KEYS.reports(), 'enrollment', range] as const,
  assessment: (range?: { from?: string; to?: string }) =>
    [...ANALYTICS_QUERY_KEYS.reports(), 'assessment', range] as const,
  activeUsers: (range?: { from?: string; to?: string }) =>
    [...ANALYTICS_QUERY_KEYS.reports(), 'activeUsers', range] as const,
  definitions: (basePath: string) =>
    [...ANALYTICS_QUERY_KEYS.all, 'definitions', basePath] as const,
  runStatus: (basePath: string, runId: string) =>
    [...ANALYTICS_QUERY_KEYS.all, 'runStatus', basePath, runId] as const,
  dashboard: () => [...ANALYTICS_QUERY_KEYS.all, 'dashboard'] as const,
  notificationAuditLogs: (params?: { limit?: number; offset?: number; eventType?: string }) =>
    [...ANALYTICS_QUERY_KEYS.all, 'notificationAuditLogs', params] as const,
  notificationTemplates: () => [...ANALYTICS_QUERY_KEYS.all, 'notificationTemplates'] as const,
  exportStatus: (exportJobId: string) =>
    [...ANALYTICS_QUERY_KEYS.all, 'exportStatus', exportJobId] as const,
};

export function useEnrollmentReportQuery(
  token: string,
  range?: { from?: string; to?: string },
  initialData?: AdminEnrollmentReport,
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.enrollment(range),
    queryFn: () => fetchEnrollmentReport(token, range),
    initialData,
    enabled: Boolean(token),
  });
}

export function useAssessmentReportQuery(
  token: string,
  range?: { from?: string; to?: string },
  initialData?: AdminAssessmentReport,
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.assessment(range),
    queryFn: () => fetchAssessmentReport(token, range),
    initialData,
    enabled: Boolean(token),
  });
}

export function useActiveUsersReportQuery(
  token: string,
  range?: { from?: string; to?: string },
  initialData?: AdminActiveUsersReport,
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.activeUsers(range),
    queryFn: () => fetchActiveUsersReport(token, range),
    initialData,
    enabled: Boolean(token),
  });
}

export function useAdminReportDefinitionsQuery(
  token: string,
  basePath: string,
  initialData?: readonly AdminReportDefinition[],
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.definitions(basePath),
    queryFn: () => fetchAdminReportDefinitions(token, basePath),
    initialData,
    enabled: Boolean(token && basePath),
  });
}

export function useAdminReportRunStatusQuery(
  token: string,
  basePath: string,
  runId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.runStatus(basePath, runId),
    queryFn: () => fetchAdminReportRunStatus(token, basePath, runId),
    enabled: Boolean(token && basePath && runId) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

export function useAdminOverviewDashboardQuery(
  token: string,
  initialData?: readonly AdminDashboardWidget[],
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.dashboard(),
    queryFn: () => fetchAdminOverviewDashboard(token),
    initialData,
    enabled: Boolean(token),
  });
}

export function useNotificationAuditLogsQuery(
  token: string,
  params?: { limit?: number; offset?: number; eventType?: string },
  initialData?: NotificationAuditLog[],
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.notificationAuditLogs(params),
    queryFn: () => fetchNotificationAuditLogs(token, params?.limit, params?.offset, params?.eventType),
    initialData,
    enabled: Boolean(token),
  });
}

export function useNotificationTemplatesQuery(
  token: string,
  initialData?: NotificationTemplate[],
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.notificationTemplates(),
    queryFn: () => fetchNotificationTemplates(token),
    initialData,
    enabled: Boolean(token),
  });
}

export function useExportStatusQuery(
  token: string,
  exportJobId: string,
  options?: { enabled?: boolean; refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.exportStatus(exportJobId),
    queryFn: () => fetchExportStatus(token, exportJobId),
    enabled: Boolean(token && exportJobId) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
  });
}

export function useRunAdminReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      token,
      basePath,
      reportKey,
      parameters,
    }: {
      token: string;
      basePath: string;
      reportKey: string;
      parameters?: Record<string, unknown>;
    }) => runAdminReport(token, basePath, reportKey, parameters),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ANALYTICS_QUERY_KEYS.definitions(variables.basePath),
      });
    },
  });
}

export function useRequestExportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      token,
      reportRunId,
      exportType,
    }: {
      token: string;
      reportRunId: string;
      exportType: ExportType;
    }) => requestExport(token, reportRunId, exportType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ANALYTICS_QUERY_KEYS.exportStatus(variables.reportRunId),
      });
    },
  });
}
