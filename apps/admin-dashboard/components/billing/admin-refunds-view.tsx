'use client';

import { BillingSearchTable, type FilterOption } from './billing-search-table';
import { AdminDateCell, AdminIdCell, AdminStatusBadge, type AdminTableColumn } from '../common';

type RefundFilter = 'all' | 'pending' | 'succeeded' | 'failed' | 'canceled' | 'denied';

const FILTERS: readonly FilterOption<RefundFilter>[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'succeeded', label: 'Succeeded' },
  { key: 'failed', label: 'Failed' },
  { key: 'canceled', label: 'Canceled' },
  { key: 'denied', label: 'Denied' },
];

type Refund = {
  readonly id: string;
  readonly paymentId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly reason: string | null;
  readonly createdAt: string;
};

const COLUMNS: readonly AdminTableColumn<Refund>[] = [
  { key: 'id', header: 'Refund ID', render: (r) => <AdminIdCell id={r.id} /> },
  { key: 'paymentId', header: 'Payment ID', render: (r) => <AdminIdCell id={r.paymentId} /> },
  { key: 'amount', header: 'Amount', render: (r) => r.amount },
  { key: 'currency', header: 'Currency', render: (r) => r.currency },
  { key: 'status', header: 'Status', render: (r) => <AdminStatusBadge status={r.status} /> },
  { key: 'reason', header: 'Reason', render: (r) => r.reason ?? '—' },
  { key: 'createdAt', header: 'Created', render: (r) => <AdminDateCell iso={r.createdAt} /> },
];

export function AdminRefundsView() {
  return (
    <BillingSearchTable<Refund, RefundFilter>
      title="Refunds"
      description="Enter a payment ID to load its refunds."
      searchPlaceholder="Enter payment ID..."
      endpointPrefix="/admin/billing/refunds"
      resourceLabel="Refunds"
      filters={FILTERS}
      columns={COLUMNS}
      getRowKey={(r) => r.id}
    />
  );
}
