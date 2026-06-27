import Link from 'next/link';
import { getAdminToken } from '../../../../lib/api/admin-token';
import {
  fetchAdminOverviewDashboard,
  AdminApiClientError,
  type AdminDashboardWidget,
} from '../../../../lib/api/admin-analytics-dashboard-api';
import { fetchAdminStats, type DashboardStats } from '../../../../lib/api/admin-stats-api';

export default async function AdminAnalyticsOverviewPage() {
  const token = await getAdminToken();

  let widgets: readonly AdminDashboardWidget[] = [];
  let stats: DashboardStats | null = null;
  let fetchError: string | null = null;

  try {
    [widgets, stats] = await Promise.all([
      fetchAdminOverviewDashboard(token).catch(() => [] as AdminDashboardWidget[]),
      fetchAdminStats(token),
    ]);
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status ?? ''}: ${error.message}`
      : 'Failed to load dashboard data.';
  }

  const kpis = widgets.filter((w) => w.widgetType === 'kpi' && w.metric);
  const charts = widgets.filter((w) => w.widgetType === 'chart');

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
          <p className="ov-subtitle">Live platform statistics and dashboard widgets.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {stats && (
        <>
          <h2 className="ov-section-title">Users</h2>
          <div className="ov-kpi-grid">
            <StatCard label="Total Users" value={stats.users.total} />
            <StatCard label="Students" value={stats.users.students} />
            <StatCard label="Admins" value={stats.users.admins} />
            <StatCard label="Active" value={stats.users.active} accent />
            <StatCard label="New This Month" value={stats.users.newThisMonth} />
          </div>

          <h2 className="ov-section-title">Content</h2>
          <div className="ov-kpi-grid">
            <StatCard label="Courses" value={stats.content.courses} />
            <StatCard label="Lessons" value={stats.content.lessons} />
            <StatCard label="Questions" value={stats.content.questions} />
            <StatCard label="Skills" value={stats.content.skills} />
          </div>

          <h2 className="ov-section-title">Assessments</h2>
          <div className="ov-kpi-grid">
            <StatCard label="Total Assessments" value={stats.assessments.total} />
            <StatCard label="Attempts" value={stats.assessments.attempts} />
            <StatCard label="Avg Score" value={stats.assessments.avgScore !== null ? `${stats.assessments.avgScore}%` : '--'} />
          </div>

          <h2 className="ov-section-title">Activity</h2>
          <div className="ov-kpi-grid">
            <StatCard label="AI Sessions" value={stats.activity.aiSessions} />
            <StatCard label="Voice Sessions" value={stats.activity.voiceSessions} />
            <StatCard label="Learning Today" value={stats.activity.learningSessionsToday} accent />
          </div>

          <h2 className="ov-section-title">Billing</h2>
          <div className="ov-kpi-grid">
            <StatCard label="Active Subs" value={stats.billing.activeSubscriptions} accent />
            <StatCard label="Trialing" value={stats.billing.trialingSubscriptions} />
            <StatCard label="Canceled" value={stats.billing.canceledSubscriptions} />
            <StatCard label="Total Revenue" value={`${stats.billing.currency} ${stats.billing.totalRevenue.toLocaleString()}`} />
            <StatCard label="Revenue This Month" value={`${stats.billing.currency} ${stats.billing.revenueThisMonth.toLocaleString()}`} accent />
            <StatCard label="Paid Invoices" value={stats.billing.paidInvoices} />
            <StatCard label="Overdue Invoices" value={stats.billing.overdueInvoices} warn={stats.billing.overdueInvoices > 0} />
          </div>

          <h2 className="ov-section-title">Operations</h2>
          <div className="ov-kpi-grid">
            <StatCard label="Open Tickets" value={stats.operations.openTickets} warn={stats.operations.openTickets > 0} />
            <StatCard label="Active Incidents" value={stats.operations.activeIncidents} warn={stats.operations.activeIncidents > 0} />
            <StatCard label="Pending Feedback" value={stats.operations.pendingFeedback} />
          </div>
        </>
      )}

      {kpis.length > 0 && (
        <>
          <h2 className="ov-section-title">Dashboard Widgets</h2>
          <div className="ov-kpi-grid">
            {kpis.map((w) => (
              <StatCard
                key={w.id}
                label={String(w.config.label ?? w.report?.name ?? 'Metric')}
                value={String(w.metric?.value ?? '--')}
                sub={w.metric ? `${w.metric.periodType} period` : undefined}
              />
            ))}
          </div>
        </>
      )}

      {charts.map((w) => (
        <div key={w.id} className="ov-chart-card">
          <h3 className="ov-chart-title">{String(w.config.title ?? w.report?.name ?? 'Chart')}</h3>
          {w.report?.description && <p className="ov-chart-desc">{w.report.description}</p>}
          <div className="ov-chart-body">
            {w.metric ? <p className="ov-chart-value">{w.metric.value}</p> : <p className="ov-chart-empty">No chart data yet.</p>}
          </div>
        </div>
      ))}

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
        .ov-section-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .ov-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px; }
        .ov-stat {
          display: flex; flex-direction: column; gap: 4px; padding: 16px 18px;
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
        }
        .ov-stat--accent { border-left: 3px solid var(--color-primary-500); }
        .ov-stat--warn { border-left: 3px solid var(--color-error-500); }
        .ov-stat-label { margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }
        .ov-stat-value { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
        .ov-stat-sub { margin: 0; font-size: 11px; color: var(--text-secondary); }
        .ov-chart-card {
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 20px;
        }
        .ov-chart-title { margin: 0 0 4px; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .ov-chart-desc { margin: 0 0 12px; font-size: 13px; color: var(--text-secondary); }
        .ov-chart-body { min-height: 100px; display: flex; align-items: center; justify-content: center; }
        .ov-chart-value { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-primary); }
        .ov-chart-empty { margin: 0; font-size: 14px; color: var(--text-muted); }
        @media (max-width: 640px) {
          .ov-kpi-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
        }
      `}</style>
    </section>
  );
}

function StatCard({ label, value, sub, accent, warn }: { label: string; value: string | number; sub?: string; accent?: boolean; warn?: boolean }) {
  const cls = `ov-stat${accent ? ' ov-stat--accent' : ''}${warn ? ' ov-stat--warn' : ''}`;
  return (
    <div className={cls}>
      <p className="ov-stat-label">{label}</p>
      <p className="ov-stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="ov-stat-sub">{sub}</p>}
    </div>
  );
}
