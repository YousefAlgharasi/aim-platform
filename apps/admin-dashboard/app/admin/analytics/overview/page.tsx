import { getAdminToken } from '../../../../lib/api/admin-token';
import {
  fetchAdminOverviewDashboard,
  AdminApiClientError,
  type AdminDashboardWidget,
} from '../../../../lib/api/admin-analytics-dashboard-api';
import {
  AdminReportPageLayout,
  AdminKpiCardGrid,
  AdminChartShell,
  AdminReportTableShell,
  type AdminKpiCardItem,
} from '../../../../components/analytics';
import type { AdminTableColumn } from '../../../../components/common';

function toKpiItems(widgets: readonly AdminDashboardWidget[]): AdminKpiCardItem[] {
  return widgets
    .filter((widget) => widget.widgetType === 'kpi' && widget.metric)
    .map((widget) => ({
      key: widget.id,
      label: String(widget.config.label ?? widget.report?.name ?? 'Metric'),
      value: String(widget.metric?.value ?? '—'),
      helperText: widget.metric ? `${widget.metric.periodType} period` : undefined,
    }));
}

function toChartWidgets(widgets: readonly AdminDashboardWidget[]): AdminDashboardWidget[] {
  return widgets.filter((widget) => widget.widgetType === 'chart');
}

function toTableWidgets(widgets: readonly AdminDashboardWidget[]): AdminDashboardWidget[] {
  return widgets.filter((widget) => widget.widgetType === 'table');
}

const tableColumns: readonly AdminTableColumn<AdminDashboardWidget>[] = [
  { key: 'name', header: 'Report', render: (w) => w.report?.name ?? '—' },
  { key: 'description', header: 'Description', render: (w) => w.report?.description ?? '—' },
];

export default async function AdminAnalyticsOverviewPage() {
  const token = await getAdminToken();

  let widgets: readonly AdminDashboardWidget[] = [];
  let fetchError: string | null = null;

  try {
    widgets = await fetchAdminOverviewDashboard(token);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status ?? ''}: ${error.message}`
        : 'Failed to load the platform overview dashboard. Check backend connectivity.';
  }

  const kpiItems = toKpiItems(widgets);
  const chartWidgets = toChartWidgets(widgets);
  const tableWidgets = toTableWidgets(widgets);

  return (
    <AdminReportPageLayout
      title="Platform Overview"
      description="Backend-resolved KPI, chart, and table widgets for users, learning, curriculum, assessments, notifications, and billing."
      boundaryNote="Dashboard widgets are resolved entirely by DashboardService. The UI never assembles or recalculates metrics locally."
    >
      {fetchError && (
        <p className="admin-error-banner" role="alert">
          {fetchError}
        </p>
      )}

      {!fetchError && (
        <>
          <AdminKpiCardGrid items={kpiItems} />

          {chartWidgets.map((widget) => (
            <AdminChartShell
              key={widget.id}
              title={String(widget.config.title ?? widget.report?.name ?? 'Chart')}
              description={widget.report?.description ?? undefined}
              isEmpty={!widget.metric && !widget.report}
            >
              <p>{widget.metric?.value ?? '—'}</p>
            </AdminChartShell>
          ))}

          {tableWidgets.length > 0 && (
            <AdminReportTableShell
              columns={tableColumns}
              rows={tableWidgets}
              getRowKey={(w) => w.id}
              caption="Report widgets"
            />
          )}
        </>
      )}
    </AdminReportPageLayout>
  );
}
