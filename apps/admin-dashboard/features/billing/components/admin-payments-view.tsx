'use client';

import { BillingSearchTable, type FilterOption } from './billing-search-table';
import { AdminDateCell, AdminIdCell, AdminStatusBadge, type AdminTableColumn } from '../../../shared/components/Misc';

type PaymentFilter = 'all' | 'succeeded' | 'pending' | 'failed' | 'refunded';

const FILTERS: readonly FilterOption<PaymentFilter>[] = [
  { key: 'all', label: 'All' },
  { key: 'succeeded', label: 'Succeeded' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

type Payment = {
  readonly id: string;
  readonly userId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly providerPaymentId: string | null;
  readonly createdAt: string;
};

const COLUMNS: readonly AdminTableColumn<Payment>[] = [
  { key: 'id', header: 'Payment ID', render: (p) => <AdminIdCell id={p.id} /> },
  { key: 'userId', header: 'User ID', render: (p) => <AdminIdCell id={p.userId} /> },
  { key: 'amount', header: 'Amount', render: (p) => p.amount },
  { key: 'currency', header: 'Currency', render: (p) => p.currency },
  { key: 'status', header: 'Status', render: (p) => <AdminStatusBadge status={p.status} /> },
  { key: 'providerPaymentId', header: 'Provider Ref', render: (p) => p.providerPaymentId ? <AdminIdCell id={p.providerPaymentId} /> : '—' },
  { key: 'createdAt', header: 'Created', render: (p) => <AdminDateCell iso={p.createdAt} /> },
];

const BOUNDARY_RULES = [
  'Read-only — no payment mutations from admin UI.',
  'No raw card data displayed — only safe metadata from backend.',
  'Refunds initiated through separate admin refund workflow.',
  'Backend admin role required — enforced by PermissionGuard.',
];

export function AdminPaymentsView() {
  return (
    <BillingSearchTable<Payment, PaymentFilter>
      title="Payments"
      description="Enter a user ID to load their payment records."
      searchPlaceholder="Enter user ID..."
      endpointPrefix="/admin/billing/payments"
      resourceLabel="Payments"
      filters={FILTERS}
      columns={COLUMNS}
      getRowKey={(p) => p.id}
      boundaryRules={BOUNDARY_RULES}
    />
  );
}
