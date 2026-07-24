'use client';

import { BillingSearchTable, type FilterOption } from './billing-search-table';
import { AdminDateCell, AdminIdCell, AdminStatusBadge, type AdminTableColumn } from '../../../shared/components/Misc';

type SubscriptionFilter = 'all' | 'active' | 'cancelled' | 'past_due' | 'trialing';

const FILTERS: readonly FilterOption<SubscriptionFilter>[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'trialing', label: 'Trialing' },
  { key: 'past_due', label: 'Past Due' },
  { key: 'cancelled', label: 'Cancelled' },
];

type Subscription = {
  readonly id: string;
  readonly userId: string;
  readonly planId: string;
  readonly status: string;
  readonly currentPeriodStart: string | null;
  readonly currentPeriodEnd: string | null;
  readonly createdAt: string;
};

const COLUMNS: readonly AdminTableColumn<Subscription>[] = [
  { key: 'id', header: 'Subscription ID', render: (s) => <AdminIdCell id={s.id} /> },
  { key: 'userId', header: 'User ID', render: (s) => <AdminIdCell id={s.userId} /> },
  { key: 'planId', header: 'Plan', render: (s) => s.planId },
  { key: 'status', header: 'Status', render: (s) => <AdminStatusBadge status={s.status} /> },
  { key: 'currentPeriodStart', header: 'Period Start', render: (s) => <AdminDateCell iso={s.currentPeriodStart} /> },
  { key: 'currentPeriodEnd', header: 'Period End', render: (s) => <AdminDateCell iso={s.currentPeriodEnd} /> },
  { key: 'createdAt', header: 'Created', render: (s) => <AdminDateCell iso={s.createdAt} /> },
];

const BOUNDARY_RULES = [
  'Read-only — no subscription mutations from admin UI.',
  'Backend admin role required — enforced by PermissionGuard + BillingAdminOnly.',
  'No raw card data or provider secrets displayed.',
  'Subscription lifecycle managed by provider webhooks and backend services.',
];

export function AdminSubscriptionsView() {
  return (
    <BillingSearchTable<Subscription, SubscriptionFilter>
      title="Subscriptions"
      description="Read-only subscription management. Enter a user ID to load their subscriptions."
      searchPlaceholder="Search by user ID or subscription ID..."
      endpointPrefix="/admin/billing/subscriptions"
      resourceLabel="Subscriptions"
      filters={FILTERS}
      columns={COLUMNS}
      getRowKey={(s) => s.id}
      boundaryRules={BOUNDARY_RULES}
    />
  );
}
