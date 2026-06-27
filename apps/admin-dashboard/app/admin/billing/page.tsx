import { getAdminToken } from '../../../lib/api/admin-token';
import { fetchAdminStats, type DashboardStats } from '../../../lib/api/admin-stats-api';
import { AdminApiClientError } from '../../../lib/api/admin-api-client-error';

export default async function AdminBillingPage() {
  const token = await getAdminToken();

  let stats: DashboardStats | null = null;
  let fetchError: string | null = null;

  try {
    stats = await fetchAdminStats(token);
  } catch (error) {
    fetchError = error instanceof AdminApiClientError
      ? `Backend error ${error.status ?? ''}: ${error.message}`
      : 'Failed to load billing overview.';
  }

  return (
    <section className="bo-page">
      <div className="bo-header">
        <div>
          <p className="bo-eyebrow">Billing</p>
          <h1 className="bo-title">Billing Overview</h1>
          <p className="bo-subtitle">Platform billing statistics at a glance.</p>
        </div>
      </div>

      {fetchError && <div className="admin-error-banner" role="alert">{fetchError}</div>}

      {stats && (
        <>
          <div className="bo-kpi-grid">
            <StatCard label="Active Subscriptions" value={stats.billing.activeSubscriptions} accent />
            <StatCard label="Trialing" value={stats.billing.trialingSubscriptions} />
            <StatCard label="Canceled" value={stats.billing.canceledSubscriptions} />
          </div>

          <div className="bo-kpi-grid">
            <StatCard label="Total Revenue" value={`${stats.billing.currency} ${stats.billing.totalRevenue.toLocaleString()}`} />
            <StatCard label="Revenue This Month" value={`${stats.billing.currency} ${stats.billing.revenueThisMonth.toLocaleString()}`} accent />
          </div>

          <div className="bo-kpi-grid">
            <StatCard label="Paid Invoices" value={stats.billing.paidInvoices} />
            <StatCard label="Overdue Invoices" value={stats.billing.overdueInvoices} warn={stats.billing.overdueInvoices > 0} />
          </div>
        </>
      )}

      <style>{`
        .bo-page { display: flex; flex-direction: column; gap: 20px; }
        .bo-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .bo-eyebrow { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary-500); }
        .bo-title { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); }
        .bo-subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }
        .bo-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .bo-stat {
          display: flex; flex-direction: column; gap: 4px; padding: 16px 18px;
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
        }
        .bo-stat--accent { border-left: 3px solid var(--color-primary-500); }
        .bo-stat--warn { border-left: 3px solid var(--color-error-500); }
        .bo-stat-label { margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-muted); }
        .bo-stat-value { margin: 0; font-size: 24px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
        @media (max-width: 640px) {
          .bo-kpi-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
        }
      `}</style>
    </section>
  );
}

function StatCard({ label, value, accent, warn }: { label: string; value: string | number; accent?: boolean; warn?: boolean }) {
  const cls = `bo-stat${accent ? ' bo-stat--accent' : ''}${warn ? ' bo-stat--warn' : ''}`;
  return (
    <div className={cls}>
      <p className="bo-stat-label">{label}</p>
      <p className="bo-stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}
