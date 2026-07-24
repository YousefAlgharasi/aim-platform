'use client';

import { useBillingOverviewQuery } from '../hooks/use-billing-query';
import { useUrlSearchParamsState } from '../../../core/hooks/use-url-search-params-state';
import { AdminSubscriptionsView } from '../components/admin-subscriptions-view';
import { AdminInvoicesView } from '../components/admin-invoices-view';
import { AdminPaymentsView } from '../components/admin-payments-view';
import { AdminRefundsView } from '../components/admin-refunds-view';
import { AdminProviderEventsView } from '../components/admin-provider-events-view';
import { AdminCouponsView } from '../components/admin-coupons-view';
import { AdminCard } from '../../../shared/components/Misc';
import { AdminErrorBanner } from '../../../shared/layouts/DashboardLayout';

type BillingTab = 'overview' | 'subscriptions' | 'invoices' | 'payments' | 'refunds' | 'events' | 'coupons';

const TABS: { key: BillingTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Payments' },
  { key: 'refunds', label: 'Refunds' },
  { key: 'events', label: 'Provider Events' },
  { key: 'coupons', label: 'Coupons' },
];

export function AdminBillingMonitor() {
  const { getParam, setParams } = useUrlSearchParamsState();
  const rawTab = getParam('tab', 'overview');
  const activeTab: BillingTab = TABS.some((t) => t.key === rawTab)
    ? (rawTab as BillingTab)
    : 'overview';

  const handleTabChange = (tabKey: BillingTab) => {
    setParams({ tab: tabKey });
  };

  return (
    <section className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-500)]">
          Internal admin surface
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Billing Monitor</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Read-only billing administration. All data from backend admin endpoints.
        </p>
      </div>

      <nav className="flex flex-wrap gap-1.5 border-b border-[var(--border)] pb-2" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:bg-[var(--state-hover)]'
            }`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        {activeTab === 'overview' && <BillingOverviewPanel />}
        {activeTab === 'subscriptions' && <AdminSubscriptionsView />}
        {activeTab === 'invoices' && <AdminInvoicesView />}
        {activeTab === 'payments' && <AdminPaymentsView />}
        {activeTab === 'refunds' && <AdminRefundsView />}
        {activeTab === 'events' && <AdminProviderEventsView />}
        {activeTab === 'coupons' && <AdminCouponsView />}
      </div>

      <div className="mt-4 p-4 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex flex-col gap-1.5">
        <h2 className="font-semibold text-sm text-[var(--text-primary)]">Admin billing rules</h2>
        <ul className="list-disc pl-4 space-y-1">
          <li>All data from GET /admin/billing/* endpoints — backend is authority.</li>
          <li>Admin role required — enforced by backend PermissionGuard.</li>
          <li>Read-only — no mutation endpoints exposed in this view.</li>
          <li>No raw card data, provider secrets, or webhook secrets displayed.</li>
        </ul>
      </div>
    </section>
  );
}

function BillingOverviewPanel() {
  const { data, isLoading, error } = useBillingOverviewQuery();

  const overview = data as Record<string, unknown> | undefined;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Billing Overview</h2>
      <p className="text-xs text-[var(--text-secondary)]">Summary statistics loaded from backend admin billing API.</p>
      {error && (
        <AdminErrorBanner
          message={error instanceof Error ? error.message : String(error)}
        />
      )}
      {isLoading ? (
        <AdminCard className="p-8 text-center text-sm text-[var(--text-muted)]">
          Loading...
        </AdminCard>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Subscriptions"
            value={
              overview?.activeSubscriptions != null
                ? String(overview.activeSubscriptions)
                : overview?.active_subscriptions != null
                ? String(overview.active_subscriptions)
                : '—'
            }
          />
          <StatCard
            label="Revenue (MTD)"
            value={
              overview?.revenueMtd != null
                ? String(overview.revenueMtd)
                : overview?.revenue_mtd != null
                ? String(overview.revenue_mtd)
                : overview?.revenue != null
                ? String(overview.revenue)
                : '—'
            }
          />
          <StatCard
            label="Pending Refunds"
            value={
              overview?.pendingRefunds != null
                ? String(overview.pendingRefunds)
                : overview?.pending_refunds != null
                ? String(overview.pending_refunds)
                : '—'
            }
          />
          <StatCard
            label="Failed Payments"
            value={
              overview?.failedPayments != null
                ? String(overview.failedPayments)
                : overview?.failed_payments != null
                ? String(overview.failed_payments)
                : '—'
            }
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <AdminCard className="p-4 flex flex-col gap-1">
      <span className="text-xs text-[var(--text-muted)] font-medium">{label}</span>
      <span className="text-xl font-bold text-[var(--text-primary)]">{value}</span>
    </AdminCard>
  );
}

