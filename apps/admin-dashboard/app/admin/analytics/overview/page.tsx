import Link from 'next/link';
import { getAdminToken } from '../../../../lib/api/admin-token';
import {
  fetchAdminOverviewDashboard,
  AdminApiClientError,
  type AdminDashboardWidget,
} from '../../../../lib/api/admin-analytics-dashboard-api';

function getKpiWidgets(widgets: readonly AdminDashboardWidget[]) {
  return widgets.filter((w) => w.widgetType === 'kpi' && w.metric);
}

function getChartWidgets(widgets: readonly AdminDashboardWidget[]) {
  return widgets.filter((w) => w.widgetType === 'chart');
}

function getTableWidgets(widgets: readonly AdminDashboardWidget[]) {
  return widgets.filter((w) => w.widgetType === 'table');
}

export default async function AdminAnalyticsOverviewPage() {
  const token = await getAdminToken();

  let widgets: readonly AdminDashboardWidget[] = [];
  let fetchError: string | null = null;

  try {
    widgets = await fetchAdminOverviewDashboard(token);
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status ?? ''}: ${error.message}`
      : 'Failed to load the platform overview dashboard.';
  }

  const kpis = getKpiWidgets(widgets);
  const charts = getChartWidgets(widgets);
  const tables = getTableWidgets(widgets);

  return (
    <section className="ov-page">
      <nav className="ov-breadcrumb">
        <Link href="/admin/analytics" className="ov-breadcrumb-link">Analytics</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
        <span className="ov-breadcrumb-current">Platform Overview</span>
      </nav>

      <div className="ov-header">
        <div>
          <p className="ov-eyebrow">Analytics</p>
          <h1 className="ov-title">Platform Overview</h1>
          <p className="ov-subtitle">Backend-resolved KPI, chart, and table widgets.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {!fetchError && (
        <>
          {kpis.length > 0 && (
            <div className="ov-kpi-grid">
              {kpis.map((w) => (
                <div key={w.id} className="ov-kpi-card">
                  <p className="ov-kpi-label">{String(w.config.label ?? w.report?.name ?? 'Metric')}</p>
                  <p className="ov-kpi-value">{String(w.metric?.value ?? '--')}</p>
                  {w.metric && <p className="ov-kpi-period">{w.metric.periodType} period</p>}
                </div>
              ))}
            </div>
          )}

          {kpis.length === 0 && charts.length === 0 && tables.length === 0 && (
            <div className="ov-empty">
              <p className="ov-empty-title">No dashboard widgets available</p>
              <p className="ov-empty-desc">Dashboard widgets will appear once configured in the backend.</p>
            </div>
          )}

          {charts.map((w) => (
            <div key={w.id} className="ov-chart-card">
              <div className="ov-chart-header">
                <h2 className="ov-chart-title">{String(w.config.title ?? w.report?.name ?? 'Chart')}</h2>
                {w.report?.description && <p className="ov-chart-desc">{w.report.description}</p>}
              </div>
              <div className="ov-chart-body">
                {w.metric ? <p className="ov-chart-value">{w.metric.value}</p> : <p className="ov-chart-empty">No chart data available yet.</p>}
              </div>
            </div>
          ))}

          {tables.length > 0 && (
            <div className="ov-table-wrap">
              <table className="ov-table">
                <thead>
                  <tr>
                    <th className="ov-th">Report</th>
                    <th className="ov-th">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((w) => (
                    <tr key={w.id} className="ov-row">
                      <td className="ov-td"><span className="ov-td-name">{w.report?.name ?? '--'}</span></td>
                      <td className="ov-td">{w.report?.description ?? '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style>{`
        .ov-page { display: flex; flex-direction: column; gap: 20px; }
        .ov-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
        .ov-breadcrumb-link { color: var(--text-link); text-decoration: none; }
        .ov-breadcrumb-link:hover { text-decoration: underline; }
        .ov-breadcrumb-current { color: var(--text-secondary); font-weight: 500; }
        .ov-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .ov-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .ov-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .ov-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .ov-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .ov-kpi-card {
          display: flex; flex-direction: column; gap: 4px; padding: 18px 20px;
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
        }
        .ov-kpi-label { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }
        .ov-kpi-value { margin: 0; font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
        .ov-kpi-period { margin: 0; font-size: 12px; color: var(--text-secondary); }
        .ov-chart-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 20px; display: flex; flex-direction: column; gap: 12px;
        }
        .ov-chart-header { display: flex; flex-direction: column; gap: 4px; }
        .ov-chart-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .ov-chart-desc { margin: 0; font-size: 13px; color: var(--text-secondary); }
        .ov-chart-body { min-height: 120px; display: flex; align-items: center; justify-content: center; }
        .ov-chart-value { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-primary); }
        .ov-chart-empty { margin: 0; font-size: 14px; color: var(--text-muted); }
        .ov-table-wrap {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); overflow-x: auto;
        }
        .ov-table { width: 100%; border-collapse: collapse; }
        .ov-th {
          text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted);
          background: var(--surface-sunken); border-bottom: 1px solid var(--border);
        }
        .ov-row { transition: background 0.1s; }
        .ov-row:hover { background: color-mix(in srgb, var(--color-primary-500) 3%, transparent); }
        .ov-row:not(:last-child) .ov-td { border-bottom: 1px solid var(--border); }
        .ov-td { padding: 12px 16px; font-size: 14px; color: var(--text-primary); }
        .ov-td-name { font-weight: 600; }
        .ov-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 40px 20px; text-align: center; }
        .ov-empty-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .ov-empty-desc { margin: 0; font-size: 13px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .ov-kpi-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
        }
      `}</style>
    </section>
  );
}
