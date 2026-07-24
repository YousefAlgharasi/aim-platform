'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendFetch } from '../../../lib/api/client-api-helpers';

export const BILLING_QUERY_KEYS = {
  all: ['billing'] as const,
  overview: () => [...BILLING_QUERY_KEYS.all, 'overview'] as const,
  subscriptions: (params: Record<string, unknown> = {}) => [...BILLING_QUERY_KEYS.all, 'subscriptions', params] as const,
  invoices: (params: Record<string, unknown> = {}) => [...BILLING_QUERY_KEYS.all, 'invoices', params] as const,
  payments: (params: Record<string, unknown> = {}) => [...BILLING_QUERY_KEYS.all, 'payments', params] as const,
};

export function useBillingOverviewQuery() {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.overview(),
    queryFn: async () => {
      const res = await backendFetch('/admin/billing/overview');
      if (!res.ok) throw new Error(`Failed to load billing overview: ${res.statusText}`);
      const json = await res.json();
      return json?.data ?? json;
    },
  });
}
