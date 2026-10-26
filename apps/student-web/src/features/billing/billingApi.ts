import { apiClient } from '../../api/client';
import { t, getLocale, formatNumber } from '../../i18n';

// Backend: services/backend-api/src/features/billing/*.controller.ts + billing.entities.ts
// Flutter: apps/mobile/lib/features/billing/data/{datasources,models}
// Amounts are integer minor units (cents).

export interface BillingProduct {
  id: string;
  name: string;
  description: string | null;
  productType: string;
  status: string;
}

export interface BillingPrice {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  billingInterval: 'month' | 'year' | 'one_time';
  status: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  description: string | null;
  priceId: string;
  features: Record<string, unknown>;
  planType: 'free' | 'basic' | 'premium' | 'enterprise';
  status: string;
}

export interface PublicPricingResponse {
  products: BillingProduct[];
  prices: BillingPrice[];
  plans: BillingPlan[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing' | 'paused' | 'incomplete';
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  createdAt: string;
}

export interface BillingEntitlement {
  id: string;
  planId: string | null;
  subscriptionId: string | null;
  featureKey: string;
  granted: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  source: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface UserSubscriptionResponse {
  subscriptions: Subscription[];
  entitlements: BillingEntitlement[];
}

export interface Invoice {
  id: string;
  subscriptionId: string | null;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  invoiceUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  priceId: string | null;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  currency: string;
}

export interface CheckoutSession {
  id: string;
  priceId: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  checkoutUrl: string | null;
  expiresAt: string | null;
  subscriptionId: string | null;
}

export interface CheckoutStatus {
  id: string;
  sessionId: string;
  status: 'pending' | 'completed' | 'expired' | 'failed' | string;
  checkoutUrl?: string;
  expiresAt?: string;
  subscriptionId?: string;
}

export function formatMoney(amountMinor: number, currency: string): string {
  const code = (currency || 'usd').toUpperCase();
  try {
    return new Intl.NumberFormat(getLocale() === 'ar' ? 'ar-u-nu-latn' : undefined, { style: 'currency', currency: code }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${code}`;
  }
}

export const INTERVAL_LABELS: Record<string, string> = {
  month: 'month',
  year: 'year',
  one_time: 'one-time',
};

/** Translated billing interval ("month", "year", "one-time"); unknown values pass through. */
export function intervalLabel(interval: string): string {
  const key = INTERVAL_LABELS[interval];
  return key ? t(key) : interval;
}

export function isLiveSubscription(s: Subscription): boolean {
  return s.status === 'active' || s.status === 'trialing' || s.status === 'past_due';
}

export function fetchPricing(): Promise<PublicPricingResponse> {
  return apiClient.get<PublicPricingResponse>('/billing/pricing');
}

export function fetchSubscriptions(): Promise<UserSubscriptionResponse> {
  return apiClient.get<UserSubscriptionResponse>('/billing/subscriptions');
}

export function cancelSubscription(id: string): Promise<Subscription> {
  return apiClient.post<Subscription>(`/billing/subscriptions/${encodeURIComponent(id)}/cancel`);
}

export function fetchInvoices(): Promise<Invoice[]> {
  return apiClient.get<Invoice[]>('/billing/invoices');
}

export function fetchInvoice(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
  return apiClient.get<{ invoice: Invoice; items: InvoiceItem[] }>(`/billing/invoices/${encodeURIComponent(id)}`);
}

export function createCheckoutSession(input: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  promotionCode?: string;
}): Promise<CheckoutSession> {
  const body: Record<string, string> = {
    priceId: input.priceId,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
  };
  if (input.promotionCode) body.promotionCode = input.promotionCode;
  return apiClient.post<CheckoutSession>('/billing/checkout', body);
}

export function fetchCheckoutStatus(sessionId: string): Promise<CheckoutStatus> {
  return apiClient.get<CheckoutStatus>(`/billing/checkout/${encodeURIComponent(sessionId)}/status`);
}

export function fetchRecentCheckouts(): Promise<CheckoutStatus[]> {
  return apiClient.get<CheckoutStatus[]>('/billing/checkout/recent');
}

export function humanizeKey(key: string): string {
  const spaced = key.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  const sentence = spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
  // Keep well-known acronyms upper-case ("Ai teacher access" -> "AI teacher access").
  return sentence.replace(/\bai\b/gi, 'AI').replace(/\bAi\b/g, 'AI');
}

/** Translated label for a backend key such as `ai_teacher_access` or a status like `past_due`. */
export function keyLabel(key: string): string {
  return t(humanizeKey(key));
}

/** Same rules as Flutter pricing_page.dart `_includedFeatureLabels`. */
export function includedFeatureLabels(features: Record<string, unknown> | null | undefined): string[] {
  const labels: string[] = [];
  Object.entries(features ?? {}).forEach(([key, value]) => {
    const label = keyLabel(key);
    if (value === true) labels.push(label);
    else if (typeof value === 'number' && value !== 0) {
      labels.push(value < 0 ? t('Unlimited {label}', { label }) : t('{count} {label}', { count: formatNumber(value), label }));
    } else if (typeof value === 'string' && value) labels.push(t('{label}: {value}', { label, value: t(value) }));
  });
  return labels;
}
