// P15-059: admin analytics dashboard API client (read-only)
// Dashboard widgets are fully resolved by DashboardService on the backend.
// This client only decodes and forwards what the backend returns.
import { adminApiClient } from './admin-api-client';

export type AdminDashboardWidgetType = 'kpi' | 'chart' | 'table';

export type AdminDashboardMetric = {
  readonly id: string;
  readonly value: number;
  readonly periodType: string;
  readonly periodStart: string;
  readonly periodEnd: string;
};

export type AdminDashboardReport = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
};

export type AdminDashboardWidget = {
  readonly id: string;
  readonly widgetType: AdminDashboardWidgetType;
  readonly config: Record<string, unknown>;
  readonly displayOrder: number;
  readonly metric: AdminDashboardMetric | null;
  readonly report: AdminDashboardReport | null;
};

function decodeMetric(v: unknown): AdminDashboardMetric | null {
  if (v === null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    value: typeof o.value === 'number' ? o.value : 0,
    periodType: String(o.periodType ?? ''),
    periodStart: String(o.periodStart ?? ''),
    periodEnd: String(o.periodEnd ?? ''),
  };
}

function decodeReport(v: unknown): AdminDashboardReport | null {
  if (v === null || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  return {
    id: String(o.id ?? ''),
    key: String(o.key ?? ''),
    name: String(o.name ?? ''),
    description: typeof o.description === 'string' ? o.description : null,
  };
}

function decodeWidget(v: unknown): AdminDashboardWidget {
  const o = v as Record<string, unknown>;
  const widgetType = o.widgetType === 'chart' || o.widgetType === 'table' ? o.widgetType : 'kpi';
  return {
    id: String(o.id ?? ''),
    widgetType,
    config: typeof o.config === 'object' && o.config !== null ? (o.config as Record<string, unknown>) : {},
    displayOrder: typeof o.displayOrder === 'number' ? o.displayOrder : 0,
    metric: decodeMetric(o.metric),
    report: decodeReport(o.report),
  };
}

function decodeWidgetList(v: unknown): readonly AdminDashboardWidget[] {
  if (!Array.isArray(v)) return [];
  return v.map(decodeWidget);
}

export async function fetchAdminOverviewDashboard(
  token: string,
): Promise<readonly AdminDashboardWidget[]> {
  const envelope = await adminApiClient.get(
    '/admin/analytics/dashboard/admin_overview',
    decodeWidgetList,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return envelope.data;
}

export { AdminApiClientError } from './admin-api-client-error';
