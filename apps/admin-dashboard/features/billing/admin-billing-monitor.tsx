'use client';

import { useState } from 'react';
import { useAdminFetch } from '../../lib/hooks/use-admin-fetch';
import {
  AdminDateCell,
  AdminIdCell,
  AdminStatusBadge,
  AdminTable,
  AdminCard,
  type AdminTableColumn,
} from '../../components/common';
import { AdminErrorBanner } from '../../components/layout';

type BillingTab = 'overview' | 'subscriptions' | 'payments' | 'invoices' | 'events' | 'audit';

const TABS: { key: BillingTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'payments', label: 'Payments' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'events', label: 'Provider Events' },
  { key: 'audit', label: 'Audit Log' },
];

export function AdminBillingMonitor() {
  const [activeTab, setActiveTab] = useState<BillingTab>('overview');

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

      <nav className="flex flex-wrap gap-1.5 border-b border-[var(--border)] pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[var(--color-primary-500)] text-white'
                : 'bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:bg-[var(--state-hover)]'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-4">
        {activeTab === 'overview' && <BillingOverviewPanel />}
        {activeTab === 'events' && (
          <BillingListPanel endpoint="/admin/billing/provider-events" status="pending" type="Provider Events" />
        )}
        {activeTab === 'audit' && (
          <BillingListPanel endpoint="/admin/billing/audit-logs" type="Audit Logs" />
        )}
        {activeTab === 'subscriptions' && (
          <BillingPlaceholderPanel
            type="Subscriptions"
            hint="Requires a user ID — use the Users page to view a specific user's subscriptions."
          />
        )}
        {activeTab === 'payments' && (
          <BillingPlaceholderPanel
            type="Payments"
            hint="Requires a user ID — use the Users page to view a specific user's payments."
          />
        )}
        {activeTab === 'invoices' && (
          <BillingPlaceholderPanel
            type="Invoices"
            hint="Requires a user ID — use the Users page to view a specific user's invoices."
          />
        )}
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
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Billing Overview</h2>
      <p className="text-xs text-[var(--text-secondary)]">Summary statistics loaded from backend admin billing API.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Subscriptions" value="—" />
        <StatCard label="Revenue (MTD)" value="—" />
        <StatCard label="Pending Refunds" value="—" />
        <StatCard label="Failed Payments" value="—" />
      </div>
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

type ListRow = Record<string, unknown>;

function BillingListPanel({
  endpoint,
  status,
  type,
}: {
  readonly endpoint: string;
  readonly status?: string;
  readonly type: string;
}) {
  const { data: rows, loading, error } = useAdminFetch<ListRow>(endpoint, status);

  const rawKeys = rows.length > 0 ? Object.keys(rows[0]).slice(0, 5) : ['id', 'status', 'createdAt'];

  const columns: AdminTableColumn<ListRow>[] = rawKeys.map((colKey) => ({
    key: colKey,
    header: colKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    render: (row) => {
      const val = row[colKey];
      if (colKey.toLowerCase().includes('id') && typeof val === 'string') {
        return <AdminIdCell id={val} />;
      }
      if (colKey.toLowerCase().includes('date') || colKey.toLowerCase().includes('at')) {
        return <AdminDateCell iso={val != null ? String(val) : null} />;
      }
      if (colKey.toLowerCase() === 'status' && typeof val === 'string') {
        return <AdminStatusBadge status={val} />;
      }
      return val != null ? String(val) : '—';
    },
  }));

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{type}</h2>
      <p className="text-xs text-[var(--text-muted)]">Data will be loaded from GET {endpoint}.</p>
      {error && <AdminErrorBanner message={error} />}
      {loading ? (
        <AdminCard className="p-8 text-center text-sm text-[var(--text-muted)]">
          Loading...
        </AdminCard>
      ) : rows.length === 0 && !error ? (
        <AdminCard className="p-8 text-center text-sm text-[var(--text-muted)]">
          No {type.toLowerCase()} found.
        </AdminCard>
      ) : (
        <AdminTable
          columns={columns}
          rows={rows}
          getRowKey={(row, i) => String(row.id ?? i)}
        />
      )}
    </div>
  );
}

function BillingPlaceholderPanel({ type, hint }: { readonly type: string; readonly hint: string }) {
  return (
    <AdminCard className="p-6 flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{type}</h2>
      <p className="text-xs text-[var(--text-secondary)]">{hint}</p>
    </AdminCard>
  );
}
