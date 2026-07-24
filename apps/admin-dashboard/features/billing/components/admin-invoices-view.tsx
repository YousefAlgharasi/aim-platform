'use client';

import { BillingSearchTable, type FilterOption } from './billing-search-table';
import { AdminDateCell, AdminIdCell, AdminStatusBadge, type AdminTableColumn } from '../../../shared/components/Misc';

type InvoiceFilter = 'all' | 'paid' | 'pending' | 'failed' | 'void';

const FILTERS: readonly FilterOption<InvoiceFilter>[] = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'void', label: 'Void' },
];

type Invoice = {
  readonly id: string;
  readonly userId: string;
  readonly status: string;
  readonly total: number;
  readonly currency: string;
  readonly dueDate: string | null;
  readonly paidAt: string | null;
  readonly createdAt: string;
};

const COLUMNS: readonly AdminTableColumn<Invoice>[] = [
  { key: 'id', header: 'Invoice ID', render: (inv) => <AdminIdCell id={inv.id} /> },
  { key: 'userId', header: 'User ID', render: (inv) => <AdminIdCell id={inv.userId} /> },
  { key: 'total', header: 'Total', render: (inv) => inv.total },
  { key: 'currency', header: 'Currency', render: (inv) => inv.currency },
  { key: 'status', header: 'Status', render: (inv) => <AdminStatusBadge status={inv.status} /> },
  { key: 'dueDate', header: 'Due Date', render: (inv) => <AdminDateCell iso={inv.dueDate} /> },
  { key: 'paidAt', header: 'Paid At', render: (inv) => <AdminDateCell iso={inv.paidAt} /> },
  { key: 'createdAt', header: 'Created', render: (inv) => <AdminDateCell iso={inv.createdAt} /> },
];

const BOUNDARY_RULES = [
  'Read-only — no invoice mutations from admin UI.',
  'Backend admin role required — enforced by PermissionGuard.',
];

export function AdminInvoicesView() {
  return (
    <BillingSearchTable<Invoice, InvoiceFilter>
      title="Invoices"
      description="Enter a user ID to load their invoices."
      searchPlaceholder="Enter user ID..."
      endpointPrefix="/admin/billing/invoices"
      resourceLabel="Invoices"
      filters={FILTERS}
      columns={COLUMNS}
      getRowKey={(inv) => inv.id}
      boundaryRules={BOUNDARY_RULES}
    />
  );
}
